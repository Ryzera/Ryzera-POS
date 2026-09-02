import {
  Controller,
  Get,
  Query,
  Res,
  UsePipes,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CategoryPerformanceService } from './category-performance.service';
import { QueryCategoryPerformanceSchema } from './schemas/query-category-performance.schema';
import type { QueryCategoryPerformanceDto } from './schemas/query-category-performance.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BranchScope, BranchScopeResult } from '../auth/decorators/branch-scope.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '../common/constants/roles.constants';
import { JwtPayload } from '@ryzera/pos-schema';
// ── Reusable Swagger query decorators ────────────────────────────────────────
const ApiDateFrom = () =>
    ApiQuery({
      name: 'dateFrom',
      required: false,
      example: '2026-04-01',
      description: 'Start date (YYYY-MM-DD)',
    });
const ApiDateTo = () =>
    ApiQuery({
      name: 'dateTo',
      required: false,
      example: '2026-04-30',
      description: 'End date (YYYY-MM-DD)',
    });
const ApiBranchId = () =>
    ApiQuery({
      name: 'branchId',
      required: false,
      example: 1,
      description: 'Branch ID — omit for All Branches (SUPER_ADMIN only)',
    });

@ApiTags('CategoryPerformance')
@ApiBearerAuth()
@Controller('category-performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MANAGER)
export class CategoryPerformanceController {
  constructor(
    private readonly categoryPerformanceService: CategoryPerformanceService,
  ) {}

  private resolvedDto(
    user: JwtPayload,
    dto: QueryCategoryPerformanceDto,
  ): QueryCategoryPerformanceDto {
    if (user.roles?.includes('ADMIN') || user.userType === 'ADMIN') {
      return { ...dto };
    }
    if (!user.branchId) {
      throw new ForbiddenException(
        'Your account is not linked to a branch. Contact a super-admin.',
      );
    }
    return { ...dto, branchId: user.branchId };
  }

  // ── KPI Cards endpoint ────────────────────────────────────────────────────
  @Get('kpi')
  @ApiDateFrom()
  @ApiDateTo()
  @ApiBranchId()
  async getKpiCards(
    @BranchScope() scope: BranchScopeResult,
    @Query(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    dto: QueryCategoryPerformanceDto,
  ) {
    const branchId = scope.branchId ?? dto.branchId;
    return this.categoryPerformanceService.getKpiCards({ ...dto, branchId });
  }

  // ── Chart / Table endpoints ────────────────────────────────────────────────
  @Get('bar-chart')
  @ApiDateFrom()
  @ApiDateTo()
  @ApiBranchId()
  async getRevenueByCategory(
    @BranchScope() scope: BranchScopeResult,
    @Query(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    dto: QueryCategoryPerformanceDto,
  ) {
    const branchId = scope.branchId ?? dto.branchId;
    return this.categoryPerformanceService.getRevenueByCategory({
      ...dto,
      branchId,
    });
  }

  @Get('pie-chart')
  @ApiDateFrom()
  @ApiDateTo()
  @ApiBranchId()
  async getProfitByCategory(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    dto: QueryCategoryPerformanceDto,
  ) {
    return this.categoryPerformanceService.getProfitByCategory(
      this.resolvedDto(user, dto),
    );
  }

  @Get('table')
  @ApiDateFrom()
  @ApiDateTo()
  @ApiBranchId()
  async getCategoryTable(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    dto: QueryCategoryPerformanceDto,
  ) {
    return this.categoryPerformanceService.getCategoryTable(
      this.resolvedDto(user, dto),
    );
  }

  // ── Per Branch tab (SUPER_ADMIN only) — UNCHANGED, no @CurrentUser() here ──
  @Get('by-branch')
  @ApiDateFrom()
  @ApiDateTo()
  @Roles(ROLES.ADMIN)
  @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
  async getByBranch(@Query() dto: QueryCategoryPerformanceDto) {
    return this.categoryPerformanceService.getCategoryPerformanceByBranch(dto);
  }

  // ── Export endpoints ──────────────────────────────────────────────────────
  @Get('export/csv')
  @ApiDateFrom()
  @ApiDateTo()
  @ApiBranchId()
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    dto: QueryCategoryPerformanceDto,
    @Res() res: Response,
  ) {
    const buffer = await this.categoryPerformanceService.exportCsv(
      this.resolvedDto(user, dto),
      user,
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="category-performance.csv"',
    );
    res.end(buffer);
  }

  @Get('export/pdf')
  @ApiDateFrom()
  @ApiDateTo()
  @ApiBranchId()
  async exportPdf(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    dto: QueryCategoryPerformanceDto,
    @Res() res: Response,
  ) {
    const buffer = await this.categoryPerformanceService.exportPdf(
      this.resolvedDto(user, dto),
      user,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="category-performance.pdf"',
    );
    res.end(buffer);
  }
}
