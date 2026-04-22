import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiQuery, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ProfitLossService }     from './profit-loss.service';
import { profitLossQuerySchema } from './schemas/profit-loss.schema';
import type { ProfitLossQuery }  from './schemas/profit-loss.schema';
import { JwtAuthGuard }          from '../common/guards/jwt-auth.guard';
import { RolesGuard }            from '../common/guards/roles.guard';
import { BranchGuard }           from '../common/guards/branch.guard';
import { Roles }                 from '../common/decorators/roles.decorator';
import { CurrentUser }           from '../common/decorators/current-user.decorator';
import type { JwtPayload }       from '../common/interfaces/jwt-payload.interface';

/**
 * ProfitLossController
 *
 * Exposes the Profit & Loss report endpoints.
 * All routes are protected by JWT auth and restricted to
 * SUPER_ADMIN and BRANCH_MANAGER roles.
 *
 * Query Parameters (all endpoints):
 *   dateFrom  — Start date in YYYY-MM-DD format (required for report generation)
 *   dateTo    — End date   in YYYY-MM-DD format (required for report generation)
 *   branchId  — Filter by branch (SUPER_ADMIN only; ignored for BRANCH_MANAGER)
 *
 * Endpoints:
 *   GET /profit-loss/cards        — KPI summary cards
 *   GET /profit-loss/chart        — Live Sales Counter chart data (daily)
 *   GET /profit-loss/table        — P&L statement table (per-day breakdown)
 *   GET /profit-loss/by-branch    — Per-branch breakdown (All Branches tab)
 *   GET /profit-loss/export/csv   — CSV export
 *   GET /profit-loss/export/pdf   — PDF export
 */
@ApiTags('ProfitLoss')
@ApiBearerAuth()
@Controller('profit-loss')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class ProfitLossController {
    constructor(private readonly profitLossService: ProfitLossService) {}

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Parse and validate raw query params using the Zod schema.
     * Throws BadRequestException with a clear message if validation fails.
     */
    private parseQuery(raw: Record<string, unknown>): ProfitLossQuery {
        const result = profitLossQuerySchema.safeParse(raw);
        if (!result.success) {
            const messages = result.error.issues.map((e) => e.message).join('; ');
            throw new BadRequestException(messages);
        }
        return result.data;
    }

    /**
     * Resolve the effective branchId:
     *  - SUPER_ADMIN      → use whatever branchId is in the query (may be undefined)
     *  - BRANCH_MANAGER   → always enforce their own branchId from JWT
     */
    private resolvebranchId(
        user: JwtPayload,
        queryBranchId?: number,
    ): number | undefined {
        if (user.role === 'SUPER_ADMIN') return queryBranchId;
        return user.branchId ?? undefined;
    }

    // ─── KPI Cards ────────────────────────────────────────────────────────────

    /**
     * GET /profit-loss/cards
     * Returns the 4 top KPI cards + 3 sub-metric cards:
     *   Total Sales | COGS | Gross Profit | Net Profit | Tax | Discounts | Returns
     */
    @Get('cards')
    @ApiOperation({ summary: 'Get Profit & Loss KPI summary cards' })
    @ApiQuery({ name: 'dateFrom', required: true,  example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo',   required: true,  example: '2026-04-05', description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Filter by branch ID (SUPER_ADMIN only)' })
    async getKpiCards(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo')   dateTo:   string,
        @Query('branchId') branchId: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.branchId = this.resolvebranchId(user, query.branchId);
        return this.profitLossService.getKpiCards(query);
    }

    // ─── Live Sales Counter Chart ─────────────────────────────────────────────

    /**
     * GET /profit-loss/chart
     * Returns daily Revenue / Cost / Profit arrays for the bar chart.
     */
    @Get('chart')
    @ApiOperation({ summary: 'Get daily chart data (Revenue / Cost / Profit)' })
    @ApiQuery({ name: 'dateFrom', required: true,  example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo',   required: true,  example: '2026-04-05', description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Filter by branch ID (SUPER_ADMIN only)' })
    async getChartData(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo')   dateTo:   string,
        @Query('branchId') branchId: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.branchId = this.resolvebranchId(user, query.branchId);
        return this.profitLossService.getChartData(query);
    }

    // ─── P&L Statement Table ──────────────────────────────────────────────────

    /**
     * GET /profit-loss/table
     * Returns the detailed day-by-day P&L table rows:
     *   Date | Revenue | COGS | Gross Profit | Tax | Returns | Net Profit | Margin %
     */
    @Get('table')
    @ApiOperation({ summary: 'Get day-by-day P&L statement table' })
    @ApiQuery({ name: 'dateFrom', required: true,  example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo',   required: true,  example: '2026-04-05', description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Filter by branch ID (SUPER_ADMIN only)' })
    async getProfitLossTable(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo')   dateTo:   string,
        @Query('branchId') branchId: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.branchId = this.resolvebranchId(user, query.branchId);
        return this.profitLossService.getProfitLossTable(query);
    }

    // ─── Per-Branch Breakdown ─────────────────────────────────────────────────

    /**
     * GET /profit-loss/by-branch
     * Returns KPI + chart + table per branch.
     * Powers the "All Branches" tab showing individual branch cards.
     */
    @Get('by-branch')
    @ApiOperation({ summary: 'Get P&L breakdown per branch (All Branches tab)' })
    @ApiQuery({ name: 'dateFrom', required: true,  example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo',   required: true,  example: '2026-04-05', description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Filter by branch ID (SUPER_ADMIN only)' })
    async getByBranch(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo')   dateTo:   string,
        @Query('branchId') branchId: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.branchId = this.resolvebranchId(user, query.branchId);
        return this.profitLossService.getByBranch(query);
    }

    // ─── CSV Export ───────────────────────────────────────────────────────────

    /**
     * GET /profit-loss/export/csv
     * Streams a CSV file download of the P&L table.
     */
    @Get('export/csv')
    @ApiOperation({ summary: 'Export P&L report as CSV file' })
    @ApiQuery({ name: 'dateFrom', required: true,  example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo',   required: true,  example: '2026-04-05', description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Filter by branch ID (SUPER_ADMIN only)' })
    async exportCsv(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo')   dateTo:   string,
        @Query('branchId') branchId: string,
        @Res() res: Response,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.branchId = this.resolvebranchId(user, query.branchId);
        const buffer = await this.profitLossService.exportCsv(query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="profit-loss.csv"');
        res.send(buffer);
    }

    // ─── PDF Export ───────────────────────────────────────────────────────────

    /**
     * GET /profit-loss/export/pdf
     * Streams a PDF file download of the full P&L report.
     */
    @Get('export/pdf')
    @ApiOperation({ summary: 'Export P&L report as PDF file' })
    @ApiQuery({ name: 'dateFrom', required: true,  example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'dateTo',   required: true,  example: '2026-04-05', description: 'End date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'branchId', required: false, example: 1,            description: 'Filter by branch ID (SUPER_ADMIN only)' })
    async exportPdf(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo')   dateTo:   string,
        @Query('branchId') branchId: string,
        @Res() res: Response,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.branchId = this.resolvebranchId(user, query.branchId);
        const buffer = await this.profitLossService.exportPdf(query);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="profit-loss.pdf"');
        res.send(buffer);
    }
}