import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';
import type {
  RecordAuditDto,
  QueryAuditLogDto,
  ExportAuditLogDto,
} from './schemas/audit-log.schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

// ─── Layout constants — never hard-coded inline ───────────────────────────────
const PDF_MARGIN = 40;
const PDF_PAGE_WIDTH = 842; // A4 landscape points
const PDF_HEADER_H = 26;
const PDF_ROW_H = 20;

// ─── Column definitions — single source of truth for CSV and PDF ──────────────
const AUDIT_COLUMNS = [
  { label: 'User', key: 'username', width: 100 },
  { label: 'Role', key: 'role', width: 90 },
  { label: 'Action', key: 'action', width: 90 },
  { label: 'Report Type', key: 'reportType', width: 110 },
  { label: 'Filters Used', key: 'filtersUsed', width: 140 },
  { label: 'Branch', key: 'branchName', width: 90 },
  { label: 'Date', key: 'date', width: 85 },
  { label: 'Time', key: 'time', width: 57 },
] as const;

// Maximum rows fetched for export — prevents memory exhaustion
const EXPORT_ROW_LIMIT = 10_000;

// Sentinel values in branchName that mean "not scoped to one branch"
const NON_BRANCH_NAMES = new Set(['All', 'All Branches', '']);

@Injectable()
export class ReportsAuditLogService {
  private readonly logger = new Logger(ReportsAuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Record (called by other services) ───────────────────────────────────


  async record(dto: RecordAuditDto): Promise<void> {
    try {
      let username = dto.username;
      if (!username || username === 'admin') {
        const userRec = await this.prisma.user.findUnique({
          where: { id: dto.userId },
          select: { username: true },
        });
        if (userRec?.username) {
          username = userRec.username;
        }
      }

      const branchId = await this.resolveBranchId(dto);

      await this.prisma.auditLog.create({
        data: {
          user_id: dto.userId,
          username: username || 'Unknown',
          role: dto.role,
          action: dto.action,
          reportType: dto.reportType,
          filtersUsed: dto.filtersUsed,
          branchName: dto.branchName,
          branch_id: branchId,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write audit log entry', err);
    }
  }

  private async resolveBranchId(dto: RecordAuditDto): Promise<number | null> {
    if (dto.branchId) return dto.branchId;
    if (!dto.branchName || NON_BRANCH_NAMES.has(dto.branchName)) return null;

    const branch = await this.prisma.branch.findFirst({
      where: { name: dto.branchName },
      select: { id: true },
    });
    return branch?.id ?? null;
  }

  /**
   * The `branchName` column stores whatever string the calling report
   * service passed at write time — for most report services that was a
   * placeholder like "Branch 3", not a real branch name. Rather than fixing
   * every call site (fragile, easy to miss one), reads resolve the display
   * name live via the `branch_id` foreign key, which is always accurate.
   * Falls back to the stored branchName only for "All Branches" rows
   * (branch_id is null there by design, e.g. an ADMIN export).
   */
  private resolveDisplayBranchName(log: {
    branchName: string | null;
    branch: { name: string } | null;
  }): string {
    return log.branch?.name ?? log.branchName ?? 'All';
  }

  // ─── Query (ADMIN / MANAGER GET endpoint) ─────────────────────────────────

  /**
   * Returns a paginated, filtered list of audit log entries.
   * ADMIN sees every branch; MANAGER is pre-locked to their own branch
   * by the controller before this is ever called. Newest entries first.
   */
  async getAuditLogs(dto: QueryAuditLogDto & { branchId?: number }) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 50;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(dto);

    const [totalCount, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          role: true,
          action: true,
          reportType: true,
          filtersUsed: true,
          branchName: true,
          branch_id: true,
          created_at: true,
          branch: { select: { name: true } },
        },
      }),
    ]);

    const data = logs.map((log) => ({
      ...log,
      branchName: this.resolveDisplayBranchName(log),
      time: log.created_at.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      createdAt: log.created_at.toISOString(),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ─── Export CSV ───────────────────────────────────────────────────────────

  async exportCsv(
      dto: ExportAuditLogDto & { branchId?: number },
  ): Promise<Buffer> {
    const logs = await this.fetchAllForExport(dto);

    const header = AUDIT_COLUMNS.map((c) => c.label).join(',');

    const rows = logs.map((log) => {
      const dt = new Date(log.created_at);
      const date = dt.toISOString().slice(0, 10);
      const time = dt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const escape = (val: string | null | undefined) =>
          `"${String(val ?? '').replace(/"/g, '""')}"`;

      return [
        escape(log.username),
        escape(log.role),
        escape(log.action),
        escape(log.reportType),
        escape(log.filtersUsed),
        escape(this.resolveDisplayBranchName(log)),
        escape(date),
        escape(time),
      ].join(',');
    });

    return Buffer.from([header, ...rows].join('\n'), 'utf-8');
  }

  // ─── Export PDF ───────────────────────────────────────────────────────────

  async exportPdf(
      dto: ExportAuditLogDto & { branchId?: number },
  ): Promise<Buffer> {
    const logs = await this.fetchAllForExport(dto);
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: PDF_MARGIN,
    });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const tableWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;

    doc.rect(0, 0, PDF_PAGE_WIDTH, 60).fill('#2C3E50');
    doc
        .fillColor('#FFFFFF')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('Audit Log', PDF_MARGIN, 14, {
          align: 'center',
          width: tableWidth,
        });
    doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#BDC3C7')
        .text(
            `Exported: ${new Date().toDateString()}   |   Ryzera POS`,
            PDF_MARGIN,
            38,
            { align: 'center', width: tableWidth },
        );

    const drawRow = (
        y: number,
        rowData: Record<string, unknown>,
        isHeader = false,
        shaded = false,
    ) => {
      let x = PDF_MARGIN;

      if (isHeader) {
        doc.rect(PDF_MARGIN, y, tableWidth, PDF_HEADER_H).fill('#1A252F');
      } else if (shaded) {
        doc.rect(PDF_MARGIN, y, tableWidth, PDF_ROW_H).fill('#F2F4F6');
      }

      AUDIT_COLUMNS.forEach((col) => {
        const cellH = isHeader ? PDF_HEADER_H : PDF_ROW_H;
        const value = isHeader ? col.label : String(rowData[col.key] ?? '');
        const textColor = isHeader ? '#FFFFFF' : '#1A1A1A';

        doc
            .rect(x, y, col.width, cellH)
            .strokeColor('#CCCCCC')
            .lineWidth(0.4)
            .stroke();
        doc
            .fillColor(textColor)
            .fontSize(isHeader ? 8 : 7.5)
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .text(value, x + 4, y + (cellH - (isHeader ? 8 : 7.5)) / 2 + 1, {
              width: col.width - 8,
              ellipsis: true,
              lineBreak: false,
            });
        x += col.width;
      });
    };

    let y = 75;
    drawRow(y, {}, true);
    y += PDF_HEADER_H;

    logs.forEach((log, i) => {
      if (y + PDF_ROW_H > 595 - PDF_MARGIN) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: PDF_MARGIN });
        y = PDF_MARGIN;
        drawRow(y, {}, true);
        y += PDF_HEADER_H;
      }

      const dt = new Date(log.created_at);
      const date = dt.toISOString().slice(0, 10);
      const time = dt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      drawRow(
          y,
          {
            ...log,
            branchName: this.resolveDisplayBranchName(log),
            date,
            time,
          },
          false,
          i % 2 === 0,
      );
      y += PDF_ROW_H;
    });

    const footerY = 595 - 22;
    doc
        .moveTo(PDF_MARGIN, footerY)
        .lineTo(PDF_PAGE_WIDTH - PDF_MARGIN, footerY)
        .strokeColor('#CCCCCC')
        .lineWidth(0.4)
        .stroke();
    doc
        .fillColor('#999999')
        .fontSize(7)
        .font('Helvetica')
        .text(
            `Total Records: ${logs.length}   |   Generated: ${new Date().toDateString()}   |   Ryzera POS`,
            PDF_MARGIN,
            footerY + 5,
            { align: 'center', width: tableWidth },
        );

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) =>
          reject(
              new InternalServerErrorException(
                  `PDF generation failed: ${err.message}`,
              ),
          ),
      );
    });
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async fetchAllForExport(
      dto: (Partial<QueryAuditLogDto> | Partial<ExportAuditLogDto>) & {
        branchId?: number;
      },
  ) {
    const where = this.buildWhereClause(dto);
    return this.prisma.auditLog.findMany({
      where,
      take: EXPORT_ROW_LIMIT,
      orderBy: { created_at: 'desc' },
      include: { branch: { select: { name: true } } },
    });
  }

  /**
   * Builds the Prisma where object shared by query and export endpoints.
   * branchId is set by the controller (ADMIN: optional filter, MANAGER:
   * always their own branch) — never trust a raw client-supplied value here.
   */
  private buildWhereClause(
      dto: (Partial<QueryAuditLogDto> | Partial<ExportAuditLogDto>) & {
        branchId?: number;
      },
  ) {
    const where: Record<string, unknown> = {};

    if ('username' in dto && dto.username) {
      where['username'] = {
        contains: dto.username.trim(),
        mode: 'insensitive',
      };
    }
    if ('date' in dto && dto.date) {
      where['created_at'] = {
        gte: new Date(`${dto.date}T00:00:00.000Z`),
        lte: new Date(`${dto.date}T23:59:59.999Z`),
      };
    }
    if ('action' in dto && dto.action) {
      where['action'] = dto.action;
    }
    if ('reportType' in dto && dto.reportType) {
      where['reportType'] = {
        contains: dto.reportType.trim(),
        mode: 'insensitive',
      };
    }
    if (dto.branchId) {
      where['branch_id'] = dto.branchId;
    }

    return where;
  }
}