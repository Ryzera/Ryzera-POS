import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import { QueryDailySummaryInput }        from './schemas/daily-summary.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// ─── Constants (avoids hard-coded strings scattered in logic) ────────────
const SALE_STATUS_COMPLETED = 'Completed';

@Injectable()
export class DailySummaryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLogService: AuditLogService,
        ) {}

    // ─── Private helpers ─────────────────────────────────────────────────

    /**
     * Returns Prisma where-clause fragment for filtering by branchId.
     * DailySummary model uses branchId (Int) mapping to ryzera_pos_branch.
     */
    private branchFilter(branchId?: number) {
        return branchId ? { branchId: Number(branchId) } : {};
    }

    /**
     * Returns Prisma where-clause fragment for filtering sales by branchId.
     * ryzera_pos_sale uses the same branchId field.
     */
    private saleBranchFilter(branchId?: number) {
        return branchId ? { branchId: Number(branchId) } : {};
    }

    /**
     * Builds a { gte: startOfDay, lte: endOfDay } date range for a given date string.
     * Keeps all date-boundary logic in one place — no duplication across methods.
     */
    private buildDateRange(dateStr: string): { gte: Date; lte: Date } {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        return { gte: start, lte: end };
    }

    /**
     * Converts a Prisma Decimal (or number) to a plain JS number rounded to 2dp.
     * Prisma returns BigDecimal objects from SUM aggregations — always call this.
     */
    private toNumber(val: any): number {
        return parseFloat(parseFloat(String(val ?? 0)).toFixed(2));
    }

    private buildFilterSummary(dto: { dateFrom?: string; dateTo?: string; category?: string; branchId?: number }): string {
        const parts: string[] = [];
        if (dto.dateFrom && dto.dateTo) parts.push(`${dto.dateFrom} – ${dto.dateTo}`);
        if (dto.category)               parts.push(dto.category);
        return parts.join(', ') || 'All';
    }

    // ─── KPI Summary Cards ───────────────────────────────────────────────

    /**
     * Returns the 6 KPI card values for the top of the Daily Summary page:
     * Total Sales, Transactions, Items Sold, Total Customers,
     * Gross Profit, Net Profit.
     * Data source: DailySummary table (pre-aggregated).
     */
    async getKpiCards(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', kpi: null };
        }

        const dateRange = this.buildDateRange(dto.date);

        const summary = await this.prisma.dailySummary.findFirst({
            where: {
                summaryDate: dateRange,
                ...this.branchFilter(dto.branchId),
            },
        });

        if (!summary) {
            return {
                message: `No summary found for ${dto.date}${dto.branchId ? ` (branch ${dto.branchId})` : ''}.`,
                kpi: null,
            };
        }

        return {
            kpi: {
                totalSales:     this.toNumber(summary.totalSales),
                transactions:   summary.totalTransactions,
                itemsSold:      summary.totalItemsSold,
                totalCustomers: summary.totalCustomers,
                grossProfit:    this.toNumber(summary.grossProfit),
                netProfit:      this.toNumber(summary.netProfit),
            },
        };
    }

    // ─── Hourly Sales Line Chart ─────────────────────────────────────────

    /**
     * Returns hour-by-hour sales totals for the line chart.
     * Reads directly from ryzera_pos_sale (Completed only) for granular data.
     * Returns all 24 hours (0–23) even if no sales occurred in that hour.
     */
    async getHourlySales(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', data: [] };
        }

        const dateRange = this.buildDateRange(dto.date);

        const sales = await this.prisma.ryzera_pos_sale.findMany({
            where: {
                sale_date:   dateRange,
                sale_status: SALE_STATUS_COMPLETED,
                ...this.saleBranchFilter(dto.branchId),
            },
            select: { sale_date: true, total_amount: true },
            orderBy: { sale_date: 'asc' },
        });

        // Initialise all 24 hours to zero, then accumulate sale amounts
        const hourlyTotals: Record<number, number> = {};
        for (let h = 0; h < 24; h++) hourlyTotals[h] = 0;

        sales.forEach((sale) => {
            const hour = sale.sale_date.getHours();
            hourlyTotals[hour] += this.toNumber(sale.total_amount);
        });

        const data = Object.entries(hourlyTotals).map(([hour, amount]) => ({
            hour:   `${String(hour).padStart(2, '0')}:00`,
            amount: parseFloat(amount.toFixed(2)),
        }));

        return { data };
    }

    // ─── Payment Methods Pie Chart ───────────────────────────────────────

    /**
     * Returns payment breakdown by method (Cash, Card, Split, etc.)
     * with amount totals and percentage of total transactions.
     * Used by the pie chart on the Daily Summary page.
     */
    async getPaymentMethods(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', data: [] };
        }

        const dateRange = this.buildDateRange(dto.date);

        const payments = await this.prisma.ryzera_pos_payment.findMany({
            where: {
                payment_date: dateRange,
                ...(dto.branchId
                    ? { sale: { branchId: Number(dto.branchId) } }
                    : {}),
            },
            select: { payment_method: true, amount_paid: true },
        });

        // Group by payment method, accumulating count and total amount
        const grouped: Record<string, { count: number; totalAmount: number }> = {};
        for (const payment of payments) {
            const method = payment.payment_method;
            if (!grouped[method]) grouped[method] = { count: 0, totalAmount: 0 };
            grouped[method].count       += 1;
            grouped[method].totalAmount += this.toNumber(payment.amount_paid);
        }

        const totalTransactions = payments.length;

        const data = Object.entries(grouped).map(([method, values]) => ({
            paymentMethod: method,
            totalAmount:   parseFloat(values.totalAmount.toFixed(2)),
            // Percentage is based on transaction count (matches UI pie chart logic)
            percentage:    totalTransactions > 0
                ? parseFloat(((values.count / totalTransactions) * 100).toFixed(1))
                : 0,
        }));

        return { totalTransactions, data };
    }

    // ─── Daily Summary Details Table + P&L Breakdown ────────────────────

    /**
     * Returns the table row data AND the P&L Breakdown section.
     * COGS is calculated live from sale_items (cost_price * quantity).
     * This is the data exported to CSV/PDF.
     */
    async getDailySummaryDetails(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', table: null, plBreakdown: null };
        }

        const dateRange = this.buildDateRange(dto.date);

        const summary = await this.prisma.dailySummary.findFirst({
            where: {
                summaryDate: dateRange,
                ...this.branchFilter(dto.branchId),
            },
        });

        if (!summary) {
            return {
                message: `No summary found for ${dto.date}.`,
                table: null,
                plBreakdown: null,
            };
        }

        // Fetch completed sales for live COGS calculation
        const sales = await this.prisma.ryzera_pos_sale.findMany({
            where: {
                sale_date:   dateRange,
                sale_status: SALE_STATUS_COMPLETED,
                ...this.saleBranchFilter(dto.branchId),
            },
            include: {
                sale_items: { select: { cost_price: true, quantity: true } },
            },
        });

        // Sum cost_price * quantity across all sale items
        const cogs = sales.reduce((sum, sale) =>
                sum + sale.sale_items.reduce((s, item) =>
                    s + this.toNumber(item.cost_price) * item.quantity, 0
                ), 0
        );

        const table = {
            date:         summary.summaryDate.toISOString().slice(0, 10),
            totalSales:   this.toNumber(summary.totalSales),
            transactions: summary.totalTransactions,
            itemsSold:    summary.totalItemsSold,
            discounts:    this.toNumber(summary.totalDiscounts),
            tax:          this.toNumber(summary.totalTax),
            returns:      this.toNumber(summary.totalReturns),
            netProfit:    this.toNumber(summary.netProfit),
        };

        const plBreakdown = {
            totalSales:      this.toNumber(summary.totalSales),
            costOfGoodsSold: parseFloat(cogs.toFixed(2)),
            grossProfit:     this.toNumber(summary.grossProfit),
            discounts:       this.toNumber(summary.totalDiscounts),
            returns:         this.toNumber(summary.totalReturns),
            taxCollected:    this.toNumber(summary.totalTax),
            netProfit:       this.toNumber(summary.netProfit),
            profitMargin:    this.toNumber(summary.totalSales) > 0
                ? parseFloat(((this.toNumber(summary.netProfit) / this.toNumber(summary.totalSales)) * 100).toFixed(1))
                : 0,
        };

        return { table, plBreakdown };
    }

    // ─── All Branches Summary (for "All Branches" tab in UI) ────────────

    /**
     * Returns KPI cards and table data for EVERY active branch on a given date.
     * Only SUPER_ADMIN can call this endpoint.
     * Used by the top-level "All Branches" tab in the Daily Summary UI.
     */
    async getAllBranchesSummary(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', branches: [] };
        }

        const dateRange = this.buildDateRange(dto.date);

        // Fetch all branch summaries for the date in one query
        const summaries = await this.prisma.dailySummary.findMany({
            where: { summaryDate: dateRange },
            orderBy: { branchId: 'asc' },
        });

        const result = summaries.map((s) => ({
            branchId:   s.branchId,
            kpi: {
                totalSales:     this.toNumber(s.totalSales),
                transactions:   s.totalTransactions,
                itemsSold:      s.totalItemsSold,
                totalCustomers: s.totalCustomers,
                grossProfit:    this.toNumber(s.grossProfit),
                netProfit:      this.toNumber(s.netProfit),
            },
        }));

        return { date: dto.date, branches: result };
    }

    // ─── Export CSV ──────────────────────────────────────────────────────

    async exportCsv(dto: QueryDailySummaryInput,user: JwtPayload): Promise<Buffer> {
        const result = await this.getDailySummaryDetails(dto);

        if (!result.table || !result.plBreakdown) {
            return Buffer.from('No data available.', 'utf-8');
        }
        const { table, plBreakdown } = result;

        const tableHeaders = [
            'Date', 'Total Sales', 'Transactions', 'Items Sold',
            'Discounts', 'Tax', 'Returns', 'Net Profit',
        ];
        const tableRow = [
            table.date, table.totalSales, table.transactions,
            table.itemsSold, table.discounts, table.tax,
            table.returns, table.netProfit,
        ];

        const plRows = [
            ['Total Sales',        plBreakdown.totalSales],
            ['Cost of Goods Sold', plBreakdown.costOfGoodsSold],
            ['Gross Profit',       plBreakdown.grossProfit],
            ['Discounts',          plBreakdown.discounts],
            ['Returns',            plBreakdown.returns],
            ['Tax Collected',      plBreakdown.taxCollected],
            ['Net Profit',         plBreakdown.netProfit],
            ['Profit Margin',      plBreakdown.profitMargin + '%'],
        ];

        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported CSV',
            reportType:  'Daily Summary',   // ← change this label per report
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',        });

        const lines = [
            tableHeaders.map((v) => `"${v}"`).join(','),
            tableRow.map((v) => `"${v}"`).join(','),
            '',
            '"P&L Breakdown","",""',
            ...plRows.map((r) => r.map((v) => `"${v}"`).join(',')),
        ];

        return Buffer.from(lines.join('\n'), 'utf-8');
    }

    // ─── Export PDF ──────────────────────────────────────────────────────

    async exportPdf(dto: QueryDailySummaryInput,user: JwtPayload): Promise<Buffer> {
        const result = await this.getDailySummaryDetails(dto);
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
        const doc         = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        const buffers: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));

        const pageWidth  = 841.89;
        const margin     = 40;
        const tableWidth = pageWidth - margin * 2;
        const rowHeight  = 22;
        const headerH    = 26;

        doc.rect(0, 0, pageWidth, 70).fill('#2C3E50');
        doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
            .text('Daily Summary Report', margin, 16, { align: 'center', width: tableWidth });
        doc.fontSize(9).font('Helvetica').fillColor('#BDC3C7')
            .text(`Date: ${dto.date}`, margin, 44, { align: 'center', width: tableWidth });

        const cols = [
            { label: 'Date',         key: 'date',         width: 100 },
            { label: 'Total Sales',  key: 'totalSales',   width: 100 },
            { label: 'Transactions', key: 'transactions', width: 90  },
            { label: 'Items Sold',   key: 'itemsSold',    width: 80  },
            { label: 'Discounts',    key: 'discounts',    width: 90  },
            { label: 'Tax',          key: 'tax',          width: 90  },
            { label: 'Returns',      key: 'returns',      width: 90  },
            { label: 'Net Profit',   key: 'netProfit',    width: 121 },
        ];

        // draw table rows (header + data)
        const drawRow = (y: number, rowData: Record<string, any>, isHeader = false, shaded = false) => {
            let x = margin;
            if (isHeader) { doc.rect(margin, y, tableWidth, headerH).fill('#2C3E50'); }
            else if (shaded) { doc.rect(margin, y, tableWidth, rowHeight).fill('#F2F4F6'); }
            cols.forEach((col) => {
                const cellH  = isHeader ? headerH : rowHeight;
                const value  = isHeader ? col.label : String(rowData[col.key] ?? '');
                const tColor = isHeader ? '#FFFFFF' : '#1A1A1A';
                doc.rect(x, y, col.width, cellH).strokeColor('#CCCCCC').lineWidth(0.5).stroke();
                doc.fillColor(tColor)
                    .fontSize(isHeader ? 8.5 : 8)
                    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                    .text(value, x + 5, y + (cellH - (isHeader ? 9 : 8)) / 2 + 1, {
                        width: col.width - 10, ellipsis: true, lineBreak: false,
                    });
                x += col.width;
            });
        };

        let y = 90;
        drawRow(y, {}, true);
        y += headerH;
        drawRow(y, {
            date:         table.date,
            totalSales:   table.totalSales.toFixed(2),
            transactions: String(table.transactions),
            itemsSold:    String(table.itemsSold),
            discounts:    table.discounts.toFixed(2),
            tax:          table.tax.toFixed(2),
            returns:      table.returns.toFixed(2),
            netProfit:    table.netProfit.toFixed(2),
        }, false, false);
        y += rowHeight + 20;

        doc.fillColor('#2C3E50').fontSize(12).font('Helvetica-Bold')
            .text('Profit & Loss Breakdown', margin, y);
        y += 20;

        const plRows = [
            ['Total Sales',        plBreakdown.totalSales.toFixed(2)],
            ['Cost of Goods Sold', plBreakdown.costOfGoodsSold.toFixed(2)],
            ['Gross Profit',       plBreakdown.grossProfit.toFixed(2)],
            ['Discounts',          plBreakdown.discounts.toFixed(2)],
            ['Returns',            plBreakdown.returns.toFixed(2)],
            ['Tax Collected',      plBreakdown.taxCollected.toFixed(2)],
            ['Net Profit',         plBreakdown.netProfit.toFixed(2)],
            ['Profit Margin',      plBreakdown.profitMargin + '%'],
        ];

        plRows.forEach(([label, value], i) => {
            const bg = i % 2 === 0 ? '#F2F4F6' : '#FFFFFF';
            doc.rect(margin, y, tableWidth, rowHeight).fill(bg);
            doc.fillColor('#1A1A1A').fontSize(9).font('Helvetica')
                .text(label, margin + 5, y + 6, { width: 200 });
            doc.text(value, margin + 210, y + 6);
            y += rowHeight;
        });

        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported PDF',
            reportType:  'Daily Summary',   // ← change this label per report
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',        });

        const footerY = doc.page.height - 28;
        doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY)
            .strokeColor('#CCCCCC').lineWidth(0.5).stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
            .text(`Generated: ${new Date().toDateString()}   |   Ryzera POS`,
                margin, footerY + 6, { align: 'center', width: tableWidth });

        doc.end();
        return new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
        });
    }
}
