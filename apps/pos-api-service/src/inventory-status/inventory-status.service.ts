import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import type { QueryInventoryStatusDto } from './schemas/query-inventory-status.schema';
import { ReportsAuditLogService } from '../reports-audit-log/audit-log.service';
import { JwtPayload } from '@ryzera/pos-schema';

// ─── Types ───────────────────────────────────────────────────────────────────

type StockStatus = 'InStock' | 'LowStock' | 'OutOfStock';

// ─── Exported interfaces ──────────────────────────────────────────────────────

export interface ClassifiedProduct {
  productName: string;
  category: { name: string } | null;
  supplier: { name: string } | null;
  currentStock: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  computedStatus: StockStatus;
  // Which single branch this row's stock came from. Only ever set for
  // all-branches detail rows (one row per product-branch pair) — never
  // a joined/merged list of names.
  branchLabel?: string;
}

export interface InventoryDetailRow {
  productName: string;
  category: string;
  supplier: string;
  currentStock: number;
  reorderLevel: number;
  currentStatus: StockStatus;
  costValue: number;
  sellingValue: number;
  branch?: string;
}

export interface InventoryKpi {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventoryValue: number;
}

export interface InventoryBranchResult {
  branch: { id: number; name: string };
  kpi: InventoryKpi;
  inventoryDetails: InventoryDetailRow[];
}

// ─── PDF column definitions ───────────────────────────────────────────────────
// Split into a fixed base set + an optional Branch column, so exportPdf
// can render either set depending on whether it's an all-branches export.

const PDF_BASE_COLS = [
  { label: 'Product Name', key: 'productName', width: 150 },
  { label: 'Category', key: 'category', width: 95 },
  { label: 'Supplier', key: 'supplier', width: 110 },
  { label: 'Current Stock', key: 'currentStock', width: 75 },
  { label: 'Reorder Level', key: 'reorderLevel', width: 75 },
  { label: 'Status', key: 'currentStatus', width: 75 },
  { label: 'Cost Value', key: 'costValue', width: 85 },
  { label: 'Selling Value', key: 'sellingValue', width: 86 },
] as const;

const PDF_BRANCH_COL = { label: 'Branch', key: 'branch', width: 110 } as const;

const PDF_STATUS_COLORS: Record<StockStatus, string> = {
  InStock: '#27AE60',
  LowStock: '#E67E22',
  OutOfStock: '#E74C3C',
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class InventoryStatusService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly auditLogService: ReportsAuditLogService,
  ) {}

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private resolveStatus(
      currentStock: number,
      reorderLevel: number,
  ): StockStatus {
    if (currentStock <= 0) return 'OutOfStock';
    if (currentStock <= reorderLevel) return 'LowStock';
    return 'InStock';
  }

  private readonly productInclude = {
    product: {
      include: {
        category: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    },
  } as const;

  /**
   * Where-clause builder for BranchProduct.
   * FIX: branchId is an integer (Branch.id). The BranchProduct column
   * is branch_id (Int), so filter with { branch_id: branchId }.
   */
  private buildBranchProductWhere(options: {
    branchId?: number;
    category?: string;
  }) {
    return {
      // FIX: BranchProduct.branch_id is an Int
      ...(options.branchId !== undefined
          ? { branch_id: options.branchId }
          : {}),
      product: {
        status: 'ACTIVE' as const,
        ...(options.category
            ? {
              category: {
                name: {
                  contains: options.category,
                  mode: 'insensitive' as const,
                },
              },
            }
            : {}),
      },
    };
  }

  // ─── Product classification: single branch ────────────────────────────────

  /**
   * FIX: branchId is an integer (Branch.id).
   * Uses min_quantity as the reorder threshold (schema field name).
   * Uses cost_price as the cost (schema field name).
   */
  private async classifyByBranch(
      branchId: number,
      category?: string,
  ): Promise<ClassifiedProduct[]> {
    const rows = await this.prisma.branchProduct.findMany({
      where: this.buildBranchProductWhere({ branchId, category }),
      include: this.productInclude,
      orderBy: { product: { name: 'asc' } },
    });

    return rows.map((bp) => ({
      productName: bp.product.name,
      category: bp.product.category,
      supplier: bp.product.supplier,
      currentStock: bp.stockQty,
      // FIX: schema field is min_quantity, not minStock
      reorderLevel: bp.product.min_quantity,
      // FIX: schema field is cost_price, not costPrice
      costPrice: Number(bp.product.cost_price ?? 0),
      sellingPrice: Number(bp.product.price),
      // FIX: use min_quantity for threshold check
      computedStatus: this.resolveStatus(bp.stockQty, bp.product.min_quantity),
    }));
  }

  // ─── Raw fetch: every (product, branch) row matching the filters ─────────
  // Used as the single source of truth for the all-branches view — both
  // the merged KPI numbers and the flat per-branch detail rows are derived
  // from this same result set, so only one DB round trip is needed.

  private async fetchAllBranchProductRows(category?: string) {
    return this.prisma.branchProduct.findMany({
      where: this.buildBranchProductWhere({ category }),
      include: {
        ...this.productInclude,
        branch: { select: { name: true } },
      },
      orderBy: [{ product: { name: 'asc' } }, { branch: { name: 'asc' } }],
    });
  }

  // ─── Merge raw rows into one entry per product (worst-status wins) ───────
  // Used ONLY for the KPI cards (Total Products / In Stock / etc). Never
  // used for the detail table — that stays unmerged so each row has a
  // single, clean branch name instead of a joined list.

  private mergeAcrossBranches(
      rows: Awaited<
          ReturnType<InventoryStatusService['fetchAllBranchProductRows']>
      >,
  ): ClassifiedProduct[] {
    const STATUS_PRIORITY: Record<StockStatus, number> = {
      InStock: 0,
      LowStock: 1,
      OutOfStock: 2,
    };

    // Use product_id (Int) as the map key
    const productMap: Record<number, ClassifiedProduct> = {};

    for (const bp of rows) {
      // FIX: use product_id (snake_case Int field)
      const pid = bp.product_id;
      // FIX: use min_quantity for threshold check
      const branchStatus = this.resolveStatus(
          bp.stockQty,
          bp.product.min_quantity,
      );

      if (!productMap[pid]) {
        productMap[pid] = {
          productName: bp.product.name,
          category: bp.product.category,
          supplier: bp.product.supplier,
          currentStock: 0,
          // FIX: schema field is min_quantity
          reorderLevel: bp.product.min_quantity,
          // FIX: schema field is cost_price
          costPrice: Number(bp.product.cost_price ?? 0),
          sellingPrice: Number(bp.product.price),
          computedStatus: 'InStock',
        };
      }

      productMap[pid].currentStock += bp.stockQty;

      if (
          STATUS_PRIORITY[branchStatus] >
          STATUS_PRIORITY[productMap[pid].computedStatus]
      ) {
        productMap[pid].computedStatus = branchStatus;
      }
    }

    return Object.values(productMap);
  }

  // ─── Flatten raw rows into one entry per (product, branch) pair ──────────
  // Used for the all-branches DETAIL TABLE. Each row keeps exactly one
  // branch name — no merging, no joining — matching the Per Branch tab's
  // behavior but combined into a single table.

  private flattenAcrossBranches(
      rows: Awaited<
          ReturnType<InventoryStatusService['fetchAllBranchProductRows']>
      >,
  ): ClassifiedProduct[] {
    return rows.map((bp) => ({
      productName: bp.product.name,
      category: bp.product.category,
      supplier: bp.product.supplier,
      currentStock: bp.stockQty,
      reorderLevel: bp.product.min_quantity,
      costPrice: Number(bp.product.cost_price ?? 0),
      sellingPrice: Number(bp.product.price),
      computedStatus: this.resolveStatus(bp.stockQty, bp.product.min_quantity),
      branchLabel: bp.branch.name,
    }));
  }

  // ─── KPI aggregator ───────────────────────────────────────────────────────

  private buildKpi(classified: ClassifiedProduct[]): InventoryKpi {
    return {
      totalProducts: classified.length,
      inStock: classified.filter((p) => p.computedStatus === 'InStock').length,
      lowStock: classified.filter((p) => p.computedStatus === 'LowStock')
          .length,
      outOfStock: classified.filter((p) => p.computedStatus === 'OutOfStock')
          .length,
      totalInventoryValue: parseFloat(
          classified
              .reduce((sum, p) => sum + p.costPrice * p.currentStock, 0)
              .toFixed(2),
      ),
    };
  }

  // ─── Row mapper ───────────────────────────────────────────────────────────
  // branchName defaults to p.branchLabel (set by flattenAcrossBranches)
  // when the caller doesn't pass an explicit override.

  private toDetailRow(
      p: ClassifiedProduct,
      branchName?: string,
  ): InventoryDetailRow {
    const resolvedBranch = branchName ?? p.branchLabel;
    return {
      productName: p.productName,
      category: p.category?.name ?? 'Unknown',
      supplier: p.supplier?.name ?? 'Unknown',
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      currentStatus: p.computedStatus,
      costValue: parseFloat((p.costPrice * p.currentStock).toFixed(2)),
      sellingValue: parseFloat((p.sellingPrice * p.currentStock).toFixed(2)),
      ...(resolvedBranch ? { branch: resolvedBranch } : {}),
    };
  }

  private buildFilterSummary(dto: {
    category?: string;
    stockStatus?: string;
  }): string {
    const parts: string[] = [];
    if (dto.category) parts.push(dto.category);
    if (dto.stockStatus) parts.push(`Status: ${dto.stockStatus}`);
    return parts.join(', ') || 'All';
  }

  // ─── Shared query helper: all-branches / single-branch ───────────────────
  // category stays optional throughout — omitting it means "all
  // categories", not "no data".
  //
  // - Single branch (dto.branchId set): one row per product, as before.
  // - All branches (dto.branchId undefined): fetch once, then derive
  //   TWO different views from the same rows —
  //     • KPI cards  -> merged per product (mergeAcrossBranches)
  //     • Detail rows -> NOT merged, one row per (product, branch)
  //       (flattenAcrossBranches), each with a single clean branch name.

  private async getFilteredDetails(dto: QueryInventoryStatusDto): Promise<{
    kpi: InventoryKpi | null;
    inventoryDetails: InventoryDetailRow[];
  }> {
    if (dto.branchId) {
      const classified = await this.classifyByBranch(
          dto.branchId,
          dto.category,
      );
      const kpi = this.buildKpi(classified);
      const filtered = dto.stockStatus
          ? classified.filter((p) => p.computedStatus === dto.stockStatus)
          : classified;
      return {
        kpi,
        inventoryDetails: filtered.map((p) => this.toDetailRow(p)),
      };
    }

    const rawRows = await this.fetchAllBranchProductRows(dto.category);

    const merged = this.mergeAcrossBranches(rawRows);
    const kpi = this.buildKpi(merged);

    const flatRows = this.flattenAcrossBranches(rawRows);
    const filteredFlat = dto.stockStatus
        ? flatRows.filter((p) => p.computedStatus === dto.stockStatus)
        : flatRows;

    return {
      kpi,
      inventoryDetails: filteredFlat.map((p) => this.toDetailRow(p)),
    };
  }

  // ─── Shared query helper: one specific branch by id ──────────────────────

  private async getFilteredDetailsForBranch(
      branchId: number,
      dto: QueryInventoryStatusDto,
  ): Promise<{
    branchName: string;
    kpi: InventoryKpi;
    inventoryDetails: InventoryDetailRow[];
  }> {
    // FIX: use this.prisma.branch (not invBranch)
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true },
    });

    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found.`);
    }

    const classified = await this.classifyByBranch(branchId, dto.category);
    const kpi = this.buildKpi(classified);

    const filtered = dto.stockStatus
        ? classified.filter((p) => p.computedStatus === dto.stockStatus)
        : classified;

    return {
      branchName: branch.name,
      kpi,
      // Per-branch view never shows a Branch column — every row is
      // already that one branch (shown as the section/table title).
      inventoryDetails: filtered.map((p) => this.toDetailRow(p)),
    };
  }

  // ─── PDF helpers ──────────────────────────────────────────────────────────

  private readonly PDF_PAGE_WIDTH = 841.89;
  private readonly PDF_MARGIN = 40;
  private readonly PDF_TABLE_WIDTH = 841.89 - 40 * 2;
  private readonly PDF_ROW_HEIGHT = 22;
  private readonly PDF_HEADER_H = 26;

  private createPdfDoc(): { doc: any; buffers: Buffer[] } {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require('pdfkit');
    const buffers: Buffer[] = [];
    const doc = new PDFDocument({
      margin: this.PDF_MARGIN,
      size: 'A4',
      layout: 'landscape',
    });
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    return { doc, buffers };
  }

  private drawPdfRow(
      doc: any,
      y: number,
      rowData: Record<string, string>,
      isHeader: boolean,
      shaded: boolean,
      cols: readonly { label: string; key: string; width: number }[],
  ): void {
    const { PDF_MARGIN, PDF_TABLE_WIDTH, PDF_ROW_HEIGHT, PDF_HEADER_H } = this;

    if (isHeader) {
      doc.rect(PDF_MARGIN, y, PDF_TABLE_WIDTH, PDF_HEADER_H).fill('#2C3E50');
    } else if (shaded) {
      doc.rect(PDF_MARGIN, y, PDF_TABLE_WIDTH, PDF_ROW_HEIGHT).fill('#F2F4F6');
    }

    let x = PDF_MARGIN;
    for (const col of cols) {
      const cellH = isHeader ? PDF_HEADER_H : PDF_ROW_HEIGHT;
      const value = isHeader ? col.label : String(rowData[col.key] ?? '');
      const isStatusCell = !isHeader && col.key === 'currentStatus';
      const textColor = isHeader
          ? '#FFFFFF'
          : isStatusCell
              ? (PDF_STATUS_COLORS[value as StockStatus] ?? '#1A1A1A')
              : '#1A1A1A';

      doc
          .rect(x, y, col.width, cellH)
          .strokeColor('#CCCCCC')
          .lineWidth(0.5)
          .stroke();
      doc
          .fillColor(textColor)
          .fontSize(isHeader ? 8.5 : 8)
          .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .text(value, x + 5, y + (cellH - (isHeader ? 9 : 8)) / 2 + 1, {
            width: col.width - 10,
            ellipsis: true,
            lineBreak: false,
          });
      x += col.width;
    }
  }

  private drawPdfHeader(doc: any, kpi: InventoryKpi, subtitle: string): number {
    const { PDF_PAGE_WIDTH, PDF_MARGIN, PDF_TABLE_WIDTH } = this;

    doc.rect(0, 0, PDF_PAGE_WIDTH, 70).fill('#2C3E50');
    doc
        .fillColor('#FFFFFF')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Inventory Status Report', PDF_MARGIN, 16, {
          align: 'center',
          width: PDF_TABLE_WIDTH,
        });
    doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#BDC3C7')
        .text(subtitle, PDF_MARGIN, 44, {
          align: 'center',
          width: PDF_TABLE_WIDTH,
        });

    doc.rect(0, 70, PDF_PAGE_WIDTH, 36).fill('#1A252F');
    const kpiItems = [
      { label: 'Total Products', value: String(kpi.totalProducts) },
      { label: 'In Stock', value: String(kpi.inStock) },
      { label: 'Low Stock', value: String(kpi.lowStock) },
      { label: 'Out of Stock', value: String(kpi.outOfStock) },
      {
        label: 'Total Inventory Value',
        value: `Rs ${kpi.totalInventoryValue.toFixed(2)}`,
      },
    ];
    const kpiW = PDF_TABLE_WIDTH / kpiItems.length;
    kpiItems.forEach((k, i) => {
      const kx = PDF_MARGIN + i * kpiW;
      doc
          .fillColor('#BDC3C7')
          .fontSize(7)
          .font('Helvetica')
          .text(k.label, kx, 76, { width: kpiW, align: 'center' });
      doc
          .fillColor('#FFFFFF')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(k.value, kx, 87, { width: kpiW, align: 'center' });
    });

    return 118;
  }

  private drawPdfFooter(doc: any): void {
    const { PDF_MARGIN, PDF_PAGE_WIDTH, PDF_TABLE_WIDTH } = this;
    const footerY = (doc.page.height as number) - 28;
    doc
        .moveTo(PDF_MARGIN, footerY)
        .lineTo(PDF_PAGE_WIDTH - PDF_MARGIN, footerY)
        .strokeColor('#CCCCCC')
        .lineWidth(0.5)
        .stroke();
    doc
        .fillColor('#999999')
        .fontSize(7)
        .font('Helvetica')
        .text(
            `Generated: ${new Date().toDateString()}   |   Ryzera POS`,
            PDF_MARGIN,
            footerY + 6,
            { align: 'center', width: PDF_TABLE_WIDTH },
        );
  }

  private writeTableRows(
      doc: any,
      rows: InventoryDetailRow[],
      startY: number,
      cols: readonly { label: string; key: string; width: number }[],
  ): void {
    const { PDF_MARGIN, PDF_ROW_HEIGHT, PDF_HEADER_H } = this;
    let y = startY;

    this.drawPdfRow(doc, y, {} as Record<string, string>, true, false, cols);
    y += PDF_HEADER_H;

    for (const [i, row] of rows.entries()) {
      if (y + PDF_ROW_HEIGHT > (doc.page.height as number) - PDF_MARGIN) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: PDF_MARGIN });
        y = PDF_MARGIN;
        this.drawPdfRow(
            doc,
            y,
            {} as Record<string, string>,
            true,
            false,
            cols,
        );
        y += PDF_HEADER_H;
      }
      this.drawPdfRow(
          doc,
          y,
          {
            productName: row.productName,
            category: row.category,
            supplier: row.supplier,
            currentStock: String(row.currentStock),
            reorderLevel: String(row.reorderLevel),
            currentStatus: row.currentStatus,
            costValue: row.costValue.toFixed(2),
            sellingValue: row.sellingValue.toFixed(2),
            branch: row.branch ?? '',
          },
          false,
          i % 2 === 0,
          cols,
      );
      y += PDF_ROW_HEIGHT;
    }
  }

  private finalisePdf(doc: any, buffers: Buffer[]): Promise<Buffer> {
    doc.end();
    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) =>
          reject(new InternalServerErrorException(err.message)),
      );
    });
  }

  // =========================================================================
  // PUBLIC METHODS
  // =========================================================================

  async getInventoryStatus(dto: QueryInventoryStatusDto) {
    const { kpi, inventoryDetails } = await this.getFilteredDetails(dto);
    return { kpi, inventoryDetails };
  }

  // ─── Per-branch breakdown ─────────────────────────────────────────────────

  async getInventoryByBranch(dto: QueryInventoryStatusDto) {
    // FIX: use this.prisma.branch (not invBranch — that model doesn't exist)
    // FIX: renamed variable to 'allBranches' to avoid block-scope redeclaration
    const allBranches = await this.prisma.branch.findMany({
      where: { is_active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // FIX: renamed from 'branches' to 'branchResults' to avoid redeclaration
    const branchResults = await Promise.all(
        allBranches.map(async (branch) => {
          const classified = await this.classifyByBranch(branch.id, dto.category);
          const kpi = this.buildKpi(classified);
          const filtered = dto.stockStatus
              ? classified.filter((p) => p.computedStatus === dto.stockStatus)
              : classified;
          return {
            branch: { id: branch.id, name: branch.name },
            kpi,
            inventoryDetails: filtered.map((p) => this.toDetailRow(p)),
          };
        }),
    );

    return { branches: branchResults };
  }

  // ─── All-branches / single-branch CSV export ──────────────────────────────
  // Adds a "Branch" column when this is an all-branches export
  // (dto.branchId is undefined). Each row now carries one clean branch
  // name via getFilteredDetails' flattening, so no extra work needed here.

  async exportCsv(
      dto: QueryInventoryStatusDto,
      user: JwtPayload,
  ): Promise<Buffer> {
    const { inventoryDetails } = await this.getFilteredDetails(dto);
    const includeBranch = !dto.branchId;

    const headers = [
      'Product Name',
      'Category',
      'Supplier',
      'Current Stock',
      'Reorder Level',
      'Current Status',
      'Cost Value (Rs)',
      'Selling Value (Rs)',
      ...(includeBranch ? ['Branch'] : []),
    ];
    const rows = inventoryDetails.map((r) =>
        [
          r.productName,
          r.category,
          r.supplier,
          r.currentStock,
          r.reorderLevel,
          r.currentStatus,
          r.costValue.toFixed(2),
          r.sellingValue.toFixed(2),
          ...(includeBranch ? [r.branch ?? ''] : []),
        ]
            .map((v) => `"${v}"`)
            .join(','),
    );

    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported CSV',
      reportType: 'Inventory Status Report',
      filtersUsed: this.buildFilterSummary(dto),
      branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All',
      branchId: dto.branchId ?? null,
    });

    return Buffer.from([headers.join(','), ...rows].join('\n'), 'utf-8');
  }

  // ─── All-branches / single-branch PDF export ──────────────────────────────
  // Builds the column set based on whether this is an all-branches export,
  // and passes it into drawPdfHeader/writeTableRows. Each row now carries
  // one clean branch name, so the column fits without overlap.

  async exportPdf(
      dto: QueryInventoryStatusDto,
      user: JwtPayload,
  ): Promise<Buffer> {
    const { doc, buffers } = this.createPdfDoc();
    const { kpi, inventoryDetails } = await this.getFilteredDetails(dto);
    const includeBranch = !dto.branchId;
    const cols = includeBranch
      ? [...PDF_BASE_COLS, PDF_BRANCH_COL]
      : PDF_BASE_COLS;

    const subtitle = [
      `Generated: ${new Date().toDateString()}`,
      dto.category ? `Category: ${dto.category}` : null,
      dto.stockStatus ? `Status: ${dto.stockStatus}` : null,
    ]
      .filter(Boolean)
      .join('   |   ');

    if (!kpi || inventoryDetails.length === 0) {
      doc.text('No inventory data available for the selected filters.');
    } else {
      const startY = this.drawPdfHeader(doc, kpi, subtitle);
      this.writeTableRows(doc, inventoryDetails, startY, cols);
      this.drawPdfFooter(doc);
    }

    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported PDF',
      reportType: 'Inventory Status Report',
      filtersUsed: this.buildFilterSummary(dto),
      branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All',
      branchId: dto.branchId ?? null,
    });

    return this.finalisePdf(doc, buffers);
  }

  // ─── Per-branch CSV export ────────────────────────────────────────────────
  // Unchanged — every row already belongs to the one branch named in the
  // filename/subtitle, so a per-row Branch column would be redundant.

  async exportBranchCsv(
      branchId: number,
      dto: QueryInventoryStatusDto,
      user: JwtPayload,
  ): Promise<Buffer> {
    const { branchName, inventoryDetails } =
        await this.getFilteredDetailsForBranch(branchId, dto);

    const headers = [
      'Product Name',
      'Category',
      'Supplier',
      'Current Stock',
      'Reorder Level',
      'Current Status',
      'Cost Value (Rs)',
      'Selling Value (Rs)',
    ];
    const rows = inventoryDetails.map((r) =>
        [
          r.productName,
          r.category,
          r.supplier,
          r.currentStock,
          r.reorderLevel,
          r.currentStatus,
          r.costValue.toFixed(2),
          r.sellingValue.toFixed(2),
        ]
            .map((v) => `"${v}"`)
            .join(','),
    );

    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported CSV',
      reportType: 'Inventory Status Report',
      filtersUsed: this.buildFilterSummary(dto),
      branchName,
      branchId,
    });

    return Buffer.from([headers.join(','), ...rows].join('\n'), 'utf-8');
  }

  // ─── Per-branch PDF export ────────────────────────────────────────────────
  // Unchanged — same reasoning as exportBranchCsv above.

  async exportBranchPdf(
      branchId: number,
      dto: QueryInventoryStatusDto,
      user: JwtPayload,
  ): Promise<Buffer> {
    const { doc, buffers } = this.createPdfDoc();
    const { branchName, kpi, inventoryDetails } =
        await this.getFilteredDetailsForBranch(branchId, dto);

    const subtitle = [
      `Branch: ${branchName}`,
      `Generated: ${new Date().toDateString()}`,
      dto.category ? `Category: ${dto.category}` : null,
      dto.stockStatus ? `Status: ${dto.stockStatus}` : null,
    ]
        .filter(Boolean)
        .join('   |   ');

    if (inventoryDetails.length === 0) {
      doc.text(`No inventory data available for ${branchName}.`);
    } else {
      const startY = this.drawPdfHeader(doc, kpi, subtitle);
      this.writeTableRows(doc, inventoryDetails, startY, PDF_BASE_COLS);
      this.drawPdfFooter(doc);
    }

    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported PDF',
      reportType: 'Inventory Status Report',
      filtersUsed: this.buildFilterSummary(dto),
      branchName,
      branchId,
    });

    return this.finalisePdf(doc, buffers);
  }
}