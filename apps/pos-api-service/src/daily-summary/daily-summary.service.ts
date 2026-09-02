import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { QueryDailySummaryInput } from './schemas/daily-summary.schema';
import { ReportsAuditLogService } from '../reports-audit-log/audit-log.service';
import { JwtPayload } from '@ryzera/pos-schema';

const SALE_STATUS_COMPLETED = 'Completed';

@Injectable()
export class DailySummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: ReportsAuditLogService,
  ) {}

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private saleBranchFilter(branchId?: number): object {
    return branchId ? { branch_id: Number(branchId) } : {};
  }

  private buildDateRange(dateStr: string): { gte: Date; lte: Date } {
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  private toNumber(val: unknown): number {
    return parseFloat(parseFloat(String(val ?? 0)).toFixed(2));
  }

  private buildFilterSummary(dto: QueryDailySummaryInput): string {
    return dto.date ?? 'All';
  }

  /**
   * Core aggregation used by getKpiCards, getDailySummaryDetails and both
   * exports. Computes every figure directly from live transaction tables
   * for the given date + optional branch.
   */
  private async computeDailyAggregate(dto: QueryDailySummaryInput) {
    const dateRange = this.buildDateRange(dto.date as string);

    const sales = await this.prisma.sale.findMany({
      where: {
        created_at: dateRange,
        sale_status: SALE_STATUS_COMPLETED,
        ...this.saleBranchFilter(dto.branchId),
      },
      include: {
        saleItems: {
          select: { cost_price: true, quantity: true },
        },
      },
    });

    const returnWhere: Record<string, unknown> = { return_date: dateRange };
    if (dto.branchId) {
      returnWhere['sale'] = { branch_id: Number(dto.branchId) };
    }
    const returns = await this.prisma.return.findMany({
      where: returnWhere as any,
      select: { return_amount: true },
    });

    const totalSales = sales.reduce(
      (sum, s) => sum + this.toNumber(s.total_amount),
      0,
    );
    const totalDiscounts = sales.reduce(
      (sum, s) => sum + this.toNumber(s.discount_amount),
      0,
    );
    const totalTax = sales.reduce(
      (sum, s) => sum + this.toNumber(s.tax_amount),
      0,
    );
    const totalItemsSold = sales.reduce(
      (sum, s) =>
        sum + s.saleItems.reduce((acc, item) => acc + Number(item.quantity), 0),
      0,
    );
    const cogs = sales.reduce(
      (sum, s) =>
        sum +
        s.saleItems.reduce(
          (acc, item) => acc + Number(item.cost_price) * Number(item.quantity),
          0,
        ),
      0,
    );
    const totalReturns = returns.reduce(
      (sum, r) => sum + this.toNumber(r.return_amount),
      0,
    );

    const totalTransactions = sales.length;
    // No Customer entity exists in the schema — one completed sale is
    // treated as one customer visit. Adjust if a Customer model is added.
    const totalCustomers = totalTransactions;

    const grossProfit = totalSales - cogs;
    const netProfit = grossProfit - totalDiscounts - totalReturns;

    return {
      hasData: totalTransactions > 0,
      date: dto.date as string,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalTransactions,
      totalItemsSold,
      totalCustomers,
      totalDiscounts: parseFloat(totalDiscounts.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalReturns: parseFloat(totalReturns.toFixed(2)),
      costOfGoodsSold: parseFloat(cogs.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
    };
  }

  // ─── KPI Summary Cards ───────────────────────────────────────────────────

  async getKpiCards(dto: QueryDailySummaryInput) {
    if (!dto.date) {
      return { message: 'Please select a date.', kpi: null };
    }

    const agg = await this.computeDailyAggregate(dto);

    if (!agg.hasData) {
      return {
        message: `No sales recorded for ${dto.date}${
          dto.branchId ? ` (branch ${dto.branchId})` : ''
        }.`,
        kpi: null,
      };
    }

    return {
      kpi: {
        totalSales: agg.totalSales,
        transactions: agg.totalTransactions,
        itemsSold: agg.totalItemsSold,
        totalCustomers: agg.totalCustomers,
        grossProfit: agg.grossProfit,
        netProfit: agg.netProfit,
      },
    };
  }

  // ─── Hourly Sales Line Chart ─────────────────────────────────────────────

  async getHourlySales(dto: QueryDailySummaryInput) {
    if (!dto.date) {
      return { message: 'Please select a date.', data: [] };
    }

    const dateRange = this.buildDateRange(dto.date);

    const sales = await this.prisma.sale.findMany({
      where: {
        created_at: dateRange,
        sale_status: SALE_STATUS_COMPLETED,
        ...this.saleBranchFilter(dto.branchId),
      },
      select: { created_at: true, total_amount: true },
    });

    const hourlyTotals: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyTotals[h] = 0;

    for (const sale of sales) {
      const hour = sale.created_at.getHours();
      hourlyTotals[hour] += this.toNumber(sale.total_amount);
    }

    const data = Object.entries(hourlyTotals).map(([hour, amount]) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      amount: parseFloat(amount.toFixed(2)),
    }));

    return { data };
  }

  // ─── Payment Methods Pie Chart ───────────────────────────────────────────

  async getPaymentMethods(dto: QueryDailySummaryInput) {
    if (!dto.date) {
      return { message: 'Please select a date.', data: [] };
    }

    const dateRange = this.buildDateRange(dto.date);

    const paymentWhere: Record<string, unknown> = { payment_date: dateRange };
    if (dto.branchId) {
      paymentWhere['sale'] = { branch_id: Number(dto.branchId) };
    }

    const payments = await this.prisma.payment.findMany({
      where: paymentWhere as any,
      select: { payment_method: true, amount_paid: true },
    });

    if (!payments.length) {
      return { totalTransactions: 0, data: [] };
    }

    const grouped: Record<string, { count: number; totalAmount: number }> = {};

    for (const payment of payments) {
      const method = payment.payment_method;
      if (!grouped[method]) grouped[method] = { count: 0, totalAmount: 0 };
      grouped[method].count += 1;
      grouped[method].totalAmount += this.toNumber(payment.amount_paid);
    }

    const totalTransactions = payments.length;

    const data = Object.entries(grouped).map(([method, values]) => ({
      paymentMethod: method,
      totalAmount: parseFloat(values.totalAmount.toFixed(2)),
      percentage:
        totalTransactions > 0
          ? parseFloat(((values.count / totalTransactions) * 100).toFixed(1))
          : 0,
    }));

    return { totalTransactions, data };
  }

  // ─── Daily Summary Details Table + P&L Breakdown ─────────────────────────

  async getDailySummaryDetails(dto: QueryDailySummaryInput) {
    if (!dto.date) {
      return {
        message: 'Please select a date.',
        table: null,
        plBreakdown: null,
      };
    }

    const agg = await this.computeDailyAggregate(dto);

    if (!agg.hasData) {
      return {
        message: `No sales recorded for ${dto.date}.`,
        table: null,
        plBreakdown: null,
      };
    }

    const table = {
      date: agg.date,
      totalSales: agg.totalSales,
      transactions: agg.totalTransactions,
      itemsSold: agg.totalItemsSold,
      discounts: agg.totalDiscounts,
      tax: agg.totalTax,
      returns: agg.totalReturns,
      netProfit: agg.netProfit,
    };

    const plBreakdown = {
      totalSales: agg.totalSales,
      costOfGoodsSold: agg.costOfGoodsSold,
      grossProfit: agg.grossProfit,
      discounts: agg.totalDiscounts,
      returns: agg.totalReturns,
      taxCollected: agg.totalTax,
      netProfit: agg.netProfit,
      profitMargin:
        agg.totalSales > 0
          ? parseFloat(((agg.netProfit / agg.totalSales) * 100).toFixed(1))
          : 0,
    };

    return { table, plBreakdown };
  }

  // ─── All Branches Summary ────────────────────────────────────────────────

  async getAllBranchesSummary(dto: QueryDailySummaryInput) {
    if (!dto.date) {
      return { message: 'Please select a date.', branches: [] };
    }

    const allBranches = await this.prisma.branch.findMany({
      where: { is_active: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: 'asc' },
    });

    const branches = await Promise.all(
      allBranches.map(async (b) => {
        const agg = await this.computeDailyAggregate({
          date: dto.date,
          branchId: b.id,
        });

        return {
          branchId: b.id,
          branchName: b.name,
          branchCity: b.city ?? null,
          hasData: agg.hasData,
          kpi: {
            totalSales: agg.totalSales,
            transactions: agg.totalTransactions,
            itemsSold: agg.totalItemsSold,
            totalCustomers: agg.totalCustomers,
            grossProfit: agg.grossProfit,
            netProfit: agg.netProfit,
          },
        };
      }),
    );

    return { date: dto.date, branches };
  }

  // ─── Export CSV ──────────────────────────────────────────────────────────

  async exportCsv(
    dto: QueryDailySummaryInput,
    user: JwtPayload,
  ): Promise<Buffer> {
    // Log the export attempt FIRST, before any "no data" early return.
    // Previously this call sat after the no-data check, so an export
    // attempt on a date with nothing to export never appeared in the
    // Audit Log at all — every export action should be recorded
    // regardless of whether data existed.
    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported CSV',
      reportType: 'Daily Summary',
      filtersUsed: this.buildFilterSummary(dto),
      branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All',
      branchId: dto.branchId ?? null,
    });

    const result = await this.getDailySummaryDetails(dto);

    if (!result.table || !result.plBreakdown) {
      return Buffer.from('No data available.', 'utf-8');
    }

    const { table, plBreakdown } = result;

    const tableHeaders = [
      'Date',
      'Total Sales',
      'Transactions',
      'Items Sold',
      'Discounts',
      'Tax',
      'Returns',
      'Net Profit',
    ];
    const tableRow = [
      table.date,
      table.totalSales,
      table.transactions,
      table.itemsSold,
      table.discounts,
      table.tax,
      table.returns,
      table.netProfit,
    ];

    const plRows = [
      ['Total Sales', plBreakdown.totalSales],
      ['Cost of Goods Sold', plBreakdown.costOfGoodsSold],
      ['Gross Profit', plBreakdown.grossProfit],
      ['Discounts', plBreakdown.discounts],
      ['Returns', plBreakdown.returns],
      ['Tax Collected', plBreakdown.taxCollected],
      ['Net Profit', plBreakdown.netProfit],
      ['Profit Margin', `${plBreakdown.profitMargin}%`],
    ];

    const lines = [
      tableHeaders.map((v) => `"${v}"`).join(','),
      tableRow.map((v) => `"${v}"`).join(','),
      '',
      '"P&L Breakdown","",""',
      ...plRows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ];

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  // ─── Export PDF ──────────────────────────────────────────────────────────

  async exportPdf(
    dto: QueryDailySummaryInput,
    user: JwtPayload,
  ): Promise<Buffer> {
    // Same fix as exportCsv: log the attempt before checking for data.
    void this.auditLogService.record({
      userId: user.userId,
      username: (user as any).username ?? 'admin',
      role: (user as any).roles?.[0] ?? (user as any).userType ?? 'USER',
      action: 'Exported PDF',
      reportType: 'Daily Summary',
      filtersUsed: this.buildFilterSummary(dto),
      branchName: dto.branchId ? `Branch ${dto.branchId}` : 'All',
      branchId: dto.branchId ?? null,
    });

    const result = await this.getDailySummaryDetails(dto);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require('pdfkit');

    if (!result.table || !result.plBreakdown) {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.text('No data available. Please select a valid date.');
      doc.end();
      return new Promise((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
      });
    }

    const { table, plBreakdown } = result;

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      layout: 'landscape',
    });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    const pageWidth = 841.89;
    const margin = 40;
    const tableWidth = pageWidth - margin * 2;
    const rowHeight = 22;
    const headerH = 26;

    doc.rect(0, 0, pageWidth, 70).fill('#2C3E50');
    doc
      .fillColor('#FFFFFF')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Daily Summary Report', margin, 16, {
        align: 'center',
        width: tableWidth,
      });
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#BDC3C7')
      .text(`Date: ${dto.date}`, margin, 44, {
        align: 'center',
        width: tableWidth,
      });

    const cols = [
      { label: 'Date', key: 'date', width: 100 },
      { label: 'Total Sales', key: 'totalSales', width: 100 },
      { label: 'Transactions', key: 'transactions', width: 90 },
      { label: 'Items Sold', key: 'itemsSold', width: 80 },
      { label: 'Discounts', key: 'discounts', width: 90 },
      { label: 'Tax', key: 'tax', width: 90 },
      { label: 'Returns', key: 'returns', width: 90 },
      { label: 'Net Profit', key: 'netProfit', width: 121 },
    ];

    const drawRow = (
      y: number,
      rowData: Record<string, string>,
      isHeader = false,
      shaded = false,
    ) => {
      let x = margin;
      if (isHeader) {
        doc.rect(margin, y, tableWidth, headerH).fill('#2C3E50');
      } else if (shaded) {
        doc.rect(margin, y, tableWidth, rowHeight).fill('#F2F4F6');
      }
      cols.forEach((col) => {
        const cellH = isHeader ? headerH : rowHeight;
        const value = isHeader ? col.label : String(rowData[col.key] ?? '');
        const tColor = isHeader ? '#FFFFFF' : '#1A1A1A';
        doc
          .rect(x, y, col.width, cellH)
          .strokeColor('#CCCCCC')
          .lineWidth(0.5)
          .stroke();
        doc
          .fillColor(tColor)
          .fontSize(isHeader ? 8.5 : 8)
          .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .text(value, x + 5, y + (cellH - (isHeader ? 9 : 8)) / 2 + 1, {
            width: col.width - 10,
            ellipsis: true,
            lineBreak: false,
          });
        x += col.width;
      });
    };

    let y = 90;
    drawRow(y, {} as Record<string, string>, true);
    y += headerH;
    drawRow(
      y,
      {
        date: table.date,
        totalSales: table.totalSales.toFixed(2),
        transactions: String(table.transactions),
        itemsSold: String(table.itemsSold),
        discounts: table.discounts.toFixed(2),
        tax: table.tax.toFixed(2),
        returns: table.returns.toFixed(2),
        netProfit: table.netProfit.toFixed(2),
      },
      false,
      false,
    );
    y += rowHeight + 20;

    doc
      .fillColor('#2C3E50')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Profit & Loss Breakdown', margin, y);
    y += 20;

    const plRows: [string, string][] = [
      ['Total Sales', plBreakdown.totalSales.toFixed(2)],
      ['Cost of Goods Sold', plBreakdown.costOfGoodsSold.toFixed(2)],
      ['Gross Profit', plBreakdown.grossProfit.toFixed(2)],
      ['Discounts', plBreakdown.discounts.toFixed(2)],
      ['Returns', plBreakdown.returns.toFixed(2)],
      ['Tax Collected', plBreakdown.taxCollected.toFixed(2)],
      ['Net Profit', plBreakdown.netProfit.toFixed(2)],
      ['Profit Margin', `${plBreakdown.profitMargin}%`],
    ];

    plRows.forEach(([label, value], i) => {
      const bg = i % 2 === 0 ? '#F2F4F6' : '#FFFFFF';
      doc.rect(margin, y, tableWidth, rowHeight).fill(bg);
      doc
        .fillColor('#1A1A1A')
        .fontSize(9)
        .font('Helvetica')
        .text(label, margin + 5, y + 6, { width: 200 });
      doc.text(value, margin + 210, y + 6);
      y += rowHeight;
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

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }
}