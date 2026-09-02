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
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ROLES } from '../common/constants/roles.constants';
import { JwtPayload } from '@ryzera/pos-schema';

import { ReportsAuditLogService } from './audit-log.service';
import {
    QueryAuditLogSchema,
    ExportAuditLogSchema,
} from './schemas/audit-log.schema';
import type {
    QueryAuditLogDto,
    ExportAuditLogDto,
} from './schemas/audit-log.schema';

// ─── Reusable Swagger decorators — shared between GET and export endpoints ─────
const ApiQueryUsername = () =>
    ApiQuery({
        name: 'username',
        required: false,
        example: 'sarahj',
        description: 'Filter by username (partial match)',
    });
const ApiQueryDate = () =>
    ApiQuery({
        name: 'date',
        required: false,
        example: '2026-04-23',
        description: 'Filter by calendar day (YYYY-MM-DD)',
    });
const ApiQueryAction = () =>
    ApiQuery({
        name: 'action',
        required: false,
        example: 'Exported PDF',
        description: 'Filter by action: Generated | Exported PDF | Exported CSV',
    });
const ApiQueryReportType = () =>
    ApiQuery({
        name: 'reportType',
        required: false,
        example: 'Sales Report',
        description: 'Filter by report type label (partial match)',
    });
const ApiQueryBranchId = () =>
    ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'ADMIN only — filter to one branch. Ignored for MANAGER.',
    });
const ApiQueryPage = () =>
    ApiQuery({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number — default 1',
    });
const ApiQueryLimit = () =>
    ApiQuery({
        name: 'limit',
        required: false,
        example: 50,
        description: 'Records per page — default 50',
    });
const ApiQueryFormat = () =>
    ApiQuery({
        name: 'format',
        required: true,
        example: 'csv',
        description: 'Export format: "csv" or "pdf"',
    });

@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsAuditLogController {
  constructor(private readonly auditLogService: ReportsAuditLogService) {}
  private resolveBranchId(
    user: JwtPayload,
    queryBranchId?: number,
  ): number | undefined {
    const isAdmin = user.roles?.includes('ADMIN') || user.userType === 'ADMIN';
    return isAdmin ? queryBranchId : (user.branchId ?? undefined);
  }

  // ─── GET /audit-log ───────────────────────────────────────────────────────
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit log entries',
    description:
      'Returns paginated audit log. ADMIN sees all branches; MANAGER sees only their own branch.',
  })
  @ApiQueryUsername()
  @ApiQueryDate()
  @ApiQueryAction()
  @ApiQueryReportType()
  @ApiQueryBranchId()
  @ApiQueryPage()
  @ApiQueryLimit()
  async getAuditLogs(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QueryAuditLogSchema)) query: QueryAuditLogDto,
  ) {
    const branchId = this.resolveBranchId(user, query.branchId);
    return this.auditLogService.getAuditLogs({ ...query, branchId });
  }

  // ─── GET /audit-log/export ────────────────────────────────────────────────
  @Get('export')
  @ApiOperation({
    summary: 'Export audit log as CSV or PDF',
    description:
      'Downloads the filtered audit log. Pass format=csv or format=pdf. ADMIN sees all branches; MANAGER only their own.',
  })
  @ApiQueryFormat()
  @ApiQueryUsername()
  @ApiQueryDate()
  @ApiQueryAction()
  @ApiQueryReportType()
  @ApiQueryBranchId()
  async exportAuditLog(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(ExportAuditLogSchema))
    query: ExportAuditLogDto,
    @Res() res: Response,
  ) {
    const branchId = this.resolveBranchId(user, query.branchId);
    const effectiveQuery = { ...query, branchId };
    const timestamp = new Date().toISOString().slice(0, 10); // e.g. 2026-04-24

    if (query.format === 'csv') {
      const buffer = await this.auditLogService.exportCsv(effectiveQuery);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="audit-log-${timestamp}.csv"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    // PDF
    const buffer = await this.auditLogService.exportPdf(effectiveQuery);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-log-${timestamp}.pdf"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}
