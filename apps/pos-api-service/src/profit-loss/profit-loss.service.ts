import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import type { ProfitLossQuery } from './schemas/profit-loss.schema';
import { ReportsAuditLogService } from '../reports-audit-log/audit-log.service';
import { JwtPayload } from '@ryzera/pos-schema';

// ─── Internal types ──────────────────────────────────────────────────────────

interface DailyAggregated {
  revenue: number;
  cogs: number;
  tax: number;
  returns: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_DATE_FROM = '2026-01-01';
const SALE_STATUS_COMPLETED = 'Completed';

/**
 * ProfitLossService
 *
 * All financial calculations for the P&L Report page.
 * Formulas used throughout:
 *   Gross Profit  = Revenue − COGS
 *   Net Profit    = Gross Profit − Tax − Returns
 *   Margin %      = (Net Profit / Revenue) × 100
 *   Net Revenue   = Revenue − Returns
 *
 * NOTE: ProfitLossQuery uses `branchId` (camelCase) throughout.
 * The Sale model column is `branch_id` (snake_case) — conversion
 * is done in buildBranchFilter.
 */
@Injectable()
export class ProfitLossService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly auditLogService: ReportsAuditLogService,
  ) {}

  // ─── Private Helpers ─────────────────────────────────────────────────────

  /**
   * Build the Prisma `where` filter for branch_id.
   * FIX: accepts branchId from the DTO and maps to sale.branch_id column.
   */
  private buildBranchFilter(branchId?: number): Record<string, unknown> {
    return branchId ? { branch_id: Number(branchId) } : {};
  }

  private parseDateRange(query: ProfitLossQuery): {
    dateFrom: Date;
    dateTo: Date;
  } {
    const dateFrom = new Date(query.dateFrom ?? DEFAULT_DATE_FROM);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();
    dateTo.setHours(23, 59, 59, 999);
    return { dateFrom, dateTo };
  }

  private requireDateRange(query: ProfitLossQuery): void {
    if (!query.dateFrom || !query.dateTo) {
      throw new BadRequestException(
          'Both dateFrom and dateTo are required to generate this report.',
      );
    }
  }

  private round2(value: number): number {
    return parseFloat(value.toFixed(2));
  }

  private round1(value: number): number {
    return parseFloat(value.toFixed(1));
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

  // ─── KPI Cards ───────────────────────────────────────────────────────────

  async getKpiCards(query: ProfitLossQuery) {
    this.requireDateRange(query);

    const { dateFrom, dateTo } = this.parseDateRange(query);
    // FIX: query uses branchId (camelCase) — buildBranchFilter maps to branch_id
    const branchFilter = this.buildBranchFilter(query.branchId);

    const sales = await this.prisma.sale.findMany({
      where: {
        created_at: { gte: dateFrom, lte: dateTo },
        sale_status: SALE_STATUS_COMPLETED,
        ...branchFilter,
      },
      include: {
        // FIX: Prisma relation name is 'saleItems' (camelCase), not 'sale_items'
        saleItems: {
          select: {
            total_amount: true,
            cost_price: true,
            quantity: true,
            discount_amount: true,
            tax_amount: true,
          },
        },
      },
    });

    // FIX: prisma.return (not ryzera_pos_return)
    const returns = await this.prisma.return.findMany({
      where: {
        return_date: { gte: dateFrom, lte: dateTo },
        // FIX: use branchId from dto, map via sale relation
        ...(query.branchId
            ? { sale: { branch_id: Number(query.branchId) } }
            : {}),
      },
      select: { return_amount: true },
    });

    let totalSales = 0;
    let totalCogs = 0;
    let totalTax = 0;
    let totalDiscounts = 0;

    for (const sale of sales) {
      // FIX: Decimal → number via Number()
      totalSales += Number(sale.total_amount);
      for (const item of sale.saleItems) {
        totalCogs += Number(item.cost_price) * Number(item.quantity);
        totalTax += Number(item.tax_amount);
        totalDiscounts += Number(item.discount_amount);
      }
    }

    const totalReturns = returns.reduce(
        (sum, r) => sum + Number(r.return_amount),
        0,
    );
    const grossProfit = totalSales - totalCogs;
    const netRevenue = totalSales - totalReturns;
    const netProfit = grossProfit - totalTax - totalReturns;
    const profitMargin =
        totalSales > 0 ? this.round1((netProfit / totalSales) * 100) : 0;

    return {
      totalSales: this.round2(totalSales),
      costOfGoodsSold: this.round2(totalCogs),
      grossProfit: this.round2(grossProfit),
      netProfit: this.round2(netProfit),
      profitMargin,
      totalTax: this.round2(totalTax),
      totalDiscounts: this.round2(totalDiscounts),
      totalReturns: this.round2(totalReturns),
      netRevenue: this.round2(netRevenue),
    };
  }

  // ─── Chart Data ──────────────────────────────────────────────────────────

  async getChartData(query: ProfitLossQuery) {
    this.requireDateRange(query);

    const { dateFrom, dateTo } = this.parseDateRange(query);
    // FIX: use branchId
    const branchFilter = this.buildBranchFilter(query.branchId);

    const sales = await this.prisma.sale.findMany({
      where: {
        created_at: { gte: dateFrom, lte: dateTo },
        sale_status: SALE_STATUS_COMPLETED,
        ...branchFilter,
      },
      include: {
        // FIX: 'saleItems' (camelCase Prisma relation)
        saleItems: {
          select: {
            cost_price: true,
            quantity: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const grouped: Record<string, { revenue: number; cost: number }> = {};

    for (const sale of sales) {
      const day = sale.created_at.toISOString().slice(0, 10);
      if (!grouped[day]) grouped[day] = { revenue: 0, cost: 0 };
      // FIX: Decimal → number
      grouped[day].revenue += Number(sale.total_amount);
      for (const item of sale.saleItems) {
        grouped[day].cost += Number(item.cost_price) * Number(item.quantity);
      }
    }

    const data = Object.entries(grouped).map(([date, v]) => ({
      date,
      revenue: this.round2(v.revenue),
      cost: this.round2(v.cost),
      profit: this.round2(v.revenue - v.cost),
    }));

    return { data };
  }

  // ─── P&L Statement Table ─────────────────────────────────────────────────

  async getProfitLossTable(query: ProfitLossQuery) {
    this.requireDateRange(query);

    const { dateFrom, dateTo } = this.parseDateRange(query);
    // FIX: use branchId
    const branchFilter = this.buildBranchFilter(query.branchId);

    const sales = await this.prisma.sale.findMany({
      where: {
        created_at: { gte: dateFrom, lte: dateTo },
        sale_status: SALE_STATUS_COMPLETED,
        ...branchFilter,
      },
      include: {
        // FIX: 'saleItems' (camelCase Prisma relation)
        saleItems: {
          select: {
            cost_price: true,
            quantity: true,
            tax_amount: true,
          },
        },
        // FIX: 'returns' is the Prisma relation name on Sale model
        returns: {
          select: { return_amount: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const grouped: Record<string, DailyAggregated> = {};

    for (const sale of sales) {
      const day = sale.created_at.toISOString().slice(0, 10);
      if (!grouped[day]) {
        grouped[day] = { revenue: 0, cogs: 0, tax: 0, returns: 0 };
      }
      // FIX: Decimal → number
      grouped[day].revenue += Number(sale.total_amount);
      for (const item of sale.saleItems) {
        grouped[day].cogs += Number(item.cost_price) * Number(item.quantity);
        grouped[day].tax += Number(item.tax_amount);
      }
      for (const ret of sale.returns) {
        grouped[day].returns += Number(ret.return_amount);
      }
    }

    const data = Object.entries(grouped).map(([date, v]) => {
      const grossProfit = v.revenue - v.cogs;
      const netProfit = grossProfit - v.tax - v.returns;
      const margin =
          v.revenue > 0 ? this.round1((netProfit / v.revenue) * 100) : 0;
      return {
        date,
        revenue: this.round2(v.revenue),
        cogs: this.round2(v.cogs),
        grossProfit: this.round2(grossProfit),
        tax: this.round2(v.tax),
        returns: this.round2(v.returns),
        netProfit: this.round2(netProfit),
        margin,
      };
    });

    return { data };
  }

  // ─── Per-Branch Breakdown ─────────────────────────────────────────────────

  // ─── Per-Branch Breakdown ─────────────────────────────────────────────────

  async getByBranch(query: ProfitLossQuery) {
    this.requireDateRange(query);

    // If single branch selected
    if (query.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: Number(query.branchId) },
        select: { id: true, name: true, city: true },
      });

      const [kpi, chart, table] = await Promise.all([
        this.getKpiCards(query),
        this.getChartData(query),
        this.getProfitLossTable(query),
      ]);

      return {
        branches: [
          {
            branch: {
              id: branch?.id ?? Number(query.branchId),
              name: branch?.name ?? `Branch ${query.branchId}`,
              city: branch?.city ?? null,
            },
            kpi,
            chart,
            table,
          },
        ],
      };
    }

    // All active branches
    const branches = await this.prisma.branch.findMany({
      where: { is_active: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: 'asc' },
    });

    const results = await Promise.all(
      branches.map(async (branch) => {
        const branchQuery: ProfitLossQuery = {
          ...query,
          branchId: branch.id,
        };
        const [kpi, chart, table] = await Promise.all([
          this.getKpiCards(branchQuery),
          this.getChartData(branchQuery),
          this.getProfitLossTable(branchQuery),
        ]);
        return {
          branch: {
            id: branch.id,
            name: branch.name,
            city: branch.city,
          },
          kpi,
          chart,
          table,
        };
      }),
    );

    return { branches: results };
  }

  // ─── CSV Export ──────────────────────────────────────────────────────────

  async exportCsv(query: ProfitLossQuery, user: JwtPayload): Promise<Buffer> {
    const { data } = await this.getProfitLossTable(query);

    if (!data || data.length === 0) {
      return Buffer.from(
          'No data available for the selected date range.',
          'utf-8',
      );
    }

    const headers = [
      'Date',
      'Revenue',
      'COGS',
      'Gross Profit',
      'Tax',
      'Returns',
      'Net Profit',
      'Margin (%)',
    ];

    const rows = data.map((row) => [
      row.date,
      row.revenue,
      row.cogs,
      row.grossProfit,
      row.tax,
      row.returns,
      row.netProfit,
      row.margin,
    ]);

    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported CSV',
      reportType: 'P&L Summary',
      filtersUsed: this.buildFilterSummary(query),
      // FIX: use branchId (camelCase)
      branchName: query.branchId ? `Branch ${query.branchId}` : 'All',
      branchId: query.branchId ?? null,
    });

    const csv = [headers, ...rows]
        .map((row) => row.map((v) => `"${v}"`).join(','))
        .join('\n');

    return Buffer.from(csv, 'utf-8');
  }

  // ─── PDF Export ──────────────────────────────────────────────────────────

  async exportPdf(query: ProfitLossQuery, user: JwtPayload): Promise<Buffer> {
    const [kpi, tableResult] = await Promise.all([
      this.getKpiCards(query),
      this.getProfitLossTable(query),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require('pdfkit') as typeof import('pdfkit');

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      layout: 'landscape',
    });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    if (!tableResult.data || tableResult.data.length === 0) {
      doc.text('No data available. Please select a valid date range.');
      doc.end();
      return new Promise((resolve) =>
          doc.on('end', () => resolve(Buffer.concat(buffers))),
      );
    }

    const rows = tableResult.data;
    const pageWidth = 841.89;
    const margin = 40;
    const tableWidth = pageWidth - margin * 2;
    const rowHeight = 22;
    const headerH = 26;

    const cols = [
      { label: 'Date', key: 'date', width: 100 },
      { label: 'Revenue (Rs)', key: 'revenue', width: 110 },
      { label: 'COGS (Rs)', key: 'cogs', width: 110 },
      { label: 'Gross Profit', key: 'grossProfit', width: 110 },
      { label: 'Tax (Rs)', key: 'tax', width: 90 },
      { label: 'Returns (Rs)', key: 'returns', width: 90 },
      { label: 'Net Profit', key: 'netProfit', width: 110 },
      { label: 'Margin (%)', key: 'margin', width: 41 },
    ] as const;

    type ColKey = (typeof cols)[number]['key'];

    const drawRow = (
        y: number,
        rowData: Partial<Record<ColKey, string | number>>,
        isHeader = false,
        shaded = false,
    ) => {
      let x = margin;
      if (isHeader) {
        doc.rect(margin, y, tableWidth, headerH).fill('#2C3E50');
      } else if (shaded) {
        doc.rect(margin, y, tableWidth, rowHeight).fill('#F2F4F6');
      }

      for (const col of cols) {
        const cellH = isHeader ? headerH : rowHeight;
        const value = isHeader ? col.label : String(rowData[col.key] ?? '');
        let textColor = isHeader ? '#FFFFFF' : '#1A1A1A';

        if (!isHeader && col.key === 'netProfit') {
          textColor = parseFloat(value) >= 0 ? '#27AE60' : '#E74C3C';
        }
        if (!isHeader && col.key === 'margin') {
          const pct = parseFloat(value);
          textColor = pct >= 30 ? '#27AE60' : pct >= 15 ? '#E67E22' : '#E74C3C';
        }

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
    };

    doc.rect(0, 0, pageWidth, 70).fill('#2C3E50');
    doc
        .fillColor('#FFFFFF')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Profit & Loss Report', margin, 16, {
          align: 'center',
          width: tableWidth,
        });
    doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#BDC3C7')
        .text(
            `Date Range: ${query.dateFrom ?? '—'}  –  ${query.dateTo ?? '—'}`,
            margin,
            44,
            { align: 'center', width: tableWidth },
        );

    doc.rect(0, 70, pageWidth, 36).fill('#1A252F');
    const kpiItems = [
      { label: 'Total Sales', value: `Rs ${kpi.totalSales.toFixed(2)}` },
      { label: 'COGS', value: `Rs ${kpi.costOfGoodsSold.toFixed(2)}` },
      { label: 'Gross Profit', value: `Rs ${kpi.grossProfit.toFixed(2)}` },
      { label: 'Net Profit', value: `Rs ${kpi.netProfit.toFixed(2)}` },
      { label: 'Total Tax', value: `Rs ${kpi.totalTax.toFixed(2)}` },
      {
        label: 'Total Discounts',
        value: `Rs ${kpi.totalDiscounts.toFixed(2)}`,
      },
      { label: 'Total Returns', value: `Rs ${kpi.totalReturns.toFixed(2)}` },
      { label: 'Net Revenue', value: `Rs ${kpi.netRevenue.toFixed(2)}` },
    ];
    const kpiWidth = tableWidth / kpiItems.length;
    kpiItems.forEach((k, i) => {
      const kx = margin + i * kpiWidth;
      doc
          .fillColor('#BDC3C7')
          .fontSize(7)
          .font('Helvetica')
          .text(k.label, kx, 76, { width: kpiWidth, align: 'center' });
      doc
          .fillColor('#FFFFFF')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(k.value, kx, 87, { width: kpiWidth, align: 'center' });
    });

    let y = 118;
    drawRow(y, {}, true);
    y += headerH;

    rows.forEach((row, i) => {
      if (y + rowHeight > doc.page.height - margin) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
        y = margin;
        drawRow(y, {}, true);
        y += headerH;
      }
      drawRow(
        y,
        {
          date: row.date,
          revenue: row.revenue.toFixed(2),
          cogs: row.cogs.toFixed(2),
          grossProfit: row.grossProfit.toFixed(2),
          tax: row.tax.toFixed(2),
          returns: row.returns.toFixed(2),
          netProfit: row.netProfit.toFixed(2),
          margin: row.margin.toFixed(1) + '%',
        },
        false,
        i % 2 === 0,
      );
      y += rowHeight;
    });

    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported PDF',
      reportType: 'P&L Summary',
      filtersUsed: this.buildFilterSummary(query),
      // FIX: use branchId (camelCase)
      branchName: query.branchId ? `Branch ${query.branchId}` : 'All',
      branchId: query.branchId ?? null,
    });

    const footerY = doc.page.height - 28;
    doc
        .moveTo(margin, footerY)
        .lineTo(pageWidth - margin, footerY)
        .strokeColor('#CCCCCC')
        .lineWidth(0.5)
        .stroke();
    doc
        .fillColor('#999999')
        .fontSize(7)
        .font('Helvetica')
        .text(
            `Generated: ${new Date().toDateString()}   |   Ryzera POS`,
            margin,
            footerY + 6,
            { align: 'center', width: tableWidth },
        );

    doc.end();
    return new Promise((resolve) =>
        doc.on('end', () => resolve(Buffer.concat(buffers))),
    );
  }
}