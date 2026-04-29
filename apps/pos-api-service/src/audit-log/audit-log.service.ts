import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import type { RecordAuditDto, QueryAuditLogDto, ExportAuditLogDto } from './schemas/audit-log.schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

// ─── Layout constants — never hard-coded inline ───────────────────────────────
const PDF_MARGIN      = 40;
const PDF_PAGE_WIDTH  = 842; // A4 landscape points
const PDF_HEADER_H    = 26;
const PDF_ROW_H       = 20;

// ─── Column definitions — single source of truth for CSV and PDF ──────────────
const AUDIT_COLUMNS = [
    { label: 'User',         key: 'username',    width: 100 },
    { label: 'Role',         key: 'role',        width:  90 },
    { label: 'Action',       key: 'action',      width:  90 },
    { label: 'Report Type',  key: 'reportType',  width: 110 },
    { label: 'Filters Used', key: 'filtersUsed', width: 140 },
    { label: 'Branch',       key: 'branchName',  width:  90 },
    { label: 'Date',         key: 'date',        width:  85 },
    { label: 'Time',         key: 'time',        width:  57 },
] as const;

// Maximum rows fetched for export — prevents memory exhaustion
const EXPORT_ROW_LIMIT = 10_000;

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ─── Record (called by other services) ───────────────────────────────────

    /**
     * Writes one immutable audit row.
     * Called internally — never exposed as a REST endpoint.
     * Fire-and-forget: errors are only logged, never thrown,
     * so a failed audit write never blocks the actual report response.
     */
    async record(dto: RecordAuditDto): Promise<void> {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId:      dto.userId,
                    username:    dto.username,
                    role:        dto.role,
                    action:      dto.action,
                    reportType:  dto.reportType,
                    filtersUsed: dto.filtersUsed,
                    branchName:  dto.branchName,
                },
            });
        } catch (err) {
            // Never rethrow — a failed audit write must NOT break the report request
            this.logger.error('Failed to write audit log entry', err);
        }
    }

    // ─── Query (Admin GET endpoint) ───────────────────────────────────────────

    /**
     * Returns a paginated, filtered list of audit log entries.
     * Admin-only. Newest entries first.
     */
    async getAuditLogs(dto: QueryAuditLogDto) {
        const page  = dto.page  ?? 1;
        const limit = dto.limit ?? 50;
        const skip  = (page - 1) * limit;

        const where = this.buildWhereClause(dto);

        const [totalCount, logs] = await Promise.all([
            this.prisma.auditLog.count({ where }),
            this.prisma.auditLog.findMany({
                where,
                skip,
                take:    limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id:          true,
                    username:    true,
                    role:        true,
                    action:      true,
                    reportType:  true,
                    filtersUsed: true,
                    branchName:  true,
                    createdAt:   true,
                },
            }),
        ]);

        const data = logs.map(log => ({
            ...log,
            // Format time as "09:14 AM" — matches UI column display
            time:      log.createdAt.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true,
            }),
            // Keep full ISO for client-side sorting
            createdAt: log.createdAt.toISOString(),
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

    // ─── Export CSV ───────────────────────────────────────────────────────────

    /**
     * Builds a UTF-8 CSV buffer from the filtered audit log.
     * Returned as Buffer so the controller can set Content-Length correctly.
     */
    async exportCsv(dto: ExportAuditLogDto): Promise<Buffer> {
        const logs = await this.fetchAllForExport(dto);

        const header = AUDIT_COLUMNS.map(c => c.label).join(',');

        const rows = logs.map(log => {
            const dt   = new Date(log.createdAt);
            const date = dt.toISOString().slice(0, 10);
            const time = dt.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true,
            });

            const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;

            return [
                escape(log.username),
                escape(log.role),
                escape(log.action),
                escape(log.reportType),
                escape(log.filtersUsed),
                escape(log.branchName),
                escape(date),
                escape(time),
            ].join(',');
        });

        return Buffer.from([header, ...rows].join('\n'), 'utf-8');
    }

    // ─── Export PDF ───────────────────────────────────────────────────────────

    /**
     * Builds a styled A4-landscape PDF buffer from the filtered audit log.
     * Uses pdfkit (already a project dependency — no new package needed).
     */
    async exportPdf(dto: ExportAuditLogDto): Promise<Buffer> {
        const logs      = await this.fetchAllForExport(dto);
        const doc       = new PDFDocument({ size: 'A4', layout: 'landscape', margin: PDF_MARGIN });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));

        const tableWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;

        // ── Header banner ─────────────────────────────────────────────────────
        doc.rect(0, 0, PDF_PAGE_WIDTH, 60).fill('#2C3E50');
        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
            .text('Audit Log', PDF_MARGIN, 14, { align: 'center', width: tableWidth });
        doc.fontSize(8).font('Helvetica').fillColor('#BDC3C7')
            .text(
                `Exported: ${new Date().toDateString()}   |   Ryzera POS — Admin Only`,
                PDF_MARGIN, 38, { align: 'center', width: tableWidth },
            );

        // ── Draw row helper ───────────────────────────────────────────────────
        // rowData is Record<string, unknown> — handles userId (number) and
        // other mixed types safely via String() coercion inside the loop.
        const drawRow = (
            y:       number,
            rowData: Record<string, unknown>,
            isHeader = false,
            shaded   = false,
        ) => {
            let x = PDF_MARGIN;

            if (isHeader) {
                doc.rect(PDF_MARGIN, y, tableWidth, PDF_HEADER_H).fill('#1A252F');
            } else if (shaded) {
                doc.rect(PDF_MARGIN, y, tableWidth, PDF_ROW_H).fill('#F2F4F6');
            }

            AUDIT_COLUMNS.forEach(col => {
                const cellH     = isHeader ? PDF_HEADER_H : PDF_ROW_H;
                // String() safely converts number, undefined, null → string
                const value     = isHeader ? col.label : String(rowData[col.key] ?? '');
                const textColor = isHeader ? '#FFFFFF' : '#1A1A1A';

                doc.rect(x, y, col.width, cellH).strokeColor('#CCCCCC').lineWidth(0.4).stroke();
                doc.fillColor(textColor)
                    .fontSize(isHeader ? 8 : 7.5)
                    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                    .text(value, x + 4, y + (cellH - (isHeader ? 8 : 7.5)) / 2 + 1, {
                        width: col.width - 8, ellipsis: true, lineBreak: false,
                    });
                x += col.width;
            });
        };

        // ── Table ─────────────────────────────────────────────────────────────
        let y = 75;
        drawRow(y, {}, true);
        y += PDF_HEADER_H;

        logs.forEach((log, i) => {
            // Page break guard — A4 landscape height = 595 pts
            if (y + PDF_ROW_H > 595 - PDF_MARGIN) {
                doc.addPage({ size: 'A4', layout: 'landscape', margin: PDF_MARGIN });
                y = PDF_MARGIN;
                drawRow(y, {}, true);
                y += PDF_HEADER_H;
            }

            const dt   = new Date(log.createdAt);
            const date = dt.toISOString().slice(0, 10);
            const time = dt.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true,
            });

            // Spread log (contains userId: number) — safe because drawRow
            // accepts Record<string, unknown> and uses String() on all values
            drawRow(y, { ...log, date, time }, false, i % 2 === 0);
            y += PDF_ROW_H;
        });

        // ── Footer ────────────────────────────────────────────────────────────
        const footerY = 595 - 22;
        doc.moveTo(PDF_MARGIN, footerY)
            .lineTo(PDF_PAGE_WIDTH - PDF_MARGIN, footerY)
            .strokeColor('#CCCCCC').lineWidth(0.4).stroke();
        doc.fillColor('#999999').fontSize(7).font('Helvetica')
            .text(
                `Total Records: ${logs.length}   |   Generated: ${new Date().toDateString()}   |   Ryzera POS`,
                PDF_MARGIN, footerY + 5, { align: 'center', width: tableWidth },
            );

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end',   () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err: Error) => reject(
                new InternalServerErrorException(`PDF generation failed: ${err.message}`),
            ));
        });
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Fetches ALL rows matching the export filters.
     * Hard-capped at EXPORT_ROW_LIMIT to prevent memory exhaustion.
     */
    private async fetchAllForExport(dto: ExportAuditLogDto) {
        const where = this.buildWhereClause(dto);
        return this.prisma.auditLog.findMany({
            where,
            take:    EXPORT_ROW_LIMIT,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Builds the Prisma where object shared by query and export endpoints.
     * All conditions are optional — omitting them returns all records.
     */
    private buildWhereClause(dto: Partial<QueryAuditLogDto | ExportAuditLogDto>) {
        const where: Record<string, unknown> = {};

        if ('username' in dto && dto.username) {
            where['username'] = { contains: dto.username.trim(), mode: 'insensitive' };
        }
        if ('date' in dto && dto.date) {
            // Filter the full calendar day in UTC
            where['createdAt'] = {
                gte: new Date(`${dto.date}T00:00:00.000Z`),
                lte: new Date(`${dto.date}T23:59:59.999Z`),
            };
        }
        if ('action' in dto && dto.action) {
            where['action'] = dto.action;
        }
        if ('reportType' in dto && dto.reportType) {
            where['reportType'] = { contains: dto.reportType.trim(), mode: 'insensitive' };
        }

        return where;
    }
}