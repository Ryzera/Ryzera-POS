import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { QueryCategoryPerformanceDto } from './schemas/query-category-performance.schema';
import { ReportsAuditLogService } from '../reports-audit-log/audit-log.service';
import { JwtPayload } from '@ryzera/pos-schema';

/** Default fallback start date when no dateFrom is provided */
const DEFAULT_DATE_FROM = '2026-01-01';

interface CategoryMetrics {
  products: Set<string>;
  totalSold: number;
  revenue: number;
  cost: number;
  transactions: Set<number>;
}

@Injectable()
export class CategoryPerformanceService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly auditLogService: ReportsAuditLogService,
  ) {}

  // ── Private Helpers ──────────────────────────────────────────────────────

  private buildBranchFilter(branchId?: number): object {
    return branchId !== undefined ? { branch_id: branchId } : {};
  }

  private parseDateRange(dto: QueryCategoryPerformanceDto): {
    dateFrom: Date;
    dateTo: Date;
  } {
    const dateFrom = new Date(dto.dateFrom ?? DEFAULT_DATE_FROM);
    const dateTo = dto.dateTo ? new Date(dto.dateTo) : new Date();
    dateTo.setHours(23, 59, 59, 999);
    return { dateFrom, dateTo };
  }

  /**
   * Fetches all Completed sales within the date range, optionally filtered
   * by branchId (undefined = all branches).
   *
   * Includes sale_items → product → category for aggregation.
   */
  private async fetchCompletedSales(dto: QueryCategoryPerformanceDto) {
    const { dateFrom, dateTo } = this.parseDateRange(dto);
    return this.prisma.sale.findMany({
      // ← model renamed
      where: {
        created_at: { gte: dateFrom, lte: dateTo }, // ← field renamed
        sale_status: 'Completed',
        ...this.buildBranchFilter(dto.branchId), // branch_id stays the same logic
      },
      include: {
        saleItems: {
          // ← relation renamed (was sale_items)
          include: {
            product: { include: { category: { select: { name: true } } } },
          },
        },
      },
    });
  }

  /**
   * Aggregates sale items into a per-category metrics map.
   * Used by every chart and table endpoint.
   */
  private aggregateByCategory(
      sales: Awaited<ReturnType<typeof this.fetchCompletedSales>>,
  ): Record<string, CategoryMetrics> {
    const grouped: Record<string, CategoryMetrics> = {};

    for (const sale of sales) {
      for (const item of sale.saleItems) {
        const cat = item.product?.category?.name ?? 'Unknown';

        if (!grouped[cat]) {
          grouped[cat] = {
            products: new Set(),
            totalSold: 0,
            revenue: 0,
            cost: 0,
            transactions: new Set(),
          };
        }

        if (item.product_id) grouped[cat].products.add(String(item.product_id));
        grouped[cat].totalSold += Number(item.quantity);
        grouped[cat].revenue += Number(item.total_amount);
        grouped[cat].cost += Number(item.cost_price) * Number(item.quantity);
        grouped[cat].transactions.add(sale.id); // ← was sale.sale_id
      }
    }

    return grouped;
  }

  private buildFilterSummary(dto: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    branchId?: number;
  }): string {
    const parts: string[] = [];
    if (dto.dateFrom && dto.dateTo)
      parts.push(`${dto.dateFrom} – ${dto.dateTo}`);
    if (dto.category) parts.push(dto.category);
    return parts.join(', ') || 'All';
  }

  // ── Public Service Methods ───────────────────────────────────────────────

  /**
   * KPI cards — top 3 categories by revenue for the selected period.
   *
   * When dto.branchId is undefined (SUPER_ADMIN, All Branches tab):
   *   returns top 3 across ALL branches combined.
   * When dto.branchId is set:
   *   returns top 3 for that branch only.
   *
   * Response shape:
   *   { topCategories: [{ rank, category, revenue }] }
   */
  async getKpiCards(dto: QueryCategoryPerformanceDto) {
    if (!dto.dateFrom || !dto.dateTo) {
      return { message: 'Please select both dates.', topCategories: [] };
    }

    const sales = await this.fetchCompletedSales(dto);
    const grouped = this.aggregateByCategory(sales);

    const topCategories = Object.entries(grouped)
        .map(([category, v]) => ({
          category,
          revenue: parseFloat(v.revenue.toFixed(2)),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3)
        .map((item, index) => ({ rank: index + 1, ...item }));

    return { topCategories };
  }

  /**
   * Bar chart — revenue per category.
   *
   * When dto.branchId is undefined (SUPER_ADMIN, All Branches tab):
   *   fetches ALL branches → returns summed revenue across every branch.
   * When dto.branchId is set:
   *   filters to that branch only.
   */
  async getRevenueByCategory(dto: QueryCategoryPerformanceDto) {
    if (!dto.dateFrom || !dto.dateTo) {
      return { message: 'Please select both dates.', data: [] };
    }

    const sales = await this.fetchCompletedSales(dto);
    const grouped = this.aggregateByCategory(sales);

    const data = Object.entries(grouped)
        .map(([category, v]) => ({
          category,
          revenue: parseFloat(v.revenue.toFixed(2)),
        }))
        .sort((a, b) => b.revenue - a.revenue);

    return { data };
  }

  /**
   * Pie chart — profit distribution per category.
   *
   * Same branch-scope behaviour as getRevenueByCategory.
   */
  async getProfitByCategory(dto: QueryCategoryPerformanceDto) {
    if (!dto.dateFrom || !dto.dateTo) {
      return { message: 'Please select both dates.', data: [] };
    }

    const sales = await this.fetchCompletedSales(dto);
    const grouped = this.aggregateByCategory(sales);
    const total = Object.values(grouped).reduce(
        (sum, v) => sum + (v.revenue - v.cost),
        0,
    );

    const data = Object.entries(grouped).map(([category, v]) => {
      const profit = v.revenue - v.cost;
      const percentage =
          total > 0 ? parseFloat(((profit / total) * 100).toFixed(1)) : 0;
      return {
        category,
        profit: parseFloat(profit.toFixed(2)),
        percentage,
      };
    });

    return { data };
  }

  /**
   * Detail table — all metrics per category.
   *
   * When dto.branchId is undefined → sums ALL branches (All Branches tab).
   * When dto.branchId is set       → single branch only.
   */
  async getCategoryTable(dto: QueryCategoryPerformanceDto) {
    if (!dto.dateFrom || !dto.dateTo) {
      return { message: 'Please select both dates.', data: [] };
    }

    const sales = await this.fetchCompletedSales(dto);
    const grouped = this.aggregateByCategory(sales);

    const data = Object.entries(grouped)
        .map(([category, v]) => {
          const profit = v.revenue - v.cost;
          const margin =
              v.revenue > 0
                  ? parseFloat(((profit / v.revenue) * 100).toFixed(1))
                  : 0;

          return {
            category,
            totalProducts: v.products.size,
            totalSold: Math.round(v.totalSold),
            revenue: parseFloat(v.revenue.toFixed(2)),
            cost: parseFloat(v.cost.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            transactions: v.transactions.size,
            margin,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

    return { data };
  }

  /**
   * Per Branch tab (SUPER_ADMIN only) — loops every active branch and
   * returns an array of { branch, data[] } entries.
   *
   * Distinction:
   *   All Branches → getCategoryTable with branchId = undefined
   *                  → one flat aggregated result summed across all branches.
   *   Per Branch   → this method → one entry per branch, fully expanded.
   */
  async getCategoryPerformanceByBranch(dto: QueryCategoryPerformanceDto) {
    if (!dto.dateFrom || !dto.dateTo) {
      return { message: 'Please select both dates.', branches: [] };
    }

    const branches = await this.prisma.branch.findMany({
      where: { is_active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const results = await Promise.all(
        branches.map(async (branch) => {
          // Always force branchId — never let it fall through as undefined here.
          const branchDto = { ...dto, branchId: branch.id };
          const tableResult = await this.getCategoryTable(branchDto);
          return {
            branch: { id: branch.id, name: branch.name },
            data: tableResult.data ?? [],
          };
        }),
    );

    return { branches: results };
  }

  // ── Export Methods ───────────────────────────────────────────────────────

  /**
   * Exports the detail table as a UTF-8 CSV buffer.
   * Respects branchId scoping (undefined = all branches).
   */
  async exportCsv(
      dto: QueryCategoryPerformanceDto,
      user: JwtPayload,
  ): Promise<Buffer> {
    const result = await this.getCategoryTable(dto);

    if (!result.data || result.data.length === 0) {
      return Buffer.from(
          'No data available for the selected date range.',
          'utf-8',
      );
    }

    const headers = [
      'Category',
      'Total Products',
      'Total Sold',
      'Revenue (LKR)',
      'Cost (LKR)',
      'Profit (LKR)',
      'Transactions',
      'Margin (%)',
    ];

    const rows = result.data.map((r) => [
      r.category,
      r.totalProducts,
      r.totalSold,
      r.revenue,
      r.cost,
      r.profit,
      r.transactions,
      r.margin,
    ]);

    // Audit: fire-and-forget — never blocks the CSV response
    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported CSV',
      reportType: 'Category Perf.',
      filtersUsed: this.buildFilterSummary(dto),
      branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All', // ← use dto.branchId
      branchId: dto.branchId ?? null,
    });

    const csv = [headers, ...rows]
        .map((row) =>
            row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
        )
        .join('\n');

    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Exports the detail table as a PDF buffer using pdfkit.
   * Respects branchId scoping (undefined = all branches).
   *
   * Layout: landscape A4, full table with all 8 columns, header row shaded.
   */
  async exportPdf(
      dto: QueryCategoryPerformanceDto,
      user: JwtPayload,
  ): Promise<Buffer> {
    const result = await this.getCategoryTable(dto);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require('pdfkit') as typeof import('pdfkit');

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      layout: 'landscape',
    });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ── Header ──────────────────────────────────────────────────────
      const reportTitle = 'Category Performance Report';
      const dateLabel =
          dto.dateFrom && dto.dateTo
              ? `${dto.dateFrom}  →  ${dto.dateTo}`
              : 'All dates';

      doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(reportTitle, { align: 'center' });
      doc
          .fontSize(9)
          .font('Helvetica')
          .text(`Date range: ${dateLabel}`, { align: 'center' });
      doc.moveDown(0.8);

      // ── Empty guard ─────────────────────────────────────────────────
      // Extract rows into a typed local variable so TypeScript can narrow
      // the type correctly inside the rest of this closure.
      type TableRow = {
        category: string;
        totalProducts: number;
        totalSold: number;
        revenue: number;
        cost: number;
        profit: number;
        transactions: number;
        margin: number;
      };

      const rows: TableRow[] = (result.data ?? []) as TableRow[];

      if (rows.length === 0) {
        doc
            .fontSize(11)
            .text('No data available for the selected date range.', {
              align: 'center',
            });
        doc.end();
        return;
      }

      // ── Table layout ─────────────────────────────────────────────────
      // Landscape A4 usable width: 841.89 - 80 = ~762 pts
      const cols = [
        { label: 'Category', width: 140, align: 'left' as const },
        { label: 'Products', width: 60, align: 'right' as const },
        { label: 'Units Sold', width: 70, align: 'right' as const },
        { label: 'Revenue (LKR)', width: 100, align: 'right' as const },
        { label: 'Cost (LKR)', width: 95, align: 'right' as const },
        { label: 'Profit (LKR)', width: 95, align: 'right' as const },
        { label: 'Transactions', width: 80, align: 'right' as const },
        { label: 'Margin (%)', width: 72, align: 'right' as const },
      ];

      const totalWidth = cols.reduce((s, c) => s + c.width, 0);
      const rowHeight = 20;
      const headerHeight = 22;
      const startX = doc.page.margins.left;
      let curY = doc.y;

      // rowCounter drives zebra striping — incremented per data row only.
      let rowCounter = 0;

      const drawRow = (
          values: (string | number)[],
          y: number,
          isHeader: boolean,
          isZebraOdd: boolean = false,
      ) => {
        // Row background
        if (isHeader) {
          doc.rect(startX, y, totalWidth, headerHeight).fill('#2563EB');
        } else if (isZebraOdd) {
          doc.rect(startX, y, totalWidth, rowHeight).fill('#F1F5F9');
        }

        // Cell text
        let x = startX;
        cols.forEach((col, i) => {
          const text = String(values[i] ?? '');
          doc
              .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
              .fontSize(isHeader ? 8.5 : 8)
              .fillColor(isHeader ? '#FFFFFF' : '#1E293B')
              .text(
                  text,
                  x + 4,
                  y +
                  (isHeader ? headerHeight : rowHeight) / 2 -
                  (isHeader ? 4.25 : 4),
                  { width: col.width - 8, align: col.align, lineBreak: false },
              );
          x += col.width;
        });

        // Bottom border line
        const h = isHeader ? headerHeight : rowHeight;
        doc
            .moveTo(startX, y + h)
            .lineTo(startX + totalWidth, y + h)
            .strokeColor('#CBD5E1')
            .lineWidth(0.5)
            .stroke();
      };

      // ── Column header row ────────────────────────────────────────────
      drawRow(
          cols.map((c) => c.label),
          curY,
          true,
      );
      curY += headerHeight;

      // ── Data rows ────────────────────────────────────────────────────
      for (const row of rows) {
        // Page break guard
        if (curY + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          curY = doc.page.margins.top;
          drawRow(
              cols.map((c) => c.label),
              curY,
              true,
          );
          curY += headerHeight;
        }

        drawRow(
            [
              row.category,
              row.totalProducts,
              row.totalSold,
              row.revenue.toFixed(2),
              row.cost.toFixed(2),
              row.profit.toFixed(2),
              row.transactions,
              `${row.margin}%`,
            ],
            curY,
            false,
            rowCounter % 2 === 1, // zebra: odd rows get light tint
        );
        curY += rowHeight;
        rowCounter++;
      }

      // ── Totals footer row ────────────────────────────────────────────
      const totals = rows.reduce(
          (acc, r) => {
            acc.totalProducts += r.totalProducts;
            acc.totalSold += r.totalSold;
            acc.revenue += r.revenue;
            acc.cost += r.cost;
            acc.profit += r.profit;
            acc.transactions += r.transactions;
            return acc;
          },
          {
            totalProducts: 0,
            totalSold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            transactions: 0,
          },
      );
      const totalMargin =
          totals.revenue > 0
              ? parseFloat(((totals.profit / totals.revenue) * 100).toFixed(1))
              : 0;

      if (curY + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        curY = doc.page.margins.top;
      }

      // Totals background
      doc
          .rect(
              startX,
              curY,
              cols.reduce((s, c) => s + c.width, 0),
              rowHeight,
          )
          .fill('#1E3A5F');

      let tx = startX;
      const totalValues = [
        'TOTAL',
        totals.totalProducts,
        totals.totalSold,
        totals.revenue.toFixed(2),
        totals.cost.toFixed(2),
        totals.profit.toFixed(2),
        totals.transactions,
        `${totalMargin}%`,
      ];
      cols.forEach((col, i) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor('#FFFFFF')
          .text(String(totalValues[i]), tx + 4, curY + rowHeight / 2 - 4.25, {
            width: col.width - 8,
            align: col.align,
            lineBreak: false,
          });
        tx += col.width;
      });

      // Audit: fire-and-forget — never blocks the PDF response
      void this.auditLogService.record({
        userId: user.userId,
        username: (user as any).username ?? 'admin',
        role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
        action: 'Exported PDF',
        reportType: 'Category Perf.',
        filtersUsed: this.buildFilterSummary(dto),
        branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All', // ← use dto.branchId
        branchId: dto.branchId ?? null,
      });

      // ── Generated timestamp ──────────────────────────────────────────
      doc
          .moveDown(2)
          .fontSize(8)
          .fillColor('#94A3B8')
          .text(
              `Generated: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`,
              { align: 'right' },
          );

      doc.end();
    });
  }
}