import {
    Injectable,
    ConflictException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService }       from '@ryzera/pos-database';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { QuerySalesReportDto, CreateSummaryDto } from './schemas/sales-report.schema';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// ─── Internal helper types ────────────────────────────────────────────────────
interface PaymentGroup {
    count:       number;
    totalAmount: number;
}

@Injectable()
export class SalesReportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLogService: AuditLogService,
    ) {}

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private buildSaleBranchFilter(branchId?: number): object {
        return branchId ? { branchId: Number(branchId) } : {};
    }

    private buildSummaryBranchFilter(branchId?: number): object {
        return branchId != null ? { branchId: Number(branchId) } : {};
    }

    private formatSummaryRecord(record: Record<string, unknown>) {
        return {
            ...record,
            summaryDate: record['summaryDate'] instanceof Date
                ? (record['summaryDate'] as Date).toISOString().slice(0, 10)
                : record['summaryDate'],
            createdAt: record['createdAt'] instanceof Date
                ? (record['createdAt'] as Date).toISOString().slice(0, 16).replace('T', ' ')
                : record['createdAt'],
            updatedAt: record['updatedAt'] instanceof Date
                ? (record['updatedAt'] as Date).toISOString().slice(0, 16).replace('T', ' ')
                : record['updatedAt'],
        };
    }

    private buildFilterSummary(dto: { dateFrom?: string; dateTo?: string; category?: string; branchId?: number }): string {
        const parts: string[] = [];
        if (dto.dateFrom && dto.dateTo) parts.push(`${dto.dateFrom} – ${dto.dateTo}`);
        if (dto.category)               parts.push(dto.category);
        return parts.join(', ') || 'All';
    }

    /**
     * ✅ SHARED where-clause builder used by getSalesTransactions, exportToCsv, exportToPdf.
     * Applies all active filters: date range, branch, status, search, category, product.
     * This ensures exports always match the filtered transaction table exactly.
     */
    private buildSaleWhereClause(
        dto: QuerySalesReportDto & { branchId?: number },
    ): Record<string, unknown> {
        const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : new Date('2026-01-01');
        const dateTo   = dto.dateTo   ? new Date(dto.dateTo)   : new Date();
        dateTo.setHours(23, 59, 59, 999);

        const where: Record<string, unknown> = {
            sale_date: { gte: dateFrom, lte: dateTo },
            ...this.buildSaleBranchFilter(dto.branchId),
        };

        if (dto.status) {
            where['sale_status'] = dto.status;
        }

        if (dto.search) {
            where['invoice_number'] = {
                contains: dto.search.trim(),
                mode:     'insensitive',
            };
        }

        // Category and/or product filters via nested sale_items relation
        if (dto.category && dto.product) {
            where['sale_items'] = {
                some: {
                    product_name: { contains: dto.product,  mode: 'insensitive' },
                    product: {
                        category: { name: { contains: dto.category, mode: 'insensitive' } },
                    },
                },
            };
        } else if (dto.category) {
            where['sale_items'] = {
                some: {
                    product: {
                        category: { name: { contains: dto.category, mode: 'insensitive' } },
                    },
                },
            };
        } else if (dto.product) {
            where['sale_items'] = {
                some: { product_name: { contains: dto.product, mode: 'insensitive' } },
            };
        }

        return where;
    }

    // ─── KPI Summary Cards ──────────────────────────────────────────────────────
    async getSummaryCards(dto: QuerySalesReportDto & { branchId?: number }) {
        // ✅ Use EXACT same where clause as getSalesTransactions
        // Do NOT hardcode sale_status: 'Completed' here —
        // let it follow whatever status filter the user applied (or none)
        const where = this.buildSaleWhereClause(dto);

        const sales = await this.prisma.ryzera_pos_sale.findMany({
            where: where as any,
            select: {
                total_amount: true,
                sale_status:  true,
                sale_items: {
                    select: { quantity: true },
                },
            },
        });

        if (sales.length === 0) {
            return { totalRevenue: 0, totalTransactions: 0, totalItems: 0, averageSales: 0 };
        }

        // ✅ Revenue: only sum Completed sales (cancelled shouldn't count toward revenue)
        // ✅ But totalTransactions counts ALL statuses shown in the table
        const completedSales    = sales.filter(s => s.sale_status === 'Completed');
        const totalRevenue      = completedSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
        const totalItems        = completedSales.reduce(
            (sum, s) => sum + s.sale_items.reduce((i, si) => i + si.quantity, 0), 0
        );
        const totalTransactions = sales.length; // all statuses, matches table row count
        const averageSales      = completedSales.length > 0
            ? parseFloat((totalRevenue / completedSales.length).toFixed(2))
            : 0;

        return {
            totalRevenue:      parseFloat(totalRevenue.toFixed(2)),
            totalTransactions,
            totalItems:        Math.round(totalItems),
            averageSales,
        };
    }

    // ─── Bar Chart Data ─────────────────────────────────────────────────────────
    // REPLACE the entire getChartData method:
    async getChartData(dto: QuerySalesReportDto & { branchId?: number }) {
        const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : new Date('2026-01-01');
        const dateTo   = dto.dateTo   ? new Date(dto.dateTo)   : new Date();
        dateTo.setHours(23, 59, 59, 999);

        // If category/product filter is active, read from ryzera_pos_sale
        // (DailySummary has no category breakdown)
        if (dto.category || dto.product) {
            const where = this.buildSaleWhereClause({
                ...dto,
                // Only completed sales count for chart
            });
            (where as any)['sale_status'] = 'Completed';

            const sales = await this.prisma.ryzera_pos_sale.findMany({
                where:   where as any,
                select:  { sale_date: true, total_amount: true },
                orderBy: { sale_date: 'asc' },
            });

            // Group by date
            const grouped: Record<string, number> = {};
            for (const s of sales) {
                const date = s.sale_date.toISOString().slice(0, 10);
                grouped[date] = (grouped[date] ?? 0) + Number(s.total_amount);
            }

            const data = Object.entries(grouped).map(([date, amount]) => ({
                date,
                amount:       parseFloat(amount.toFixed(2)),
                transactions: 0,
                netProfit:    0,
                returns:      0,
            }));

            return { count: data.length, data };
        }

        // No category filter — use DailySummary as before
        const records = await this.prisma.dailySummary.findMany({
            where: {
                summaryDate: { gte: dateFrom, lte: dateTo },
                ...this.buildSummaryBranchFilter(dto.branchId),
            } as any,
            select: {
                summaryDate:       true,
                totalSales:        true,
                totalTransactions: true,
                netProfit:         true,
                totalReturns:      true,
            },
            orderBy: { summaryDate: 'asc' },
        });

        const data = records.map(r => ({
            date:         r.summaryDate.toISOString().slice(0, 10),
            amount:       parseFloat(Number(r.totalSales).toFixed(2)),
            transactions: Number(r.totalTransactions),
            netProfit:    parseFloat(Number(r.netProfit).toFixed(2)),
            returns:      parseFloat(Number(r.totalReturns).toFixed(2)),
        }));

        return { count: data.length, data };
    }

    // ─── Payment Method Pie Chart ───────────────────────────────────────────────
    // FIX: Filter payments by branchId via the sale relation properly.
    //      When no payments exist, return empty data array (not a fake 100% entry).
    // ─── Payment Method Pie Chart ───────────────────────────────────────────────
// FIX: Filter payments by branchId via the sale relation properly.
//      When no payments exist, return empty data array (not a fake 100% entry).
    async getPaymentMethodBreakdown(dto: QuerySalesReportDto & { branchId?: number }) {
        const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : new Date('2026-01-01');
        const dateTo   = dto.dateTo   ? new Date(dto.dateTo)   : new Date();
        dateTo.setHours(23, 59, 59, 999);

        // Build sale conditions for branch + category filtering
        const saleConditions: Record<string, unknown> = {};

        if (dto.branchId != null) {
            saleConditions['branchId'] = Number(dto.branchId);
        }

        if (dto.category && dto.product) {
            saleConditions['sale_items'] = {
                some: {
                    product_name: { contains: dto.product, mode: 'insensitive' },
                    product: {
                        category: { name: { contains: dto.category, mode: 'insensitive' } },
                    },
                },
            };
        } else if (dto.category) {
            saleConditions['sale_items'] = {
                some: {
                    product: {
                        category: { name: { contains: dto.category, mode: 'insensitive' } },
                    },
                },
            };
        } else if (dto.product) {
            saleConditions['sale_items'] = {
                some: { product_name: { contains: dto.product, mode: 'insensitive' } },
            };
        }

        const paymentWhere: Record<string, unknown> = {
            payment_date:   { gte: dateFrom, lte: dateTo },
            payment_status: 'Paid',
        };

        if (Object.keys(saleConditions).length > 0) {
            paymentWhere['sale'] = saleConditions;
        }

        const payments = await this.prisma.ryzera_pos_payment.findMany({
            where: paymentWhere as any,
            select: {
                payment_method: true,
                amount_paid:    true,
            },
        });

        if (payments.length === 0) {
            return { totalTransactions: 0, data: [] };
        }

        const grouped: Record<string, PaymentGroup> = {};
        for (const p of payments) {
            const method = p.payment_method;
            if (!grouped[method]) {
                grouped[method] = { count: 0, totalAmount: 0 };
            }
            grouped[method].count       += 1;
            grouped[method].totalAmount += Number(p.amount_paid);
        }

        const totalCount = payments.length;

        const data = Object.entries(grouped).map(([method, values]) => ({
            paymentMethod: method,
            count:         values.count,
            totalAmount:   parseFloat(values.totalAmount.toFixed(2)),
            percentage:    totalCount > 0
                ? parseFloat(((values.count / totalCount) * 100).toFixed(2))
                : 0,
        }));

        data.sort((a, b) => b.count - a.count);

        return { totalTransactions: totalCount, data };
    }

    // ─── Transactions Table (Paginated) ────────────────────────────────────────
    async getSalesTransactions(dto: QuerySalesReportDto & { branchId?: number }) {
        const page  = Number(dto.page)  || 1;
        const limit = Number(dto.limit) || 10;
        const skip  = (page - 1) * limit;

        // ✅ Use the shared where-clause builder
        const where = this.buildSaleWhereClause(dto);

        const [totalCount, sales] = await Promise.all([
            this.prisma.ryzera_pos_sale.count({ where: where as any }),
            this.prisma.ryzera_pos_sale.findMany({
                where:   where as any,
                skip,
                take:    limit,
                orderBy: { sale_date: 'desc' },
                include: {
                    payments: {
                        select: {
                            payment_method: true,
                            amount_paid:    true,
                            payment_status: true,
                        },
                    },
                },
            }),
        ]);

        const data = sales.map(sale => ({
            invoiceNumber:  sale.invoice_number,
            saleDate:       sale.sale_date.toISOString().slice(0, 10),
            paymentMethod:  sale.payments[0]?.payment_method ?? 'N/A',
            subtotal:       parseFloat(Number(sale.subtotal).toFixed(2)),
            discountAmount: parseFloat(Number(sale.discount_amount).toFixed(2)),
            taxAmount:      parseFloat(Number(sale.tax_amount).toFixed(2)),
            totalAmount:    parseFloat(Number(sale.total_amount).toFixed(2)),
            saleStatus:     sale.sale_status,
            paymentStatus:  sale.payment_status,
        }));

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data,
            pagination: {
                currentPage:  page,
                totalPages,
                totalRecords: totalCount,
                limit,
                hasNextPage:  page < totalPages,
                hasPrevPage:  page > 1,
            },
        };
    }

    // ─── Per-Branch Report ──────────────────────────────────────────────────────
    async getReportByBranch(dto: QuerySalesReportDto) {
        const branches = await this.prisma.branch.findMany({
            where:  { is_active: true },
            select: { branchId: true, name: true, city: true },
        });

        const results = await Promise.all(
            branches.map(async (branch) => {
                const cards = await this.getSummaryCards({
                    ...dto,
                    branchId: branch.branchId,
                });
                return {
                    branch: {
                        id:   branch.branchId,
                        name: branch.name,
                        city: branch.city,
                    },
                    kpi: cards,
                };
            }),
        );

        return { branches: results };
    }

    // ─── Branch List for Sales Report Filter ────────────────────────────────────
    async getBranchList() {
        const branches = await this.prisma.branch.findMany({
            where:   { is_active: true },
            select:  { branchId: true, name: true, city: true },
            orderBy: { name: 'asc' },
        });
        return branches;
    }
    // ─── DailySummary CRUD ──────────────────────────────────────────────────────

    async createDailySummary(dto: CreateSummaryDto) {
        const existing = await this.prisma.dailySummary.findFirst({
            where: { summaryDate: new Date(dto.summaryDate) },
        });

        if (existing) {
            throw new ConflictException(
                `A summary for date ${dto.summaryDate} already exists.`,
            );
        }

        const record = await this.prisma.dailySummary.create({
            data: {
                summaryDate:       new Date(dto.summaryDate),
                totalSales:        dto.totalSales        ?? 0,
                totalTransactions: dto.totalTransactions ?? 0,
                totalItemsSold:    dto.totalItemsSold    ?? 0,
                totalDiscounts:    dto.totalDiscounts    ?? 0,
                totalTax:          dto.totalTax          ?? 0,
                grossProfit:       dto.grossProfit       ?? 0,
                totalReturns:      dto.totalReturns      ?? 0,
                totalCost:         dto.totalCost         ?? 0,
                totalCustomers:    dto.totalCustomers    ?? 0,
                netProfit:         dto.netProfit         ?? 0,
                branchId:          dto.branchId ?? null,
            },
        });

        return { message: 'Daily summary created successfully.', data: this.formatSummaryRecord(record as any) };
    }

    async getOneSummary(id: string) {
        const record = await this.prisma.dailySummary.findUnique({ where: { id } });
        if (!record) throw new NotFoundException(`Summary ${id} not found`);
        return this.formatSummaryRecord(record as any);
    }

    async getSummaryList(dto: QuerySalesReportDto & { branchId?: number }) {
        const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : new Date('2026-01-01');
        const dateTo   = dto.dateTo   ? new Date(dto.dateTo)   : new Date();
        const page     = dto.page  ?? 1;
        const limit    = dto.limit ?? 10;
        const skip     = (page - 1) * limit;

        const where = {
            summaryDate: { gte: dateFrom, lte: dateTo },
            ...this.buildSummaryBranchFilter(dto.branchId),
        };

        const [totalCount, records] = await Promise.all([
            this.prisma.dailySummary.count({ where: where as any }),
            this.prisma.dailySummary.findMany({
                where:   where as any,
                orderBy: { summaryDate: 'desc' },
                skip,
                take:    limit,
            }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: records.map(r => this.formatSummaryRecord(r as any)),
            pagination: {
                currentPage:  page,
                totalPages,
                totalRecords: totalCount,
                limit,
                hasNextPage:  page < totalPages,
                hasPrevPage:  page > 1,
            },
        };
    }

    async updateSummary(id: string, dto: CreateSummaryDto) {
        const existing = await this.prisma.dailySummary.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Summary ${id} not found`);

        const updated = await this.prisma.dailySummary.update({
            where: { id },
            data: {
                totalSales:        dto.totalSales        ?? Number(existing.totalSales),
                totalTransactions: dto.totalTransactions ?? Number(existing.totalTransactions),
                totalItemsSold:    dto.totalItemsSold    ?? Number(existing.totalItemsSold),
                totalDiscounts:    dto.totalDiscounts    ?? Number(existing.totalDiscounts),
                totalTax:          dto.totalTax          ?? Number(existing.totalTax),
                grossProfit:       dto.grossProfit       ?? Number(existing.grossProfit),
                totalReturns:      dto.totalReturns      ?? Number(existing.totalReturns),
                totalCost:         dto.totalCost         ?? Number(existing.totalCost),
                totalCustomers:    dto.totalCustomers    ?? Number(existing.totalCustomers),
                netProfit:         dto.netProfit         ?? Number(existing.netProfit),
            },
        });

        return { message: 'Summary updated.', data: this.formatSummaryRecord(updated as any) };
    }

    async deleteSummary(id: string) {
        const existing = await this.prisma.dailySummary.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Summary ${id} not found`);
        await this.prisma.dailySummary.delete({ where: { id } });
        return { message: 'Summary deleted.' };
    }

    // ─── Export CSV ─────────────────────────────────────────────────────────────
    async exportToCsv(
        dto: QuerySalesReportDto & { branchId?: number },
        user: JwtPayload,
    ): Promise<string> {
        const where = this.buildSaleWhereClause(dto);

        const sales = await this.prisma.ryzera_pos_sale.findMany({
            where:   where as any,
            orderBy: { sale_date: 'desc' },
            include: {
                payments: {
                    select: { payment_method: true },
                },
            },
        });

        const header = [
            'Invoice Number',
            'Sale Date',
            'Payment Method',
            'Subtotal',
            'Discount',
            'Tax',
            'Total Amount',
            'Sale Status',
            'Payment Status',
        ].join(',');

        const rows = sales.map(s => [
            s.invoice_number,
            s.sale_date.toISOString().slice(0, 10),
            s.payments[0]?.payment_method ?? 'N/A',
            Number(s.subtotal).toFixed(2),
            Number(s.discount_amount).toFixed(2),
            Number(s.tax_amount).toFixed(2),
            Number(s.total_amount).toFixed(2),
            s.sale_status,
            s.payment_status,
        ].join(','));

        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported CSV',
            reportType:  'Sales Report',
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',
        });

        return [header, ...rows].join('\n');
    }

    // ─── Export PDF ─────────────────────────────────────────────────────────────
    async exportToPdf(
        dto: QuerySalesReportDto & { branchId?: number },
        user: JwtPayload,
    ): Promise<Buffer> {
        const where = this.buildSaleWhereClause(dto);

        const sales = await this.prisma.ryzera_pos_sale.findMany({
            where:   where as any,
            orderBy: { sale_date: 'desc' },
            include: {
                payments: {
                    select: { payment_method: true },
                },
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const PDFDocument = require('pdfkit');
        const doc         = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));

        const pageWidth  = 841.89;
        const margin     = 40;
        const tableWidth = pageWidth - margin * 2;
        const rowHeight  = 22;
        const headerH    = 26;

        const correctedCols = [
            { label: 'Invoice No.',    key: 'invoice',    width: 110 },
            { label: 'Sale Date',      key: 'date',       width:  85 },
            { label: 'Payment Method', key: 'method',     width: 100 },
            { label: 'Subtotal (Rs)',  key: 'subtotal',   width:  80 },
            { label: 'Discount (Rs)',  key: 'discount',   width:  80 },
            { label: 'Tax (Rs)',       key: 'tax',        width:  68 },
            { label: 'Total (Rs)',     key: 'total',      width:  80 },
            { label: 'Sale Status',    key: 'saleStatus', width:  78 },
            { label: 'Payment Status', key: 'payStatus',  width:  80 },
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

            correctedCols.forEach(col => {
                const cellH     = isHeader ? headerH : rowHeight;
                const value     = isHeader ? col.label : String(rowData[col.key] ?? '');
                let   textColor = isHeader ? '#FFFFFF' : '#1A1A1A';

                if (!isHeader && col.key === 'status') {
                    if (value === 'Completed') textColor = '#27AE60';
                    if (value === 'Pending')   textColor = '#E67E22';
                    if (value === 'Cancelled') textColor = '#E74C3C';
                }

                doc.rect(x, y, col.width, cellH).strokeColor('#CCCCCC').lineWidth(0.5).stroke();
                doc.fillColor(textColor)
                    .fontSize(isHeader ? 8.5 : 8)
                    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                    .text(value, x + 5, y + (cellH - (isHeader ? 9 : 8)) / 2 + 1, {
                        width: col.width - 10, ellipsis: true, lineBreak: false,
                    });
                x += col.width;
            });
        };

        const completedSales = sales.filter(s => s.sale_status === 'Completed');
        const totalRevenue   = completedSales.reduce((s, r) => s + Number(r.total_amount),    0);
        const totalDiscount  = completedSales.reduce((s, r) => s + Number(r.discount_amount), 0);
        const totalTax       = completedSales.reduce((s, r) => s + Number(r.tax_amount),      0);

        // ── Header banner ──────────────────────────────────────────────────────
        doc.rect(0, 0, pageWidth, 70).fill('#2C3E50');
        doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
            .text('Sales Report', margin, 16, { align: 'center', width: tableWidth });

        const filterLabel = [
            dto.dateFrom && dto.dateTo ? `${dto.dateFrom} – ${dto.dateTo}` : null,
            dto.category ? `Category: ${dto.category}` : null,
            dto.product  ? `Product: ${dto.product}`   : null,
        ].filter(Boolean).join('   |   ');

        doc.fontSize(9).font('Helvetica').fillColor('#BDC3C7')
            .text(filterLabel || 'All Records', margin, 44, { align: 'center', width: tableWidth });

        // ── KPI strip ─────────────────────────────────────────────────────────
        doc.rect(0, 70, pageWidth, 36).fill('#1A252F');
        const kpis = [
            { label: 'Total Sales',    value: String(sales.length) },
            { label: 'Completed',      value: String(completedSales.length) },
            { label: 'Total Revenue',  value: `Rs ${totalRevenue.toFixed(2)}` },
            { label: 'Total Discount', value: `Rs ${totalDiscount.toFixed(2)}` },
            { label: 'Total Tax',      value: `Rs ${totalTax.toFixed(2)}` },
        ];
        const kpiW = tableWidth / kpis.length;
        kpis.forEach((kpi, i) => {
            const kx = margin + i * kpiW;
            doc.fillColor('#BDC3C7').fontSize(7).font('Helvetica')
                .text(kpi.label, kx, 76, { width: kpiW, align: 'center' });
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
                .text(kpi.value, kx, 87, { width: kpiW, align: 'center' });
        });

        // ── Table ─────────────────────────────────────────────────────────────
        let y = 118;
        drawRow(y, {} as any, true);
        y += headerH;

        sales.forEach((sale, i) => {
            if (y + rowHeight > (doc.page.height as number) - margin) {
                doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
                y = margin;
                drawRow(y, {} as any, true);
                y += headerH;
            }
            drawRow(
                y,
                {
                    invoice:    sale.invoice_number,
                    date:       sale.sale_date.toISOString().slice(0, 10),
                    method:     sale.payments[0]?.payment_method ?? 'N/A',
                    subtotal:   Number(sale.subtotal).toFixed(2),
                    discount:   Number(sale.discount_amount).toFixed(2),
                    tax:        Number(sale.tax_amount).toFixed(2),
                    total:      Number(sale.total_amount).toFixed(2),
                    saleStatus: sale.sale_status,
                    payStatus:  sale.payment_status,
                },
                false,
                i % 2 === 0,
            );
            y += rowHeight;
        });

        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported PDF',
            reportType:  'Sales Report',
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',
        });

        // ── Footer ────────────────────────────────────────────────────────────
        const footerY = (doc.page.height as number) - 28;
        doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY)
            .strokeColor('#CCCCCC').lineWidth(0.5).stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
            .text(
                `Generated: ${new Date().toDateString()}   |   Ryzera POS`,
                margin, footerY + 6, { align: 'center', width: tableWidth },
            );

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end',   () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err: Error) => reject(new InternalServerErrorException(err.message)));
        });
    }
}