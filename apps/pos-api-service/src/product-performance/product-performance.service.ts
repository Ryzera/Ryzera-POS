import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import type { ResolvedProductPerformanceFilter } from './schemas/product-performance.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DATE_FROM = new Date('2026-01-01T00:00:00.000Z');
const TOP_PRODUCTS_LIMIT = 10;
const EXPORT_LIMIT = 999_999;

// ─── Internal Types ───────────────────────────────────────────────────────────

interface AggregatedProduct {
    category: string;
    productType: string;
    unitsSold: number;
    revenue: number;
    cost: number;
}

// Raw row returned by the Prisma sale_item query
type SaleItemRow = {
    product_name: string;
    quantity: number;
    total_amount: number;
    cost_price: number;
    product: {
        unit: string;                    // UnitOfMeasure enum: PCS | KG | PACK | LTR | BOX | MTR
        category: { name: string } | null;
    } | null;
};

@Injectable()
export class ProductPerformanceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLogService: AuditLogService,
    ) {}

    // ────────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ────────────────────────────────────────────────────────────────────────────

    private buildSaleItemWhere(
        filter: ResolvedProductPerformanceFilter,
    ): object {
        const dateFrom = filter.dateFrom
            ? new Date(filter.dateFrom)
            : DEFAULT_DATE_FROM;
        const dateTo = filter.dateTo
            ? new Date(`${filter.dateTo}T23:59:59.999Z`)
            : new Date();

        const saleWhere: Record<string, unknown> = {
            sale_date: { gte: dateFrom, lte: dateTo },
        };

        if (filter.resolvedBranchId !== undefined) {
            saleWhere['branchId'] = filter.resolvedBranchId;
        }

        const where: Record<string, unknown> = { sale: saleWhere };

        if (filter.category) {
            where['product'] = {
                category: {
                    name: { contains: filter.category, mode: 'insensitive' },
                },
            };
        }

        return where;
    }

    private buildPaymentWhere(
        filter: ResolvedProductPerformanceFilter,
    ): object {
        const dateFrom = filter.dateFrom
            ? new Date(filter.dateFrom)
            : DEFAULT_DATE_FROM;
        const dateTo = filter.dateTo
            ? new Date(`${filter.dateTo}T23:59:59.999Z`)
            : new Date();

        const where: Record<string, unknown> = {
            payment_date: { gte: dateFrom, lte: dateTo },
        };

        if (filter.resolvedBranchId !== undefined) {
            where['sale'] = { branchId: filter.resolvedBranchId };
        }

        return where;
    }

    private groupSaleItemsByProduct(
        items: SaleItemRow[],
    ): Record<string, AggregatedProduct> {
        const grouped: Record<string, AggregatedProduct> = {};

        for (const item of items) {
            const name = item.product_name;

            if (!grouped[name]) {
                grouped[name] = {
                    category:    item.product?.category?.name ?? 'Unknown',
                    // unit is the real "type" field on InvProduct (PCS | KG | PACK | LTR | BOX | MTR)
                    productType: item.product?.unit ?? 'N/A',
                    unitsSold: 0,
                    revenue: 0,
                    cost: 0,
                };
            }

            grouped[name].unitsSold += item.quantity;
            grouped[name].revenue   += item.total_amount;
            grouped[name].cost      += item.cost_price * item.quantity;
        }

        return grouped;
    }

    private buildFilterSummary(dto: { dateFrom?: string; dateTo?: string; category?: string; branchId?: number }): string {
        const parts: string[] = [];
        if (dto.dateFrom && dto.dateTo) parts.push(`${dto.dateFrom} – ${dto.dateTo}`);
        if (dto.category)               parts.push(dto.category);
        return parts.join(', ') || 'All';
    }

    private round2(value: number): number {
        return parseFloat(value.toFixed(2));
    }

    // ────────────────────────────────────────────────────────────────────────────
    // KPI Cards
    // ────────────────────────────────────────────────────────────────────────────

    async getKpiCards(filter: ResolvedProductPerformanceFilter) {
        const where = this.buildSaleItemWhere(filter);

        const items = await this.prisma.ryzera_pos_sale_item.findMany({
            where,
            select: {
                product_name: true,
                quantity: true,
                total_amount: true,
                cost_price: true,
                product: {
                    select: { category: { select: { name: true } } },
                },
            },
        });

        if (items.length === 0) {
            return {
                totalProductsSold:  0,
                topSellingProduct:  'N/A',   // FIX: renamed from topSellingCategory
                topSellingCategory: 'N/A',   // kept for backwards-compat if anything still reads it
                totalRevenue:       0,
                totalProfit:        0,
            };
        }

        // FIX: track qty per product name (not category) to find top selling product
        const productQtyMap:  Record<string, number> = {};
        const categoryQtyMap: Record<string, number> = {};
        let totalProductsSold = 0;
        let totalRevenue      = 0;
        let totalProfit       = 0;

        for (const item of items) {
            totalProductsSold += item.quantity;
            totalRevenue      += item.total_amount;
            totalProfit       += item.total_amount - item.cost_price * item.quantity;

            const productName  = item.product_name;
            const categoryName = item.product?.category?.name ?? 'Unknown';

            productQtyMap[productName]   = (productQtyMap[productName]   ?? 0) + item.quantity;
            categoryQtyMap[categoryName] = (categoryQtyMap[categoryName] ?? 0) + item.quantity;
        }

        // Top selling product (by units sold)
        const topSellingProduct =
            Object.entries(productQtyMap).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'N/A';

        // Top selling category (kept for internal use / backwards compat)
        const topSellingCategory =
            Object.entries(categoryQtyMap).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'N/A';

        return {
            totalProductsSold:  Math.round(totalProductsSold),
            topSellingProduct,   // FIX: this is what the KPI card should display
            topSellingCategory,  // kept for backwards compat
            totalRevenue:        this.round2(totalRevenue),
            totalProfit:         this.round2(totalProfit),
        };
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Top Products (Bar Chart)
    // ────────────────────────────────────────────────────────────────────────────

    async getTopProducts(filter: ResolvedProductPerformanceFilter) {
        const where = this.buildSaleItemWhere(filter);

        const items = await this.prisma.ryzera_pos_sale_item.findMany({
            where,
            select: {
                product_name: true,
                quantity: true,
            },
        });

        const grouped: Record<string, number> = {};
        for (const item of items) {
            grouped[item.product_name] =
                (grouped[item.product_name] ?? 0) + item.quantity;
        }

        const top = Object.entries(grouped)
            .sort(([, a], [, b]) => b - a)
            .slice(0, TOP_PRODUCTS_LIMIT)
            .map(([productName, totalQuantitySold]) => ({
                productName,
                totalQuantitySold: this.round2(totalQuantitySold),
            }));

        return {
            message: 'Top products fetched successfully.',
            count: top.length,
            data: top,
        };
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Payment Method Breakdown (Pie Chart)
    // ────────────────────────────────────────────────────────────────────────────

    async getPaymentMethodBreakdown(filter: ResolvedProductPerformanceFilter) {
        // ── Step 1: find all saleIds that match the sale_item filter ─────────────
        // This ensures the payment breakdown respects the category filter.
        // buildPaymentWhere only knows about date + branch, not category, so
        // querying payments directly would show payments for ALL categories.
        const saleItemWhere = this.buildSaleItemWhere(filter);

        const matchingItems = await this.prisma.ryzera_pos_sale_item.findMany({
            where: saleItemWhere,
            select: { saleId: true },
        });

        // If no matching sale items exist, return empty — no pie chart.
        if (matchingItems.length === 0) {
            return { totalTransactions: 0, data: [] };
        }

        const saleIds = [...new Set(matchingItems.map(i => i.saleId))];

        // ── Step 2: fetch payments only for those sales ───────────────────────────
        const payments = await this.prisma.ryzera_pos_payment.findMany({
            where: { saleId: { in: saleIds } },
            select: {
                payment_method: true,
                amount_paid:    true,
            },
        });

        const grouped: Record<
            string,
            { count: number; totalAmount: number }
        > = {};

        for (const payment of payments) {
            const method: string = payment.payment_method as string;
            if (!grouped[method])
                grouped[method] = { count: 0, totalAmount: 0 };
            grouped[method].count      += 1;
            grouped[method].totalAmount += payment.amount_paid;
        }

        const totalTransactions = payments.length;

        // FIX: if no payments exist at all, return empty data array so the
        // frontend can correctly show "No payment data" instead of a 100% slice.
        if (totalTransactions === 0) {
            return { totalTransactions: 0, data: [] };
        }

        const data = Object.entries(grouped).map(
            ([paymentMethod, values]) => ({
                paymentMethod,
                count:       values.count,
                totalAmount: this.round2(values.totalAmount),
                percentage:  this.round2((values.count / totalTransactions) * 100),
            }),
        );

        return { totalTransactions, data };
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Per-Branch Summary (SUPER_ADMIN only)
    // ────────────────────────────────────────────────────────────────────────────

    async getPerBranchSummary(filter: ResolvedProductPerformanceFilter) {
        const branches = await this.prisma.branch.findMany({
            where: { is_active: true },
            select: { branchId: true, name: true },
            orderBy: { branchId: 'asc' },
        });

        const result = await Promise.all(
            branches.map(async (branch) => {
                const branchFilter: ResolvedProductPerformanceFilter = {
                    ...filter,
                    resolvedBranchId: branch.branchId,
                };

                const itemsWhere = this.buildSaleItemWhere(branchFilter);

                // Top 5 products for this branch (by units sold)
                const items = await this.prisma.ryzera_pos_sale_item.findMany({
                    where: itemsWhere,
                    select: {
                        saleId:       true,
                        product_name: true,
                        quantity:     true,
                        total_amount: true,
                    },
                });

                const qtyMap:     Record<string, number> = {};
                const revenueMap: Record<string, number> = {};

                for (const item of items) {
                    qtyMap[item.product_name]     = (qtyMap[item.product_name]     ?? 0) + item.quantity;
                    revenueMap[item.product_name] = (revenueMap[item.product_name] ?? 0) + item.total_amount;
                }

                const topProducts = Object.entries(qtyMap)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([productName, unitsSold], index) => ({
                        rank:        index + 1,
                        productName,
                        unitsSold:   Math.round(unitsSold),
                        revenue:     this.round2(revenueMap[productName] ?? 0),
                    }));

                // Payment breakdown: scope to saleIds from matching items only,
                // so category filter is respected (same fix as getPaymentMethodBreakdown).
                const branchSaleIds = [...new Set(items.map(i => i.saleId))];

                const payments = branchSaleIds.length === 0
                    ? []
                    : await this.prisma.ryzera_pos_payment.findMany({
                        where: { saleId: { in: branchSaleIds } },
                        select: { payment_method: true, amount_paid: true },
                    });

                const pmGrouped: Record<string, { count: number; totalAmount: number }> = {};
                for (const p of payments) {
                    const method: string = p.payment_method as string;
                    if (!pmGrouped[method]) pmGrouped[method] = { count: 0, totalAmount: 0 };
                    pmGrouped[method].count       += 1;
                    pmGrouped[method].totalAmount += p.amount_paid;
                }

                const totalTxn = payments.length;

                // FIX: empty data array when no payments — prevents 100% Cash phantom slice
                const paymentMethods = totalTxn === 0
                    ? []
                    : Object.entries(pmGrouped).map(([method, v]) => ({
                        paymentMethod: method,
                        count:         v.count,
                        totalAmount:   this.round2(v.totalAmount),
                        percentage:    this.round2((v.count / totalTxn) * 100),
                    }));

                return {
                    branchId: branch.branchId,
                    branchName: branch.name,
                    topProducts,
                    paymentMethods,
                };
            }),
        );

        return {
            message: 'Per-branch summary fetched successfully.',
            branches: result,
        };
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Product Table (Paginated)
    // ────────────────────────────────────────────────────────────────────────────

    async getProductTable(filter: ResolvedProductPerformanceFilter) {
        const page  = filter.page  ?? 1;
        const limit = filter.limit ?? 10;
        const skip  = (page - 1) * limit;

        const where = this.buildSaleItemWhere(filter);

        const items = await this.prisma.ryzera_pos_sale_item.findMany({
            where,
            select: {
                product_name: true,
                quantity: true,
                total_amount: true,
                cost_price: true,
                product: {
                    select: {
                        unit:     true,
                        category: { select: { name: true } },
                    },
                },
            },
        });

        const grouped = this.groupSaleItemsByProduct(items);

        const rows = Object.entries(grouped)
            .map(([productName, values]) => {
                const profit = values.revenue - values.cost;
                return {
                    productName,
                    category:    values.category,
                    productType: values.productType,
                    unitsSold:   Math.round(values.unitsSold),
                    revenue:     this.round2(values.revenue),
                    cost:        this.round2(values.cost),
                    profit:      this.round2(profit),
                    profitMargin:
                        values.revenue > 0
                            ? this.round2((profit / values.revenue) * 100)
                            : 0,
                };
            })
            .sort((a, b) => b.revenue - a.revenue);

        const totalRecords = rows.length;
        const paginated    = rows.slice(skip, skip + limit);
        const totalPages   = Math.ceil(totalRecords / limit);

        return {
            data: paginated,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Export to CSV
    // ────────────────────────────────────────────────────────────────────────────

    async exportToCsv(
        filter: ResolvedProductPerformanceFilter,
        user: JwtPayload,
    ): Promise<string> {
        const allFilter = { ...filter, page: 1, limit: EXPORT_LIMIT };
        const result    = await this.getProductTable(allFilter);

        const headers = [
            'Product Name',
            'Category',
            'Units Sold',
            'Revenue',
            'Cost',
            'Profit',
            'Profit Margin (%)',
        ].join(',');

        const rows = result.data.map((row) =>
            [
                `"${row.productName}"`,
                row.category,
                row.unitsSold,
                row.revenue,
                row.cost,
                row.profit,
                row.profitMargin,
            ].join(','),
        );

        // Audit: fire-and-forget — never blocks the CSV response
        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported CSV',
            reportType:  'Product Perf.',
            filtersUsed: this.buildFilterSummary(filter),
            branchName:  filter.resolvedBranchId ? `Branch ${filter.resolvedBranchId}` : 'All',
        });

        return [headers, ...rows].join('\n');
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Export to PDF
    // ────────────────────────────────────────────────────────────────────────────

    async exportToPdf(
        filter: ResolvedProductPerformanceFilter, user: JwtPayload): Promise<Buffer> {
        const dateFrom = filter.dateFrom
            ? new Date(filter.dateFrom)
            : DEFAULT_DATE_FROM;
        const dateTo = filter.dateTo
            ? new Date(`${filter.dateTo}T23:59:59.999Z`)
            : new Date();

        const allFilter             = { ...filter, page: 1, limit: EXPORT_LIMIT };
        const { data: rows }        = await this.getProductTable(allFilter);

        const totalUnitsSold = rows.reduce((s, r) => s + r.unitsSold, 0);
        const totalRevenue   = rows.reduce((s, r) => s + r.revenue,   0);
        const totalCost      = rows.reduce((s, r) => s + r.cost,      0);
        const totalProfit    = rows.reduce((s, r) => s + r.profit,    0);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const PDFDocument = require('pdfkit') as typeof import('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));

        const PAGE_WIDTH = 841.89;
        const MARGIN     = 40;
        const TABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
        const ROW_HEIGHT  = 22;
        const HEADER_H    = 26;

        const cols = [
            { label: 'Product Name',  key: 'productName',  width: 190 },
            { label: 'Category',      key: 'category',     width: 120 },
            { label: 'Units Sold',    key: 'unitsSold',    width: 80  },
            { label: 'Revenue (Rs)',  key: 'revenue',      width: 110 },
            { label: 'Cost (Rs)',     key: 'cost',         width: 105 },
            { label: 'Profit (Rs)',   key: 'profit',       width: 105 },
            { label: 'Margin (%)',    key: 'profitMargin', width: 91  },
        ];

        const drawRow = (
            y: number,
            rowData: Record<string, unknown>,
            isHeader = false,
            shaded   = false,
        ): void => {
            let x = MARGIN;
            if (isHeader) {
                doc.rect(MARGIN, y, TABLE_WIDTH, HEADER_H).fill('#2C3E50');
            } else if (shaded) {
                doc.rect(MARGIN, y, TABLE_WIDTH, ROW_HEIGHT).fill('#F2F4F6');
            }

            cols.forEach((col) => {
                const cellH    = isHeader ? HEADER_H : ROW_HEIGHT;
                const value    = isHeader ? col.label : String(rowData[col.key] ?? '');
                let textColor  = isHeader ? '#FFFFFF' : '#1A1A1A';

                if (!isHeader && col.key === 'profitMargin') {
                    const pct = parseFloat(value);
                    textColor = pct >= 30 ? '#27AE60' : pct >= 15 ? '#E67E22' : '#E74C3C';
                }
                if (!isHeader && col.key === 'profit') {
                    const val = parseFloat(value);
                    textColor = val > 0 ? '#27AE60' : val < 0 ? '#E74C3C' : '#1A1A1A';
                }

                doc.rect(x, y, col.width, cellH).strokeColor('#CCCCCC').lineWidth(0.5).stroke();
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
            });
        };

        // Header banner
        doc.rect(0, 0, PAGE_WIDTH, 70).fill('#2C3E50');
        doc
            .fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
            .text('Product Performance Report', MARGIN, 16, { align: 'center', width: TABLE_WIDTH });
        doc
            .fontSize(9).font('Helvetica').fillColor('#BDC3C7')
            .text(
                `Date Range: ${dateFrom.toDateString()}  \u2013  ${dateTo.toDateString()}` +
                (filter.category ? `   |   Category: ${filter.category}` : ''),
                MARGIN, 44, { align: 'center', width: TABLE_WIDTH },
            );

        // KPI summary strip
        doc.rect(0, 70, PAGE_WIDTH, 36).fill('#1A252F');
        const kpis = [
            { label: 'Total Products', value: String(rows.length) },
            { label: 'Units Sold',     value: String(totalUnitsSold) },
            { label: 'Total Revenue',  value: `Rs ${totalRevenue.toFixed(2)}` },
            { label: 'Total Cost',     value: `Rs ${totalCost.toFixed(2)}`    },
            { label: 'Total Profit',   value: `Rs ${totalProfit.toFixed(2)}`  },
        ];
        const kpiW = TABLE_WIDTH / kpis.length;
        kpis.forEach((kpi, i) => {
            const kx = MARGIN + i * kpiW;
            doc.fillColor('#BDC3C7').fontSize(7).font('Helvetica')
                .text(kpi.label, kx, 76, { width: kpiW, align: 'center' });
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
                .text(kpi.value, kx, 87, { width: kpiW, align: 'center' });
        });

        // Table
        let y = 118;
        drawRow(y, {}, true);
        y += HEADER_H;

        rows.forEach((row, i) => {
            if (y + ROW_HEIGHT > doc.page.height - MARGIN) {
                doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
                y = MARGIN;
                drawRow(y, {}, true);
                y += HEADER_H;
            }
            drawRow(
                y,
                {
                    productName:  row.productName,
                    category:     row.category,
                    unitsSold:    String(row.unitsSold),
                    revenue:      row.revenue.toFixed(2),
                    cost:         row.cost.toFixed(2),
                    profit:       row.profit.toFixed(2),
                    profitMargin: row.profitMargin.toFixed(2) + '%',
                },
                false,
                i % 2 === 0,
            );
            y += ROW_HEIGHT;
        });

        // Audit: fire-and-forget — never blocks the PDF response
        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported PDF',
            reportType:  'Product Perf.',
            filtersUsed: this.buildFilterSummary(filter),
            branchName:  filter.resolvedBranchId ? `Branch ${filter.resolvedBranchId}` : 'All',
        });

        // Footer
        const footerY = doc.page.height - 28;
        doc.moveTo(MARGIN, footerY).lineTo(PAGE_WIDTH - MARGIN, footerY)
            .strokeColor('#CCCCCC').lineWidth(0.5).stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
            .text(
                `Generated: ${new Date().toDateString()}   |   Ryzera POS`,
                MARGIN, footerY + 6, { align: 'center', width: TABLE_WIDTH },
            );

        doc.end();

        return new Promise<Buffer>((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(buffers)));
        });
    }
}