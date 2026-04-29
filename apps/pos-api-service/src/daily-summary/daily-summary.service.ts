// ============================================================
// Daily Summary — Service
// File: apps/pos-api-service/src/daily-summary/daily-summary.service.ts
//
// Fixes applied vs original:
//  1. getKpiCards        — findFirst → findMany + reduce (aggregates all branches)
//  2. getDailySummaryDetails — findFirst → findMany + reduce (same fix)
//  3. getAllBranchesSummary  — includes branch { name, city } in query
//  4. buildFilterSummary    — corrected field name: uses dto.date (not dateFrom/dateTo)
// ============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }                  from '@ryzera/pos-database';
import { QueryDailySummaryInput }         from './schemas/daily-summary.schema';
import { AuditLogService }               from '../audit-log/audit-log.service';
import type { JwtPayload }               from '../common/interfaces/jwt-payload.interface';

// ─── Constants — avoids hard-coded strings scattered in logic ────────────────
const SALE_STATUS_COMPLETED = 'Completed';

@Injectable()
export class DailySummaryService {
    constructor(
        private readonly prisma:         PrismaService,
        private readonly auditLogService: AuditLogService,
    ) {}

    // ─── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Returns Prisma where-clause fragment for filtering DailySummary by branchId.
     * When branchId is undefined (All Branches), returns an empty object so that
     * findMany returns ALL branch summaries for the date.
     */
    private branchFilter(branchId?: number): object {
        return branchId ? { branchId: Number(branchId) } : {};
    }

    /**
     * Returns Prisma where-clause fragment for filtering ryzera_pos_sale by branchId.
     */
    private saleBranchFilter(branchId?: number): object {
        return branchId ? { branchId: Number(branchId) } : {};
    }

    /**
     * Builds a { gte: startOfDay, lte: endOfDay } date range for a given date string.
     * Centralises all date-boundary logic — avoids off-by-one on midnight edge.
     */
    private buildDateRange(dateStr: string): { gte: Date; lte: Date } {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        return { gte: start, lte: end };
    }

    /**
     * Converts a Prisma Decimal (or any numeric value) to a plain JS number rounded to 2dp.
     * Prisma returns BigDecimal objects from aggregations — always call this before
     * returning numbers to the controller.
     */
    private toNumber(val: unknown): number {
        return parseFloat(parseFloat(String(val ?? 0)).toFixed(2));
    }

    /**
     * FIX #4 — Corrected field name: uses dto.date (not dto.dateFrom/dto.dateTo).
     * Builds a human-readable filter summary for the audit log.
     */
    private buildFilterSummary(dto: QueryDailySummaryInput): string {
        return dto.date ?? 'All';
    }

    // ─── KPI Summary Cards ───────────────────────────────────────────────────

    /**
     * FIX #1 — Changed from findFirst to findMany + reduce.
     *
     * Returns the 6 KPI card values for the top of the Daily Summary page:
     * Total Sales, Transactions, Items Sold, Total Customers, Gross Profit, Net Profit.
     *
     * When branchId is undefined (All Branches), aggregates across ALL branch
     * summaries for the date. When branchId is set, returns that single branch's data.
     *
     * Data source: DailySummary table (pre-aggregated nightly).
     */
    async getKpiCards(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', kpi: null };
        }

        const dateRange = this.buildDateRange(dto.date);

        const summaries = await this.prisma.dailySummary.findMany({
            where: {
                summaryDate: dateRange,
                ...this.branchFilter(dto.branchId),
            },
        });

        if (!summaries.length) {
            return {
                message: `No summary found for ${dto.date}${
                    dto.branchId ? ` (branch ${dto.branchId})` : ''
                }.`,
                kpi: null,
            };
        }

        // Aggregate across all matching branches (or just one when branchId is set)
        const aggregated = summaries.reduce(
            (acc, s) => ({
                totalSales:     acc.totalSales     + this.toNumber(s.totalSales),
                transactions:   acc.transactions   + s.totalTransactions,
                itemsSold:      acc.itemsSold      + s.totalItemsSold,
                totalCustomers: acc.totalCustomers + s.totalCustomers,
                grossProfit:    acc.grossProfit    + this.toNumber(s.grossProfit),
                netProfit:      acc.netProfit      + this.toNumber(s.netProfit),
            }),
            {
                totalSales:     0,
                transactions:   0,
                itemsSold:      0,
                totalCustomers: 0,
                grossProfit:    0,
                netProfit:      0,
            },
        );

        return {
            kpi: {
                totalSales:     parseFloat(aggregated.totalSales.toFixed(2)),
                transactions:   aggregated.transactions,
                itemsSold:      aggregated.itemsSold,
                totalCustomers: aggregated.totalCustomers,
                grossProfit:    parseFloat(aggregated.grossProfit.toFixed(2)),
                netProfit:      parseFloat(aggregated.netProfit.toFixed(2)),
            },
        };
    }

    // ─── Hourly Sales Line Chart ─────────────────────────────────────────────

    /**
     * Returns hour-by-hour sales totals for the line chart.
     * Reads directly from ryzera_pos_sale (Completed only) for granular hourly data.
     * Returns all 24 hours (0–23) even when no sales occurred in a given hour,
     * so the chart always renders a full 24-point line.
     *
     * When branchId is undefined, aggregates completed sales across all branches.
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

        // Initialise all 24 hours to zero, then accumulate sale amounts per hour
        const hourlyTotals: Record<number, number> = {};
        for (let h = 0; h < 24; h++) hourlyTotals[h] = 0;

        for (const sale of sales) {
            const hour = sale.sale_date.getHours();
            hourlyTotals[hour] += this.toNumber(sale.total_amount);
        }

        const data = Object.entries(hourlyTotals).map(([hour, amount]) => ({
            hour:   `${String(hour).padStart(2, '0')}:00`,
            amount: parseFloat(amount.toFixed(2)),
        }));

        return { data };
    }

    // ─── Payment Methods Pie Chart ───────────────────────────────────────────

    /**
     * Returns payment breakdown by method (Cash, Card, Split, etc.)
     * with amount totals and percentage of total transactions.
     * Used by the pie chart on the Daily Summary page.
     *
     * Filters payments via the sale relation when branchId is provided,
     * so that only payments belonging to that branch are counted.
     */
    async getPaymentMethods(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', data: [] };
        }

        const dateRange = this.buildDateRange(dto.date);

        const paymentWhere: Record<string, unknown> = {
            payment_date: dateRange,
        };

        // Filter by branch via the sale relation (payments don't have a direct branchId)
        if (dto.branchId) {
            paymentWhere['sale'] = { branchId: Number(dto.branchId) };
        }

        const payments = await this.prisma.ryzera_pos_payment.findMany({
            where:  paymentWhere as any,
            select: { payment_method: true, amount_paid: true },
        });

        if (!payments.length) {
            return { totalTransactions: 0, data: [] };
        }

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
            percentage:
                totalTransactions > 0
                    ? parseFloat(((values.count / totalTransactions) * 100).toFixed(1))
                    : 0,
        }));

        return { totalTransactions, data };
    }

    // ─── Daily Summary Details Table + P&L Breakdown ────────────────────────

    /**
     * FIX #2 — Changed from findFirst to findMany + reduce.
     *
     * Returns the table row data AND the P&L Breakdown section.
     * COGS is calculated live from sale_items (cost_price × quantity) for accuracy.
     *
     * When branchId is undefined (All Branches), aggregates across all branch
     * summaries for the date. When branchId is set, returns that single branch's data.
     * This is the data exported to CSV/PDF.
     */
    async getDailySummaryDetails(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return {
                message:     'Please select a date.',
                table:       null,
                plBreakdown: null,
            };
        }

        const dateRange = this.buildDateRange(dto.date);

        const summaries = await this.prisma.dailySummary.findMany({
            where: {
                summaryDate: dateRange,
                ...this.branchFilter(dto.branchId),
            },
        });

        if (!summaries.length) {
            return {
                message:     `No summary found for ${dto.date}.`,
                table:       null,
                plBreakdown: null,
            };
        }

        // Aggregate all matching summaries (single branch or all branches)
        const aggregated = summaries.reduce(
            (acc, s) => ({
                summaryDate:       s.summaryDate,   // use first date (all are same date)
                totalSales:        acc.totalSales        + this.toNumber(s.totalSales),
                totalTransactions: acc.totalTransactions + s.totalTransactions,
                totalItemsSold:    acc.totalItemsSold    + s.totalItemsSold,
                totalDiscounts:    acc.totalDiscounts    + this.toNumber(s.totalDiscounts),
                totalTax:          acc.totalTax          + this.toNumber(s.totalTax),
                grossProfit:       acc.grossProfit       + this.toNumber(s.grossProfit),
                totalReturns:      acc.totalReturns      + this.toNumber(s.totalReturns),
                netProfit:         acc.netProfit         + this.toNumber(s.netProfit),
            }),
            {
                summaryDate:       new Date(dto.date),
                totalSales:        0,
                totalTransactions: 0,
                totalItemsSold:    0,
                totalDiscounts:    0,
                totalTax:          0,
                grossProfit:       0,
                totalReturns:      0,
                netProfit:         0,
            },
        );

        // Fetch completed sales for live COGS calculation (cost_price × quantity)
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

        // Sum cost_price × quantity across all sale items
        const cogs = sales.reduce(
            (sum, sale) =>
                sum +
                sale.sale_items.reduce(
                    (s, item) => s + this.toNumber(item.cost_price) * item.quantity,
                    0,
                ),
            0,
        );

        const table = {
            date:         aggregated.summaryDate.toISOString().slice(0, 10),
            totalSales:   parseFloat(aggregated.totalSales.toFixed(2)),
            transactions: aggregated.totalTransactions,
            itemsSold:    aggregated.totalItemsSold,
            discounts:    parseFloat(aggregated.totalDiscounts.toFixed(2)),
            tax:          parseFloat(aggregated.totalTax.toFixed(2)),
            returns:      parseFloat(aggregated.totalReturns.toFixed(2)),
            netProfit:    parseFloat(aggregated.netProfit.toFixed(2)),
        };

        const plBreakdown = {
            totalSales:      parseFloat(aggregated.totalSales.toFixed(2)),
            costOfGoodsSold: parseFloat(cogs.toFixed(2)),
            grossProfit:     parseFloat(aggregated.grossProfit.toFixed(2)),
            discounts:       parseFloat(aggregated.totalDiscounts.toFixed(2)),
            returns:         parseFloat(aggregated.totalReturns.toFixed(2)),
            taxCollected:    parseFloat(aggregated.totalTax.toFixed(2)),
            netProfit:       parseFloat(aggregated.netProfit.toFixed(2)),
            profitMargin:
                aggregated.totalSales > 0
                    ? parseFloat(
                        ((aggregated.netProfit / aggregated.totalSales) * 100).toFixed(1),
                    )
                    : 0,
        };

        return { table, plBreakdown };
    }

    // ─── All Branches Summary (Per Branch tab) ───────────────────────────────

    /**
     * FIX #3 — Now includes branch name and city via Prisma relation include.
     *
     * Returns KPI cards and table data for EVERY active branch on a given date.
     * Only SUPER_ADMIN can call this endpoint (enforced by @Roles in controller).
     * Used by the "Per Branch" tab in the Daily Summary UI.
     */
    async getAllBranchesSummary(dto: QueryDailySummaryInput) {
        if (!dto.date) {
            return { message: 'Please select a date.', branches: [] };
        }

        const dateRange = this.buildDateRange(dto.date);

        // ── Step 1: ALL active branches (source of truth for the tab) ─────────────
        const allBranches = await this.prisma.branch.findMany({
            where:   { is_active: true },
            select:  { branchId: true, name: true, city: true },
            orderBy: { name: 'asc' },
        });

        // ── Step 2: Only branches that have a DailySummary record on this date ─────
        const summaries = await this.prisma.dailySummary.findMany({
            where:   { summaryDate: dateRange },
            orderBy: { branchId: 'asc' },
        });

        // ── Step 3: O(1) lookup map: branchId → summary ───────────────────────────
        const summaryMap = new Map(
            summaries.map((s) => [s.branchId, s]),
        );

        // ── Step 4: Merge — every branch appears; those with no data get zeros ─────
        const branches = allBranches.map((b) => {
            const s = summaryMap.get(b.branchId);

            return {
                branchId:   b.branchId,
                branchName: b.name,
                branchCity: b.city ?? null,
                hasData:    !!s,
                kpi: s
                    ? {
                        totalSales:     this.toNumber(s.totalSales),
                        transactions:   s.totalTransactions,
                        itemsSold:      s.totalItemsSold,
                        totalCustomers: s.totalCustomers,
                        grossProfit:    this.toNumber(s.grossProfit),
                        netProfit:      this.toNumber(s.netProfit),
                    }
                    : {
                        totalSales:     0,
                        transactions:   0,
                        itemsSold:      0,
                        totalCustomers: 0,
                        grossProfit:    0,
                        netProfit:      0,
                    },
            };
        });

        return { date: dto.date, branches };
    }

    // ─── Export CSV ──────────────────────────────────────────────────────────

    /**
     * Generates a CSV buffer from the daily summary details for the given date/branch.
     * Includes the summary table row and the full P&L breakdown section.
     * Records an audit log entry after generation.
     */
    async exportCsv(dto: QueryDailySummaryInput, user: JwtPayload): Promise<Buffer> {
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
            ['Total Sales',        plBreakdown.totalSales],
            ['Cost of Goods Sold', plBreakdown.costOfGoodsSold],
            ['Gross Profit',       plBreakdown.grossProfit],
            ['Discounts',          plBreakdown.discounts],
            ['Returns',            plBreakdown.returns],
            ['Tax Collected',      plBreakdown.taxCollected],
            ['Net Profit',         plBreakdown.netProfit],
            ['Profit Margin',      `${plBreakdown.profitMargin}%`],
        ];

        // FIX #4 — use buildFilterSummary with correct field
        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported CSV',
            reportType:  'Daily Summary',
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',
        });

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

    /**
     * Generates a styled PDF buffer from the daily summary details.
     * Includes the summary table row and the full P&L breakdown section.
     * Records an audit log entry after generation.
     */
    async exportPdf(dto: QueryDailySummaryInput, user: JwtPayload): Promise<Buffer> {
        const result = await this.getDailySummaryDetails(dto);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const PDFDocument = require('pdfkit');

        if (!result.table || !result.plBreakdown) {
            const doc      = new PDFDocument();
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.text('No data available. Please select a valid date.');
            doc.end();
            return new Promise((resolve) => {
                doc.on('end', () => resolve(Buffer.concat(buffers)));
            });
        }

        const { table, plBreakdown } = result;

        const doc      = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        const buffers: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));

        const pageWidth  = 841.89;
        const margin     = 40;
        const tableWidth = pageWidth - margin * 2;
        const rowHeight  = 22;
        const headerH    = 26;

        // ── Header banner ───────────────────────────────────────────────────
        doc.rect(0, 0, pageWidth, 70).fill('#2C3E50');
        doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
            .text('Daily Summary Report', margin, 16, { align: 'center', width: tableWidth });
        doc.fontSize(9).font('Helvetica').fillColor('#BDC3C7')
            .text(`Date: ${dto.date}`, margin, 44, { align: 'center', width: tableWidth });

        // ── Summary table ───────────────────────────────────────────────────
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

        const drawRow = (
            y: number,
            rowData: Record<string, string>,
            isHeader = false,
            shaded   = false,
        ) => {
            let x = margin;
            if (isHeader) {
                doc.rect(margin, y, tableWidth, headerH).fill('#2C3E50');
            } else if (shaded) {
                doc.rect(margin, y, tableWidth, rowHeight).fill('#F2F4F6');
            }
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
        drawRow(y, {} as Record<string, string>, true);
        y += headerH;
        drawRow(
            y,
            {
                date:         table.date,
                totalSales:   table.totalSales.toFixed(2),
                transactions: String(table.transactions),
                itemsSold:    String(table.itemsSold),
                discounts:    table.discounts.toFixed(2),
                tax:          table.tax.toFixed(2),
                returns:      table.returns.toFixed(2),
                netProfit:    table.netProfit.toFixed(2),
            },
            false,
            false,
        );
        y += rowHeight + 20;

        // ── P&L Breakdown ───────────────────────────────────────────────────
        doc.fillColor('#2C3E50').fontSize(12).font('Helvetica-Bold')
            .text('Profit & Loss Breakdown', margin, y);
        y += 20;

        const plRows: [string, string][] = [
            ['Total Sales',        plBreakdown.totalSales.toFixed(2)],
            ['Cost of Goods Sold', plBreakdown.costOfGoodsSold.toFixed(2)],
            ['Gross Profit',       plBreakdown.grossProfit.toFixed(2)],
            ['Discounts',          plBreakdown.discounts.toFixed(2)],
            ['Returns',            plBreakdown.returns.toFixed(2)],
            ['Tax Collected',      plBreakdown.taxCollected.toFixed(2)],
            ['Net Profit',         plBreakdown.netProfit.toFixed(2)],
            ['Profit Margin',      `${plBreakdown.profitMargin}%`],
        ];

        plRows.forEach(([label, value], i) => {
            const bg = i % 2 === 0 ? '#F2F4F6' : '#FFFFFF';
            doc.rect(margin, y, tableWidth, rowHeight).fill(bg);
            doc.fillColor('#1A1A1A').fontSize(9).font('Helvetica')
                .text(label, margin + 5, y + 6, { width: 200 });
            doc.text(value, margin + 210, y + 6);
            y += rowHeight;
        });

        // FIX #4 — use buildFilterSummary with correct field
        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported PDF',
            reportType:  'Daily Summary',
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',
        });

        // ── Footer ──────────────────────────────────────────────────────────
        const footerY = doc.page.height - 28;
        doc.moveTo(margin, footerY)
            .lineTo(pageWidth - margin, footerY)
            .strokeColor('#CCCCCC')
            .lineWidth(0.5)
            .stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
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