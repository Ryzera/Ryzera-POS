import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DailySummaryService } from './daily-summary.service';
import {
  QueryDailySummarySchema,
  QueryDailySummaryInput,
} from './schemas/daily-summary.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BranchScope, BranchScopeResult } from '../auth/decorators/branch-scope.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '../common/constants/roles.constants';
import { JwtPayload } from '@ryzera/pos-schema';
import { ZodError } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('DailySummary')
@ApiBearerAuth()
@Controller('daily-summary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MANAGER)
export class DailySummaryController {
  constructor(private readonly dailySummaryService: DailySummaryService) {}

  // ─── Validate + enrich query with role-based branchId ────────────────────
  /**
   * Parses the raw query string through Zod and enforces role-based branch access.
   * SUPER_ADMIN: can pass any branchId or none (= All Branches).
   * All other roles: branchId is always overridden with their JWT branchId,
   *   so they can only ever see their own branch data.
   */
  private parseAndEnrichQuery(
      user: JwtPayload,
      rawQuery: Record<string, string>,
  ): QueryDailySummaryInput {
    let parsed: QueryDailySummaryInput;

    try {
      parsed = QueryDailySummarySchema.parse(rawQuery);
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((e) => e.message).join('; ');
        throw new BadRequestException(`Validation failed: ${messages}`);
      }
      throw err;
    }

    // Non-SUPER_ADMIN users are always locked to their own branch from JWT
    const isAdmin = user.roles?.includes('ADMIN') || user.userType === 'ADMIN';
    if (!isAdmin) {
      parsed.branchId = user.branchId ?? undefined;
    }

    return parsed;
  }

  // ── GET /daily-summary/cards?date=YYYY-MM-DD&branchId=N ──────────────────
  @Get('cards')
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    example: '1',
    description:
        'Branch ID — SUPER_ADMIN only; other roles are locked to their branch',
  })
  async getKpiCards(
      @BranchScope() scope: BranchScopeResult,
      @Query(new ZodValidationPipe(QueryDailySummarySchema))
      dto: QueryDailySummaryInput,
  ) {
    const branchId = scope.branchId ?? dto.branchId;
    return this.dailySummaryService.getKpiCards({ ...dto, branchId });
  }

  // ── GET /daily-summary/hourly-chart?date=YYYY-MM-DD&branchId=N ───────────
  @Get('hourly-chart')
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    example: '1',
    description: 'Branch ID — SUPER_ADMIN only',
  })
  async getHourlySales(
      @CurrentUser() user: JwtPayload,
      @Query() rawQuery: Record<string, string>,
  ) {
    const dto = this.parseAndEnrichQuery(user, rawQuery);
    return this.dailySummaryService.getHourlySales(dto);
  }

  // ── GET /daily-summary/payment-methods?date=YYYY-MM-DD&branchId=N ────────
  @Get('payment-methods')
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    example: '1',
    description: 'Branch ID — SUPER_ADMIN only',
  })
  async getPaymentMethods(
      @CurrentUser() user: JwtPayload,
      @Query() rawQuery: Record<string, string>,
  ) {
    const dto = this.parseAndEnrichQuery(user, rawQuery);
    return this.dailySummaryService.getPaymentMethods(dto);
  }

  // ── GET /daily-summary/details?date=YYYY-MM-DD&branchId=N ────────────────
  @Get('details')
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    example: '1',
    description: 'Branch ID — SUPER_ADMIN only',
  })
  async getDailySummaryDetails(
      @CurrentUser() user: JwtPayload,
      @Query() rawQuery: Record<string, string>,
  ) {
    const dto = this.parseAndEnrichQuery(user, rawQuery);
    return this.dailySummaryService.getDailySummaryDetails(dto);
  }

  // ── GET /daily-summary/all-branches?date=YYYY-MM-DD (SUPER_ADMIN only) ───
  @Get('all-branches')
  @Roles(ROLES.ADMIN)
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  async getAllBranchesSummary(
      @CurrentUser() user: JwtPayload,
      @Query() rawQuery: Record<string, string>,
  ) {
    const dto = this.parseAndEnrichQuery(user, rawQuery);
    return this.dailySummaryService.getAllBranchesSummary(dto);
  }

  // ── GET /daily-summary/export/csv?date=YYYY-MM-DD&branchId=N ─────────────
  @Get('export/csv')
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    example: '1',
    description: 'Branch ID — SUPER_ADMIN only',
  })
  async exportCsv(
      @CurrentUser() user: JwtPayload,
      @Query() rawQuery: Record<string, string>,
      @Res() res: Response,
  ) {
    const dto = this.parseAndEnrichQuery(user, rawQuery);
    const buffer = await this.dailySummaryService.exportCsv(dto, user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="daily-summary.csv"',
    );
    res.send(buffer);
  }

  // ── GET /daily-summary/export/pdf?date=YYYY-MM-DD&branchId=N ─────────────
  @Get('export/pdf')
  @ApiQuery({
    name: 'date',
    required: false,
    example: '2026-04-01',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    example: '1',
    description: 'Branch ID — SUPER_ADMIN only',
  })
  async exportPdf(
      @CurrentUser() user: JwtPayload,
      @Query() rawQuery: Record<string, string>,
      @Res() res: Response,
  ) {
    const dto = this.parseAndEnrichQuery(user, rawQuery);
    const buffer = await this.dailySummaryService.exportPdf(dto, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename="daily-summary.pdf"',
    );
    res.send(buffer);
  }
}
