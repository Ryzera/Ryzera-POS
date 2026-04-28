// ============================================================
// Inventory Status Service
// File: src/inventory-status/inventory-status.service.ts
//
// Data model overview:
//  • All-branches view  → stock is SUMMED per product across all branches.
//    A product that is low in one branch but has surplus in another may
//    appear "In Stock" in the combined view. This is intentional: the
//    All Branches tab shows network-wide inventory health.
//
//  • Per-branch view    → each branch is evaluated independently, so
//    "Low Stock" counts correctly reflect that branch's own stock level
//    against its own reorder threshold.
//
//  • Export routes:
//    /export/csv  and /export/pdf         → all-branches or single-branch.
//    /export/branch/csv and /export/branch/pdf → ONE specific InvBranch
//    (identified by its UUID). Used by the per-branch tab so each branch
//    table exports exactly its own matching data.
//
//  • Branch ID resolution: auth system uses integer IDs (Branch.branchId);
//    inventory system uses UUID IDs (InvBranch.id). Resolution is done
//    by name-based lookup — both tables share branch names.
// ============================================================

import {
    Injectable,
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService }      from '@ryzera/pos-database';
import type { QueryInventoryStatusDto } from './schemas/query-inventory-status.schema';
import { AuditLogService }    from '../audit-log/audit-log.service';
import type { JwtPayload }    from '../common/interfaces/jwt-payload.interface';

// ─── Types ───────────────────────────────────────────────────────────────────

type StockStatus = 'InStock' | 'LowStock' | 'OutOfStock';

// ─── Exported interfaces (consumed by controller / tests) ────────────────────

export interface ClassifiedProduct {
    productName:    string;
    category:       { name: string } | null;
    supplier:       { name: string } | null;
    currentStock:   number;
    reorderLevel:   number;
    costPrice:      number;
    sellingPrice:   number;
    computedStatus: StockStatus;
}

export interface InventoryDetailRow {
    productName:   string;
    category:      string;
    supplier:      string;
    currentStock:  number;
    reorderLevel:  number;
    currentStatus: StockStatus;
    /** Cost price × current stock, rounded to 2 d.p. */
    costValue:     number;
    /** Selling price × current stock, rounded to 2 d.p. */
    sellingValue:  number;
    /** Populated in the all-branches aggregated view. */
    branch?:       string;
}

export interface InventoryKpi {
    totalProducts:       number;
    inStock:             number;
    lowStock:            number;
    outOfStock:          number;
    totalInventoryValue: number;
}

export interface InventoryBranchResult {
    branch:           { id: string; name: string };
    kpi:              InventoryKpi;
    inventoryDetails: InventoryDetailRow[];
}

// ─── PDF column definitions ───────────────────────────────────────────────────

const PDF_COLS = [
    { label: 'Product Name',  key: 'productName',   width: 160 },
    { label: 'Category',      key: 'category',      width: 100 },
    { label: 'Supplier',      key: 'supplier',      width: 120 },
    { label: 'Current Stock', key: 'currentStock',  width:  80 },
    { label: 'Reorder Level', key: 'reorderLevel',  width:  80 },
    { label: 'Status',        key: 'currentStatus', width:  80 },
    { label: 'Cost Value',    key: 'costValue',     width:  90 },
    { label: 'Selling Value', key: 'sellingValue',  width:  91 },
] as const;

const PDF_STATUS_COLORS: Record<StockStatus, string> = {
    InStock:    '#27AE60',
    LowStock:   '#E67E22',
    OutOfStock: '#E74C3C',
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class InventoryStatusService {

    constructor(
        private readonly prisma:          PrismaService,
        private readonly auditLogService: AuditLogService,
    ) {}

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    // ─── Stock status classifier ──────────────────────────────────────────────

    private resolveStatus(currentStock: number, reorderLevel: number): StockStatus {
        if (currentStock <= 0)            return 'OutOfStock';
        if (currentStock <= reorderLevel) return 'LowStock';
        return 'InStock';
    }

    // ─── Shared Prisma include for BranchProduct queries ─────────────────────

    private readonly productInclude = {
        product: {
            include: {
                category: { select: { name: true } },
                supplier: { select: { name: true } },
            },
        },
    } as const;

    // ─── Where-clause builder for BranchProduct ───────────────────────────────

    private buildBranchProductWhere(options: {
        /** InvBranch UUID. Omit to query across all branches. */
        branchId?: string;
        category?: string;
    }) {
        return {
            ...(options.branchId ? { branchId: options.branchId } : {}),
            product: {
                status: 'ACTIVE' as const,
                ...(options.category
                    ? {
                        category: {
                            name: { contains: options.category, mode: 'insensitive' as const },
                        },
                    }
                    : {}),
            },
        };
    }

    // ─── Branch ID resolution ─────────────────────────────────────────────────
    //
    // The auth system uses integer branch IDs (Branch.branchId).
    // The inventory system uses UUID branch IDs (InvBranch.id).
    // Both systems share branch *names*, so resolution is done by name lookup.

    private async resolveInvBranchByAuthId(authBranchId: number): Promise<string> {
        const authBranch = await this.prisma.branch.findUnique({
            where:  { branchId: authBranchId },
            select: { name: true },
        });

        if (!authBranch) {
            throw new NotFoundException(`Auth branch ${authBranchId} not found.`);
        }

        const invBranch = await this.prisma.invBranch.findFirst({
            where: {
                name:   { equals: authBranch.name, mode: 'insensitive' },
                status: 'ACTIVE',
            },
            select: { id: true },
        });

        if (!invBranch) {
            throw new BadRequestException(
                `No active inventory branch matching auth branch "${authBranch.name}".`,
            );
        }

        return invBranch.id;
    }

    // ─── Product classification: single branch ────────────────────────────────

    /**
     * Fetch and classify BranchProduct rows for ONE specific InvBranch UUID.
     * Each product's status is evaluated against its own reorder threshold for
     * this branch only — no cross-branch aggregation.
     */
    private async classifyByBranch(
        invBranchId: string,
        category?:   string,
    ): Promise<ClassifiedProduct[]> {
        const rows = await this.prisma.branchProduct.findMany({
            where:   this.buildBranchProductWhere({ branchId: invBranchId, category }),
            include: this.productInclude,
            orderBy: { product: { name: 'asc' } },
        });

        return rows.map(bp => ({
            productName:    bp.product.name,
            category:       bp.product.category,
            supplier:       bp.product.supplier,
            currentStock:   bp.stockQty,
            reorderLevel:   bp.product.minStock,
            costPrice:      Number(bp.product.costPrice ?? 0),
            sellingPrice:   Number(bp.product.price),
            computedStatus: this.resolveStatus(bp.stockQty, bp.product.minStock),
        }));
    }

    // ─── Product classification: all branches (aggregated) ───────────────────

    /**
     * Fetch all BranchProduct rows across every branch and AGGREGATE stock
     * per product so the "All Branches" view shows combined network totals.
     *
     * ⚠️  Because stock is summed, a product that is low in one branch but
     * has surplus in another will appear "In Stock" here. This is intentional —
     * the All Branches view reflects network-wide health. Use the Per Branch
     * tab to diagnose individual branch stock levels.
     */
    // ─── Product classification: all branches (Option B — worst-status wins) ─────

    /**
     * Fetch all BranchProduct rows across every branch and AGGREGATE stock
     * per product for display totals.
     *
     * Option B behaviour: computedStatus is the WORST status any single branch
     * has for this product. If ANY branch is LowStock or OutOfStock, the
     * All Branches view reflects that — so the super admin's KPI cards and
     * table always surface branch-level problems without needing to switch tabs.
     *
     * currentStock still shows the network total (sum across branches).
     *
     * Status priority: OutOfStock > LowStock > InStock
     */
    private async classifyAllBranches(category?: string): Promise<ClassifiedProduct[]> {
        const rows = await this.prisma.branchProduct.findMany({
            where:   this.buildBranchProductWhere({ category }),
            include: this.productInclude,
            orderBy: { product: { name: 'asc' } },
        });

        // ── Status priority map (higher = worse) ─────────────────────────────
        const STATUS_PRIORITY: Record<StockStatus, number> = {
            InStock:    0,
            LowStock:   1,
            OutOfStock: 2,
        };

        const productMap: Record<string, ClassifiedProduct> = {};

        for (const bp of rows) {
            const pid           = bp.productId;
            const branchStatus  = this.resolveStatus(bp.stockQty, bp.product.minStock);

            if (!productMap[pid]) {
                productMap[pid] = {
                    productName:    bp.product.name,
                    category:       bp.product.category,
                    supplier:       bp.product.supplier,
                    currentStock:   0,
                    reorderLevel:   bp.product.minStock,
                    costPrice:      Number(bp.product.costPrice ?? 0),
                    sellingPrice:   Number(bp.product.price),
                    computedStatus: 'InStock', // will be updated below
                };
            }

            // Accumulate network total stock
            productMap[pid].currentStock += bp.stockQty;

            // Promote status if this branch is worse
            if (
                STATUS_PRIORITY[branchStatus] >
                STATUS_PRIORITY[productMap[pid].computedStatus]
            ) {
                productMap[pid].computedStatus = branchStatus;
            }
        }

        return Object.values(productMap);
    }

    // ─── KPI aggregator ───────────────────────────────────────────────────────

    private buildKpi(classified: ClassifiedProduct[]): InventoryKpi {
        return {
            totalProducts:       classified.length,
            inStock:             classified.filter(p => p.computedStatus === 'InStock').length,
            lowStock:            classified.filter(p => p.computedStatus === 'LowStock').length,
            outOfStock:          classified.filter(p => p.computedStatus === 'OutOfStock').length,
            totalInventoryValue: parseFloat(
                classified
                    .reduce((sum, p) => sum + p.costPrice * p.currentStock, 0)
                    .toFixed(2),
            ),
        };
    }

    // ─── Row mapper ───────────────────────────────────────────────────────────

    private toDetailRow(p: ClassifiedProduct, branchName?: string): InventoryDetailRow {
        return {
            productName:   p.productName,
            category:      p.category?.name  ?? 'Unknown',
            supplier:      p.supplier?.name  ?? 'Unknown',
            currentStock:  p.currentStock,
            reorderLevel:  p.reorderLevel,
            currentStatus: p.computedStatus,
            costValue:     parseFloat((p.costPrice    * p.currentStock).toFixed(2)),
            sellingValue:  parseFloat((p.sellingPrice * p.currentStock).toFixed(2)),
            ...(branchName ? { branch: branchName } : {}),
        };
    }

    // ─── Filter summary (for audit log) ──────────────────────────────────────

    private buildFilterSummary(dto: {
        category?:    string;
        stockStatus?: string;
    }): string {
        const parts: string[] = [];
        if (dto.category)    parts.push(dto.category);
        if (dto.stockStatus) parts.push(`Status: ${dto.stockStatus}`);
        return parts.join(', ') || 'All';
    }

    // ─── Shared query helper: all-branches / single-branch ───────────────────

    /**
     * Shared by getInventoryStatus, exportCsv, and exportPdf.
     * Returns KPI + filtered rows for the given DTO.
     * Guarantees the table and its matching export always show identical data.
     */
    private async getFilteredDetails(dto: QueryInventoryStatusDto): Promise<{
        kpi:              InventoryKpi | null;
        inventoryDetails: InventoryDetailRow[];
    }> {
        if (!dto.category) {
            return { kpi: null, inventoryDetails: [] };
        }

        const classified = dto.branchId
            ? await this.classifyByBranch(
                await this.resolveInvBranchByAuthId(dto.branchId),
                dto.category,
            )
            : await this.classifyAllBranches(dto.category);

        const kpi = this.buildKpi(classified);

        const filtered = dto.stockStatus
            ? classified.filter(p => p.computedStatus === dto.stockStatus)
            : classified;

        return {
            kpi,
            inventoryDetails: filtered.map(p => this.toDetailRow(p)),
        };
    }

    // ─── Shared query helper: one specific InvBranch UUID ────────────────────

    /**
     * Returns KPI + filtered rows for ONE InvBranch, identified by its UUID.
     * Used by the per-branch export endpoints — the UUID comes directly from
     * the by-branch API response so no auth-ID resolution is needed.
     */
    private async getFilteredDetailsForInvBranch(
        invBranchId: string,
        dto:         QueryInventoryStatusDto,
    ): Promise<{ branchName: string; kpi: InventoryKpi; inventoryDetails: InventoryDetailRow[] }> {
        const invBranch = await this.prisma.invBranch.findUnique({
            where:  { id: invBranchId },
            select: { name: true },
        });

        if (!invBranch) {
            throw new NotFoundException(`Inventory branch ${invBranchId} not found.`);
        }

        const classified = await this.classifyByBranch(invBranchId, dto.category);
        const kpi        = this.buildKpi(classified);

        const filtered = dto.stockStatus
            ? classified.filter(p => p.computedStatus === dto.stockStatus)
            : classified;

        return {
            branchName:       invBranch.name,
            kpi,
            inventoryDetails: filtered.map(p => this.toDetailRow(p)),
        };
    }

    // ─── PDF helpers ──────────────────────────────────────────────────────────

    private readonly PDF_PAGE_WIDTH  = 841.89;
    private readonly PDF_MARGIN      = 40;
    private readonly PDF_TABLE_WIDTH = 841.89 - 40 * 2;
    private readonly PDF_ROW_HEIGHT  = 22;
    private readonly PDF_HEADER_H    = 26;

    private createPdfDoc(): { doc: any; buffers: Buffer[] } {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const PDFDocument = require('pdfkit');
        const buffers: Buffer[] = [];
        const doc = new PDFDocument({ margin: this.PDF_MARGIN, size: 'A4', layout: 'landscape' });
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        return { doc, buffers };
    }

    private drawPdfRow(
        doc:      any,
        y:        number,
        rowData:  Record<string, string>,
        isHeader: boolean,
        shaded:   boolean,
    ): void {
        const { PDF_MARGIN, PDF_TABLE_WIDTH, PDF_ROW_HEIGHT, PDF_HEADER_H } = this;

        if (isHeader) {
            doc.rect(PDF_MARGIN, y, PDF_TABLE_WIDTH, PDF_HEADER_H).fill('#2C3E50');
        } else if (shaded) {
            doc.rect(PDF_MARGIN, y, PDF_TABLE_WIDTH, PDF_ROW_HEIGHT).fill('#F2F4F6');
        }

        let x = PDF_MARGIN;
        for (const col of PDF_COLS) {
            const cellH        = isHeader ? PDF_HEADER_H : PDF_ROW_HEIGHT;
            const value        = isHeader ? col.label : String(rowData[col.key] ?? '');
            const isStatusCell = !isHeader && col.key === 'currentStatus';
            const textColor    = isHeader
                ? '#FFFFFF'
                : isStatusCell
                    ? (PDF_STATUS_COLORS[value as StockStatus] ?? '#1A1A1A')
                    : '#1A1A1A';

            doc.rect(x, y, col.width, cellH).strokeColor('#CCCCCC').lineWidth(0.5).stroke();
            doc.fillColor(textColor)
                .fontSize(isHeader ? 8.5 : 8)
                .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                .text(value, x + 5, y + (cellH - (isHeader ? 9 : 8)) / 2 + 1, {
                    width: col.width - 10, ellipsis: true, lineBreak: false,
                });
            x += col.width;
        }
    }

    private drawPdfHeader(doc: any, kpi: InventoryKpi, subtitle: string): number {
        const { PDF_PAGE_WIDTH, PDF_MARGIN, PDF_TABLE_WIDTH } = this;

        doc.rect(0, 0, PDF_PAGE_WIDTH, 70).fill('#2C3E50');
        doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
            .text('Inventory Status Report', PDF_MARGIN, 16, {
                align: 'center', width: PDF_TABLE_WIDTH,
            });
        doc.fontSize(9).font('Helvetica').fillColor('#BDC3C7')
            .text(subtitle, PDF_MARGIN, 44, { align: 'center', width: PDF_TABLE_WIDTH });

        doc.rect(0, 70, PDF_PAGE_WIDTH, 36).fill('#1A252F');
        const kpiItems = [
            { label: 'Total Products',        value: String(kpi.totalProducts) },
            { label: 'In Stock',              value: String(kpi.inStock) },
            { label: 'Low Stock',             value: String(kpi.lowStock) },
            { label: 'Out of Stock',          value: String(kpi.outOfStock) },
            { label: 'Total Inventory Value', value: `Rs ${kpi.totalInventoryValue.toFixed(2)}` },
        ];
        const kpiW = PDF_TABLE_WIDTH / kpiItems.length;
        kpiItems.forEach((k, i) => {
            const kx = PDF_MARGIN + i * kpiW;
            doc.fillColor('#BDC3C7').fontSize(7).font('Helvetica')
                .text(k.label, kx, 76, { width: kpiW, align: 'center' });
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
                .text(k.value, kx, 87, { width: kpiW, align: 'center' });
        });

        return 118; // Y position where the table should start
    }

    private drawPdfFooter(doc: any): void {
        const { PDF_MARGIN, PDF_PAGE_WIDTH, PDF_TABLE_WIDTH } = this;
        const footerY = (doc.page.height as number) - 28;
        doc.moveTo(PDF_MARGIN, footerY)
            .lineTo(PDF_PAGE_WIDTH - PDF_MARGIN, footerY)
            .strokeColor('#CCCCCC').lineWidth(0.5).stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
            .text(
                `Generated: ${new Date().toDateString()}   |   Ryzera POS`,
                PDF_MARGIN, footerY + 6, { align: 'center', width: PDF_TABLE_WIDTH },
            );
    }

    private writeTableRows(doc: any, rows: InventoryDetailRow[], startY: number): void {
        const { PDF_MARGIN, PDF_ROW_HEIGHT, PDF_HEADER_H } = this;
        let y = startY;

        this.drawPdfRow(doc, y, {} as Record<string, string>, true, false);
        y += PDF_HEADER_H;

        for (const [i, row] of rows.entries()) {
            if (y + PDF_ROW_HEIGHT > (doc.page.height as number) - PDF_MARGIN) {
                doc.addPage({ size: 'A4', layout: 'landscape', margin: PDF_MARGIN });
                y = PDF_MARGIN;
                this.drawPdfRow(doc, y, {} as Record<string, string>, true, false);
                y += PDF_HEADER_H;
            }
            this.drawPdfRow(
                doc, y,
                {
                    productName:   row.productName,
                    category:      row.category,
                    supplier:      row.supplier,
                    currentStock:  String(row.currentStock),
                    reorderLevel:  String(row.reorderLevel),
                    currentStatus: row.currentStatus,
                    costValue:     row.costValue.toFixed(2),
                    sellingValue:  row.sellingValue.toFixed(2),
                },
                false, i % 2 === 0,
            );
            y += PDF_ROW_HEIGHT;
        }
    }

    private finalisePdf(doc: any, buffers: Buffer[]): Promise<Buffer> {
        doc.end();
        return new Promise((resolve, reject) => {
            doc.on('end',   () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err: Error) => reject(new InternalServerErrorException(err.message)));
        });
    }

    // =========================================================================
    // PUBLIC METHODS
    // =========================================================================

    // ─── All-branches / single-branch summary + table ─────────────────────────

    async getInventoryStatus(dto: QueryInventoryStatusDto) {
        if (!dto.category) {
            return {
                message:          'Please select a category to generate the report.',
                kpi:              null,
                inventoryDetails: [],
            };
        }
        const { kpi, inventoryDetails } = await this.getFilteredDetails(dto);
        return { kpi, inventoryDetails };
    }

    // ─── Per-branch breakdown (SUPER_ADMIN only) ──────────────────────────────

    async getInventoryByBranch(dto: QueryInventoryStatusDto) {
        if (!dto.category) {
            return { message: 'Please select a category to generate the report.', branches: [] };
        }

        const invBranches = await this.prisma.invBranch.findMany({
            where:   { status: 'ACTIVE' },
            select:  { id: true, name: true },
            orderBy: { name: 'asc' },
        });

        const branches = await Promise.all(
            invBranches.map(async invBranch => {
                const classified = await this.classifyByBranch(invBranch.id, dto.category);
                const kpi        = this.buildKpi(classified);
                const filtered   = dto.stockStatus
                    ? classified.filter(p => p.computedStatus === dto.stockStatus)
                    : classified;
                return {
                    branch:           { id: invBranch.id, name: invBranch.name },
                    kpi,
                    inventoryDetails: filtered.map(p => this.toDetailRow(p)),
                };
            }),
        );

        return { branches };
    }

    // ─── All-branches / single-branch CSV export ──────────────────────────────

    /** Matches getInventoryStatus exactly. */
    async exportCsv(dto: QueryInventoryStatusDto, user: JwtPayload): Promise<Buffer> {
        const { inventoryDetails } = await this.getFilteredDetails(dto);

        const headers = [
            'Product Name', 'Category', 'Supplier',
            'Current Stock', 'Reorder Level', 'Current Status',
            'Cost Value (Rs)', 'Selling Value (Rs)',
        ];
        const rows = inventoryDetails.map(r =>
            [r.productName, r.category, r.supplier, r.currentStock, r.reorderLevel,
                r.currentStatus, r.costValue.toFixed(2), r.sellingValue.toFixed(2)]
                .map(v => `"${v}"`).join(','),
        );

        void this.auditLogService.record({
            userId: user.userId, username: user.username, role: user.role,
            action: 'Exported CSV', reportType: 'Inventory Status Report',
            filtersUsed: this.buildFilterSummary(dto),
            branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All',
        });

        return Buffer.from([headers.join(','), ...rows].join('\n'), 'utf-8');
    }

    // ─── All-branches / single-branch PDF export ──────────────────────────────

    /** Matches getInventoryStatus exactly. */
    async exportPdf(dto: QueryInventoryStatusDto, user: JwtPayload): Promise<Buffer> {
        const { doc, buffers } = this.createPdfDoc();
        const { kpi, inventoryDetails } = await this.getFilteredDetails(dto);

        const subtitle = [
            `Generated: ${new Date().toDateString()}`,
            dto.category    ? `Category: ${dto.category}`    : null,
            dto.stockStatus ? `Status: ${dto.stockStatus}`   : null,
        ].filter(Boolean).join('   |   ');

        if (!kpi || inventoryDetails.length === 0) {
            doc.text('No data available. Please select a category.');
        } else {
            const startY = this.drawPdfHeader(doc, kpi, subtitle);
            this.writeTableRows(doc, inventoryDetails, startY);
            this.drawPdfFooter(doc);
        }

        void this.auditLogService.record({
            userId: user.userId, username: user.username, role: user.role,
            action: 'Exported PDF', reportType: 'Inventory Status Report',
            filtersUsed: this.buildFilterSummary(dto),
            branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All',
        });

        return this.finalisePdf(doc, buffers);
    }

    // ─── Per-branch CSV export (one specific InvBranch UUID) ─────────────────

    /**
     * Exports data for ONE InvBranch, identified by its UUID (taken from the
     * by-branch API response on the frontend). Matches that branch's table exactly.
     */
    async exportBranchCsv(
        invBranchId: string,
        dto:         QueryInventoryStatusDto,
        user:        JwtPayload,
    ): Promise<Buffer> {
        const { branchName, inventoryDetails } =
            await this.getFilteredDetailsForInvBranch(invBranchId, dto);

        const headers = [
            'Product Name', 'Category', 'Supplier',
            'Current Stock', 'Reorder Level', 'Current Status',
            'Cost Value (Rs)', 'Selling Value (Rs)',
        ];
        const rows = inventoryDetails.map(r =>
            [r.productName, r.category, r.supplier, r.currentStock, r.reorderLevel,
                r.currentStatus, r.costValue.toFixed(2), r.sellingValue.toFixed(2)]
                .map(v => `"${v}"`).join(','),
        );

        void this.auditLogService.record({
            userId: user.userId, username: user.username, role: user.role,
            action: 'Exported CSV', reportType: 'Inventory Status Report',
            filtersUsed: this.buildFilterSummary(dto),
            branchName,
        });

        return Buffer.from([headers.join(','), ...rows].join('\n'), 'utf-8');
    }

    // ─── Per-branch PDF export (one specific InvBranch UUID) ─────────────────

    /**
     * Exports data for ONE InvBranch, identified by its UUID. Matches that
     * branch's table exactly — correct stock levels, correct Low Stock status.
     */
    async exportBranchPdf(
        invBranchId: string,
        dto:         QueryInventoryStatusDto,
        user:        JwtPayload,
    ): Promise<Buffer> {
        const { doc, buffers } = this.createPdfDoc();
        const { branchName, kpi, inventoryDetails } =
            await this.getFilteredDetailsForInvBranch(invBranchId, dto);

        const subtitle = [
            `Branch: ${branchName}`,
            `Generated: ${new Date().toDateString()}`,
            dto.category    ? `Category: ${dto.category}`    : null,
            dto.stockStatus ? `Status: ${dto.stockStatus}`   : null,
        ].filter(Boolean).join('   |   ');

        if (inventoryDetails.length === 0) {
            doc.text(`No inventory data available for ${branchName}.`);
        } else {
            const startY = this.drawPdfHeader(doc, kpi, subtitle);
            this.writeTableRows(doc, inventoryDetails, startY);
            this.drawPdfFooter(doc);
        }

        void this.auditLogService.record({
            userId: user.userId, username: user.username, role: user.role,
            action: 'Exported PDF', reportType: 'Inventory Status Report',
            filtersUsed: this.buildFilterSummary(dto),
            branchName,
        });

        return this.finalisePdf(doc, buffers);
    }
}