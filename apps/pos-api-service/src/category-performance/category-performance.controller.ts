import {
    Controller, Get, Query, Res, UsePipes, UseGuards, ForbiddenException,
} from '@nestjs/common';
import { ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ZodValidationPipe }               from '../common/pipes/zod-validation.pipe';
import { CategoryPerformanceService }      from './category-performance.service';
import { QueryCategoryPerformanceSchema }  from './schemas/query-category-performance.schema';
import type { QueryCategoryPerformanceDto } from './schemas/query-category-performance.schema';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { BranchGuard }   from '../common/guards/branch.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// ── Reusable Swagger query decorators ────────────────────────────────────────
const ApiDateFrom = () => ApiQuery({ name: 'dateFrom', required: false, example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' });
const ApiDateTo   = () => ApiQuery({ name: 'dateTo',   required: false, example: '2026-04-30', description: 'End date (YYYY-MM-DD)' });
const ApiBranchId = () => ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Branch ID — omit for All Branches (SUPER_ADMIN only)' });

@ApiTags('CategoryPerformance')
@ApiBearerAuth()
@Controller('category-performance')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class CategoryPerformanceController {
    constructor(
        private readonly categoryPerformanceService: CategoryPerformanceService,
    ) {}

    /**
     * Resolves the correct branchId for every endpoint call.
     *
     * SUPER_ADMIN
     *   • Query includes branchId   → filters to that single branch (Per Branch tab / branch picker)
     *   • Query omits branchId      → branchId stays undefined → Prisma queries ALL branches
     *                                  → response is summed across all branches (All Branches tab)
     *
     * BRANCH_MANAGER
     *   • branchId is ALWAYS overridden to user.branchId from the JWT.
     *   • Any branchId query param they send is silently ignored.
     *   • If user.branchId is missing (malformed token) → 403 rather than leaking all data.
     *
     * NOTE: spreads into a new object rather than mutating the Zod-parsed DTO.
     * Mutating the pipe's output is unreliable — NestJS may return a frozen
     * or reference-equal instance, causing the mutation to be silently lost.
     */
    private resolvedDto(
        user: JwtPayload,
        dto: QueryCategoryPerformanceDto,
    ): QueryCategoryPerformanceDto {
        if (user.role === 'SUPER_ADMIN') {
            // Keep whatever branchId the SUPER_ADMIN passed (may be undefined → all branches)
            return { ...dto };
        }

        // BRANCH_MANAGER — enforce their own branch
        if (!user.branchId) {
            throw new ForbiddenException(
                'Your account is not linked to a branch. Contact a super-admin.',
            );
        }
        return { ...dto, branchId: user.branchId };
    }

    // ── KPI Cards endpoint ────────────────────────────────────────────────────

    /**
     * GET /category-performance/kpi
     *
     * Returns the top 3 categories by revenue for the selected date period.
     * Used to populate KPI cards in the Category Performance dashboard.
     *
     * All Branches tab  → SUPER_ADMIN, no branchId → sums all branches
     * Single branch     → SUPER_ADMIN with branchId, or BRANCH_MANAGER (auto-scoped)
     *
     * Response: { topCategories: [{ rank, category, revenue }] }
     */
    @Get('kpi')
    @ApiDateFrom() @ApiDateTo() @ApiBranchId()
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async getKpiCards(
        @CurrentUser() user: JwtPayload,
        @Query() dto: QueryCategoryPerformanceDto,
    ) {
        return this.categoryPerformanceService.getKpiCards(
            this.resolvedDto(user, dto),
        );
    }

    // ── Chart / Table endpoints (SUPER_ADMIN + BRANCH_MANAGER) ───────────────

    /**
     * GET /category-performance/bar-chart
     *
     * Revenue per category — used for the bar chart widget.
     *
     * All Branches tab  → SUPER_ADMIN, no branchId → sums all branches
     * Single branch     → SUPER_ADMIN with branchId, or BRANCH_MANAGER (auto-scoped)
     */
    @Get('bar-chart')
    @ApiDateFrom() @ApiDateTo() @ApiBranchId()
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async getRevenueByCategory(
        @CurrentUser() user: JwtPayload,
        @Query() dto: QueryCategoryPerformanceDto,
    ) {
        return this.categoryPerformanceService.getRevenueByCategory(
            this.resolvedDto(user, dto),
        );
    }

    /**
     * GET /category-performance/pie-chart
     *
     * Profit distribution per category — used for the pie chart widget.
     * Same branch-resolution rules as bar-chart.
     */
    @Get('pie-chart')
    @ApiDateFrom() @ApiDateTo() @ApiBranchId()
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async getProfitByCategory(
        @CurrentUser() user: JwtPayload,
        @Query() dto: QueryCategoryPerformanceDto,
    ) {
        return this.categoryPerformanceService.getProfitByCategory(
            this.resolvedDto(user, dto),
        );
    }

    /**
     * GET /category-performance/table
     *
     * Full metrics table per category.
     * Same branch-resolution rules as bar-chart.
     */
    @Get('table')
    @ApiDateFrom() @ApiDateTo() @ApiBranchId()
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async getCategoryTable(
        @CurrentUser() user: JwtPayload,
        @Query() dto: QueryCategoryPerformanceDto,
    ) {
        return this.categoryPerformanceService.getCategoryTable(
            this.resolvedDto(user, dto),
        );
    }

    // ── Per Branch tab (SUPER_ADMIN only) ────────────────────────────────────

    /**
     * GET /category-performance/by-branch
     *
     * Returns an expanded breakdown — one entry per active branch.
     *
     * Restricted to SUPER_ADMIN only via the method-level @Roles decorator
     * (overrides the class-level one). BRANCH_MANAGERs receive 403.
     *
     * NOTE: This endpoint intentionally does NOT call resolvedDto — it always
     * fetches every branch independently inside the service. There is no
     * single branchId to resolve here.
     */
    @Get('by-branch')
    @ApiDateFrom() @ApiDateTo()
    @Roles('SUPER_ADMIN')
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async getByBranch(
        @Query() dto: QueryCategoryPerformanceDto,
    ) {
        return this.categoryPerformanceService.getCategoryPerformanceByBranch(dto);
    }

    // ── Export endpoints (SUPER_ADMIN + BRANCH_MANAGER) ──────────────────────

    /**
     * GET /category-performance/export/csv
     *
     * Downloads a CSV of the detail table for the resolved branch scope.
     */
    @Get('export/csv')
    @ApiDateFrom() @ApiDateTo() @ApiBranchId()
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async exportCsv(
        @CurrentUser() user: JwtPayload,
        @Query() dto: QueryCategoryPerformanceDto,
        @Res() res: Response,
    ) {
        const buffer = await this.categoryPerformanceService.exportCsv(
            this.resolvedDto(user, dto),
        );
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="category-performance.csv"');
        res.end(buffer);
    }

    /**
     * GET /category-performance/export/pdf
     *
     * Downloads a PDF of the detail table for the resolved branch scope.
     */
    @Get('export/pdf')
    @ApiDateFrom() @ApiDateTo() @ApiBranchId()
    @UsePipes(new ZodValidationPipe(QueryCategoryPerformanceSchema))
    async exportPdf(
        @CurrentUser() user: JwtPayload,
        @Query() dto: QueryCategoryPerformanceDto,
        @Res() res: Response,
    ) {
        const buffer = await this.categoryPerformanceService.exportPdf(
            this.resolvedDto(user, dto),
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="category-performance.pdf"');
        res.end(buffer);
    }
}