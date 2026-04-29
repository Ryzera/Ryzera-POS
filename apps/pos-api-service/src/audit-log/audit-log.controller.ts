import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express'; // ← import type fixes TS1272
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard }      from '../common/guards/jwt-auth.guard';
import { RolesGuard }        from '../common/guards/roles.guard';
import { Roles }             from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { AuditLogService }                           from './audit-log.service';
import { QueryAuditLogSchema, ExportAuditLogSchema } from './schemas/audit-log.schema';
import type { QueryAuditLogDto, ExportAuditLogDto }  from './schemas/audit-log.schema';

// ─── Reusable Swagger decorators — shared between GET and export endpoints ─────
// Defined once to avoid duplication across both methods
const ApiQueryUsername  = () => ApiQuery({ name: 'username',   required: false, example: 'sarahj',       description: 'Filter by username (partial match)'                              });
const ApiQueryDate      = () => ApiQuery({ name: 'date',       required: false, example: '2026-04-23',   description: 'Filter by calendar day (YYYY-MM-DD)'                             });
const ApiQueryAction    = () => ApiQuery({ name: 'action',     required: false, example: 'Exported PDF', description: 'Filter by action: Generated | Exported PDF | Exported CSV'        });
const ApiQueryReportType = () => ApiQuery({ name: 'reportType', required: false, example: 'Sales Report', description: 'Filter by report type label (partial match)'                    });
const ApiQueryPage      = () => ApiQuery({ name: 'page',       required: false, example: 1,              description: 'Page number — default 1'                                         });
const ApiQueryLimit     = () => ApiQuery({ name: 'limit',      required: false, example: 50,             description: 'Records per page — default 50'                                   });
const ApiQueryFormat    = () => ApiQuery({ name: 'format',     required: true,  example: 'csv',          description: 'Export format: "csv" or "pdf"'                                   });

@ApiTags('AuditLog')           // ← shows as "AuditLog" section in Swagger
@ApiBearerAuth()               // ← shows the 🔒 lock icon and sends Authorization header
@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')          // ← matches your existing role string convention
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    // ─── GET /audit-log ───────────────────────────────────────────────────────
    /**
     * Returns a paginated, filtered list of audit log entries.
     * Admin-only — all query params are optional.
     * Matches the filter bar in the UI:
     *   username, date, action, reportType, page, limit
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary:     'Get audit log entries',
        description: 'Returns paginated audit log. All filters are optional. SUPER_ADMIN only.',
    })
    @ApiQueryUsername()
    @ApiQueryDate()
    @ApiQueryAction()
    @ApiQueryReportType()
    @ApiQueryPage()
    @ApiQueryLimit()
    async getAuditLogs(
        @Query(new ZodValidationPipe(QueryAuditLogSchema)) query: QueryAuditLogDto,
    ) {
        return this.auditLogService.getAuditLogs(query);
    }

    // ─── GET /audit-log/export ────────────────────────────────────────────────
    /**
     * Exports the filtered audit log as a CSV or PDF file download.
     * The admin clicks "Export" on the Activity Log table in the UI.
     * All filter params are optional — omitting them exports everything.
     *
     * Required: format = "csv" | "pdf"
     */
    @Get('export')
    @ApiOperation({
        summary:     'Export audit log as CSV or PDF',
        description: 'Downloads the filtered audit log. Pass format=csv or format=pdf. SUPER_ADMIN only.',
    })
    @ApiQueryFormat()
    @ApiQueryUsername()
    @ApiQueryDate()
    @ApiQueryAction()
    @ApiQueryReportType()
    async exportAuditLog(
        @Query(new ZodValidationPipe(ExportAuditLogSchema)) query: ExportAuditLogDto,
        @Res() res: Response,
    ) {
        const timestamp = new Date().toISOString().slice(0, 10); // e.g. 2026-04-24

        if (query.format === 'csv') {
            const buffer = await this.auditLogService.exportCsv(query);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="audit-log-${timestamp}.csv"`);
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
            return;
        }

        // PDF
        const buffer = await this.auditLogService.exportPdf(query);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="audit-log-${timestamp}.pdf"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    }
}