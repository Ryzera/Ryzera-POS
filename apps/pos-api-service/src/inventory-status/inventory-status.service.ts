import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';  // ← added BadRequestException
import { PrismaService } from '@ryzera/pos-database';
import type { QueryInventoryStatusDto } from './schemas/query-inventory-status.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

export interface ClassifiedProduct {
    product_name:   string;
    category:       { name: string } | null;
    supplier:       { name: string } | null;
    current_stock:  number;
    reorder_level:  number;
    cost_price:     number;
    selling_price:  number;
    computedStatus: 'InStock' | 'LowStock' | 'OutOfStock';
    branchName?:    string;
}

export interface InventoryDetailRow {
    productName:   string;
    category:      string;
    supplier:      string;
    currentStock:  number;
    reorderLevel:  number;
    currentStatus: string;
    costValue:     number;
    sellingValue:  number;
    branch?:       string;
}

@Injectable()
export class InventoryStatusService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLogService: AuditLogService,
        ) {}

    // ─── Maps auth branchId (integer) → inventory branchId (UUID) ────────────
    private readonly branchIdMap: Record<number, string> = {
        1: 'invb-0001-0000-0000-000000000001',  // Colombo
        2: 'invb-0002-0000-0000-000000000002',  // Kandy
        3: 'invb-0003-0000-0000-000000000003',  // Galle
    };

    private resolveInventoryBranchId(authBranchId: number): string {
        const uuid = this.branchIdMap[authBranchId];
        if (!uuid) throw new BadRequestException(`Unknown branchId: ${authBranchId}`);
        return uuid;
    }

    private resolveStatus(
        currentStock: number,
        reorderLevel: number,
    ): 'InStock' | 'LowStock' | 'OutOfStock' {
        if (currentStock <= 0)            return 'OutOfStock';
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

    private buildBranchProductWhere(options: {
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

    private async classifyByBranch(
        branchId: string,   // ← UUID string
        category?: string,
    ): Promise<ClassifiedProduct[]> {
        const rows = await this.prisma.branchProduct.findMany({
            where:   this.buildBranchProductWhere({ branchId, category }),
            include: this.productInclude,
            orderBy: { product: { name: 'asc' } },
        });

        return rows.map(bp => ({
            product_name:   bp.product.name,
            category:       bp.product.category,
            supplier:       bp.product.supplier,
            current_stock:  bp.stockQty,
            reorder_level:  bp.product.minStock,
            cost_price:     Number(bp.product.costPrice ?? 0),
            selling_price:  Number(bp.product.price),
            computedStatus: this.resolveStatus(bp.stockQty, bp.product.minStock),
        }));
    }

    private async classifyAllBranches(
        category?: string,
    ): Promise<ClassifiedProduct[]> {
        const rows = await this.prisma.branchProduct.findMany({
            where:   this.buildBranchProductWhere({ category }),
            include: this.productInclude,
            orderBy: { product: { name: 'asc' } },
        });

        const productMap: Record<string, ClassifiedProduct> = {};
        for (const bp of rows) {
            const pid = bp.productId;
            if (!productMap[pid]) {
                productMap[pid] = {
                    product_name:   bp.product.name,
                    category:       bp.product.category,
                    supplier:       bp.product.supplier,
                    current_stock:  0,
                    reorder_level:  bp.product.minStock,
                    cost_price:     Number(bp.product.costPrice ?? 0),
                    selling_price:  Number(bp.product.price),
                    computedStatus: 'InStock',
                };
            }
            productMap[pid].current_stock += bp.stockQty;
        }

        return Object.values(productMap).map(p => ({
            ...p,
            computedStatus: this.resolveStatus(p.current_stock, p.reorder_level),
        }));
    }

    private buildKpi(classified: ClassifiedProduct[]) {
        const totalProducts       = classified.length;
        const inStock             = classified.filter(p => p.computedStatus === 'InStock').length;
        const lowStock            = classified.filter(p => p.computedStatus === 'LowStock').length;
        const outOfStock          = classified.filter(p => p.computedStatus === 'OutOfStock').length;
        const totalInventoryValue = parseFloat(
            classified
                .reduce((sum, p) => sum + p.cost_price * p.current_stock, 0)
                .toFixed(2),
        );
        return { totalProducts, inStock, lowStock, outOfStock, totalInventoryValue };
    }

    private toDetailRow(p: ClassifiedProduct): InventoryDetailRow {
        return {
            productName:   p.product_name,
            category:      p.category?.name ?? 'Unknown',
            supplier:      p.supplier?.name ?? 'Unknown',
            currentStock:  p.current_stock,
            reorderLevel:  p.reorder_level,
            currentStatus: p.computedStatus,
            costValue:     parseFloat((p.cost_price    * p.current_stock).toFixed(2)),
            sellingValue:  parseFloat((p.selling_price * p.current_stock).toFixed(2)),
            ...(p.branchName ? { branch: p.branchName } : {}),
        };
    }

    private buildFilterSummary(dto: { dateFrom?: string; dateTo?: string; category?: string; branchId?: number }): string {
        const parts: string[] = [];
        if (dto.dateFrom && dto.dateTo) parts.push(`${dto.dateFrom} – ${dto.dateTo}`);
        if (dto.category)               parts.push(dto.category);
        return parts.join(', ') || 'All';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC METHODS
    // ─────────────────────────────────────────────────────────────────────────

    async getInventoryStatus(dto: QueryInventoryStatusDto) {
        if (!dto.category || !dto.stockStatus) {
            return {
                message: 'Please select both category and stock status to generate the report.',
                kpi:              null,
                inventoryDetails: [],
            };
        }

        const classified = dto.branchId
            ? await this.classifyByBranch(
                this.resolveInventoryBranchId(dto.branchId),  // ← FIX: map int → UUID
                dto.category,
            )
            : await this.classifyAllBranches(dto.category);

        const kpi = this.buildKpi(classified);

        const inventoryDetails = classified
            .filter(p => p.computedStatus === dto.stockStatus)
            .map(p => this.toDetailRow(p));

        return { kpi, inventoryDetails };
    }

    async getInventoryByBranch(dto: QueryInventoryStatusDto) {
        if (!dto.category || !dto.stockStatus) {
            return {
                message: 'Please select both category and stock status to generate the report.',
                branches: [],
            };
        }

        const activeBranches = await this.prisma.branch.findMany({
            where:   {
                is_active: true,
            },
            orderBy: { name: 'asc' },
        });

        const branches = await Promise.all(
            activeBranches.map(async branch => {
                const classified = await this.classifyByBranch(
                    this.resolveInventoryBranchId(branch.branchId),  // ← FIX: map branchId int → UUID
                    dto.category,
                );

                const kpi = this.buildKpi(classified);

                const inventoryDetails = classified
                    .filter(p => p.computedStatus === dto.stockStatus)
                    .map(p => this.toDetailRow(p));

                return {
                    branch: {
                        id:   branch.branchId,    // ← FIX: branch.id not branch.branchId
                        name: branch.name,
                    },
                    kpi,
                    inventoryDetails,
                };
            }),
        );

        return { branches };
    }

    private async getFilteredDetails(dto: QueryInventoryStatusDto): Promise<{
        kpi: ReturnType<typeof this.buildKpi> | null;
        inventoryDetails: InventoryDetailRow[];
    }> {
        if (!dto.category || !dto.stockStatus) {
            return { kpi: null, inventoryDetails: [] };
        }

        const classified = dto.branchId
            ? await this.classifyByBranch(
                this.resolveInventoryBranchId(dto.branchId),  // ← FIX: map int → UUID
                dto.category,
            )
            : await this.classifyAllBranches(dto.category);

        const kpi = this.buildKpi(classified);

        const inventoryDetails = classified
            .filter(p => p.computedStatus === dto.stockStatus)
            .map(p => this.toDetailRow(p));

        return { kpi, inventoryDetails };
    }

    // ─── exportCsv and exportPdf are unchanged — no edits needed ─────────────
    async exportCsv(dto: QueryInventoryStatusDto,user: JwtPayload): Promise<Buffer> {
        const { inventoryDetails } = await this.getFilteredDetails(dto);

        const headers = [
            'Product Name', 'Category', 'Supplier',
            'Current Stock', 'Reorder Level', 'Current Status',
            'Cost Value', 'Selling Value',
        ];

        const rows = inventoryDetails.map(row => [
            row.productName,
            row.category,
            row.supplier,
            row.currentStock,
            row.reorderLevel,
            row.currentStatus,
            row.costValue,
            row.sellingValue,
        ]);

        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported CSV',
            reportType:  'Inventory Status Report',   // ← change this label per report
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',        });

        const csv = [headers, ...rows]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n');

        return Buffer.from(csv, 'utf-8');
    }

    async exportPdf(dto: QueryInventoryStatusDto,user: JwtPayload): Promise<Buffer> {
        const { kpi, inventoryDetails } = await this.getFilteredDetails(dto);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const PDFDocument = require('pdfkit');

        if (!kpi || inventoryDetails.length === 0) {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.text('No data available. Please select both category and stock status.');
            doc.end();
            return new Promise(resolve => {
                doc.on('end', () => resolve(Buffer.concat(buffers)));
            });
        }

        const PAGE_WIDTH  = 841.89;
        const MARGIN      = 40;
        const TABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
        const ROW_HEIGHT  = 22;
        const HEADER_H    = 26;

        const COLS = [
            { label: 'Product Name',  key: 'productName',   width: 160 },
            { label: 'Category',      key: 'category',      width: 100 },
            { label: 'Supplier',      key: 'supplier',      width: 120 },
            { label: 'Current Stock', key: 'currentStock',  width: 80  },
            { label: 'Reorder Level', key: 'reorderLevel',  width: 80  },
            { label: 'Status',        key: 'currentStatus', width: 80  },
            { label: 'Cost Value',    key: 'costValue',     width: 90  },
            { label: 'Selling Value', key: 'sellingValue',  width: 91  },
        ] as const;

        const STATUS_COLORS: Record<string, string> = {
            InStock:    '#27AE60',
            LowStock:   '#E67E22',
            OutOfStock: '#E74C3C',
        };

        const doc     = new PDFDocument({ margin: MARGIN, size: 'A4', layout: 'landscape' });
        const buffers: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));

        const drawRow = (
            y: number,
            rowData: Record<string, unknown>,
            isHeader = false,
            shaded   = false,
        ) => {
            let x = MARGIN;
            if (isHeader) {
                doc.rect(MARGIN, y, TABLE_WIDTH, HEADER_H).fill('#2C3E50');
            } else if (shaded) {
                doc.rect(MARGIN, y, TABLE_WIDTH, ROW_HEIGHT).fill('#F2F4F6');
            }
            for (const col of COLS) {
                const cellH  = isHeader ? HEADER_H : ROW_HEIGHT;
                const value  = isHeader ? col.label : String(rowData[col.key] ?? '');
                const isStatusCell = !isHeader && col.key === 'currentStatus';
                const textColor = isHeader
                    ? '#FFFFFF'
                    : isStatusCell
                        ? (STATUS_COLORS[value] ?? '#1A1A1A')
                        : '#1A1A1A';
                doc.rect(x, y, col.width, cellH).strokeColor('#CCCCCC').lineWidth(0.5).stroke();
                doc.fillColor(textColor).fontSize(isHeader ? 8.5 : 8)
                    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                    .text(value, x + 5, y + (cellH - (isHeader ? 9 : 8)) / 2 + 1, {
                        width: col.width - 10, ellipsis: true, lineBreak: false,
                    });
                x += col.width;
            }
        };

        doc.rect(0, 0, PAGE_WIDTH, 70).fill('#2C3E50');
        doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold')
            .text('Inventory Status Report', MARGIN, 16, { align: 'center', width: TABLE_WIDTH });

        const subtitleParts = [
            `Generated: ${new Date().toDateString()}`,
            dto.category    ? `Category: ${dto.category}`   : null,
            dto.stockStatus ? `Status: ${dto.stockStatus}`  : null,
        ].filter(Boolean).join('   |   ');

        doc.fontSize(9).font('Helvetica').fillColor('#BDC3C7')
            .text(subtitleParts, MARGIN, 44, { align: 'center', width: TABLE_WIDTH });

        doc.rect(0, 70, PAGE_WIDTH, 36).fill('#1A252F');
        const kpiItems = [
            { label: 'Total Products',        value: String(kpi.totalProducts) },
            { label: 'In Stock',              value: String(kpi.inStock) },
            { label: 'Low Stock',             value: String(kpi.lowStock) },
            { label: 'Out of Stock',          value: String(kpi.outOfStock) },
            { label: 'Total Inventory Value', value: `Rs ${kpi.totalInventoryValue.toFixed(2)}` },
        ];
        const kpiW = TABLE_WIDTH / kpiItems.length;
        kpiItems.forEach((k, i) => {
            const kx = MARGIN + i * kpiW;
            doc.fillColor('#BDC3C7').fontSize(7).font('Helvetica')
                .text(k.label, kx, 76, { width: kpiW, align: 'center' });
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
                .text(k.value, kx, 87, { width: kpiW, align: 'center' });
        });

        let y = 118;
        drawRow(y, {}, true);
        y += HEADER_H;

        for (const [i, row] of inventoryDetails.entries()) {
            if (y + ROW_HEIGHT > doc.page.height - MARGIN) {
                doc.addPage({ size: 'A4', layout: 'landscape', margin: MARGIN });
                y = MARGIN;
                drawRow(y, {}, true);
                y += HEADER_H;
            }
            drawRow(y, {
                productName:   row.productName,
                category:      row.category,
                supplier:      row.supplier,
                currentStock:  String(row.currentStock),
                reorderLevel:  String(row.reorderLevel),
                currentStatus: row.currentStatus,
                costValue:     row.costValue.toFixed(2),
                sellingValue:  row.sellingValue.toFixed(2),
            }, false, i % 2 === 0);
            y += ROW_HEIGHT;
        }

        void this.auditLogService.record({
            userId:      user.userId,
            username:    user.username,
            role:        user.role,
            action:      'Exported PDF',
            reportType:  'Inventory Status Report',   // ← change this label per report
            filtersUsed: this.buildFilterSummary(dto),
            branchName:  dto.branchId ? `Branch ${dto.branchId}` : 'All',        });

        const footerY = doc.page.height - 28;
        doc.moveTo(MARGIN, footerY).lineTo(PAGE_WIDTH - MARGIN, footerY)
            .strokeColor('#CCCCCC').lineWidth(0.5).stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
            .text(`Generated: ${new Date().toDateString()}   |   Ryzera POS`,
                MARGIN, footerY + 6, { align: 'center', width: TABLE_WIDTH });

        doc.end();
        return new Promise((resolve, reject) => {
            doc.on('end',   () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err: Error) => reject(new InternalServerErrorException(err.message)));
        });
    }
}