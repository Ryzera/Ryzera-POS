import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Query,
    Param,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';

import { SalesReportService }    from './sales-report.service';
import { JwtAuthGuard }          from '../common/guards/jwt-auth.guard';
import { RolesGuard }            from '../common/guards/roles.guard';
import { BranchGuard }           from '../common/guards/branch.guard';
import { Roles }                 from '../common/decorators/roles.decorator';
import { CurrentUser }           from '../common/decorators/current-user.decorator';
import { ZodValidationPipe }     from '../common/pipes/zod-validation.pipe';
import type { JwtPayload }       from '../common/interfaces/jwt-payload.interface';

import {
    QuerySalesReportSchema,
    CreateSummarySchema,
    type QuerySalesReportDto,
    type CreateSummaryDto,
} from './schemas/sales-report.schema';

// ─── Reusable shared filter decorators (mirrors the UI filter bar) ────────────
// All report endpoints accept the same filters so the frontend
// can call all of them with one shared query string on Generate click.
const SharedReportFilters = () => (
    target: object,
    key: string,
    descriptor: PropertyDescriptor,
) => {
    ApiQuery({ name: 'dateFrom', required: false, example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })(target, key, descriptor);
    ApiQuery({ name: 'dateTo',   required: false, example: '2026-04-05', description: 'End date (YYYY-MM-DD)'   })(target, key, descriptor);
    ApiQuery({ name: 'branchId', required: false, example: '1',          description: 'Branch ID (SUPER_ADMIN only passes this; others locked to JWT)' })(target, key, descriptor);
    ApiQuery({ name: 'category', required: false, example: 'Beverages',  description: 'Filter by category name (partial match)' })(target, key, descriptor);
    ApiQuery({ name: 'product',  required: false, example: 'Coca-Cola',  description: 'Filter by product name (partial match)'  })(target, key, descriptor);
    return descriptor;
};

@ApiTags('SalesReport')
@ApiBearerAuth()
@Controller('reports/sales')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'CASHIER')
export class SalesReportController {
    constructor(private readonly salesReportService: SalesReportService) {}

    // ─── Helper: resolve effective branchId ───────────────────────────────────
    // SUPER_ADMIN can pass any branchId; other roles are locked to their own branch
    private resolvebranchId(
        user: JwtPayload,
        queryBranchId?: number,
    ): number | undefined {
        return user.role === 'SUPER_ADMIN'
            ? queryBranchId
            : (user.branchId ?? undefined);
    }

    // ─── GET /reports/sales/cards ─────────────────────────────────────────────
    // KPI cards: Total Revenue | Total Transactions | Total Items | Average Sale
    @Get('cards')
    @SharedReportFilters()
    getSummaryCards(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        return this.salesReportService.getSummaryCards({ ...query, branchId });
    }

    // ─── GET /reports/sales/chart ─────────────────────────────────────────────
    // Bar chart: daily sales amounts from DailySummary table
    @Get('chart')
    @SharedReportFilters()
    getChartData(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        return this.salesReportService.getChartData({ ...query, branchId });
    }

    // ─── GET /reports/sales/payment-methods ──────────────────────────────────
    // Pie chart: breakdown by Cash / Card / Split
    @Get('payment-methods')
    @SharedReportFilters()
    getPaymentMethodBreakdown(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        return this.salesReportService.getPaymentMethodBreakdown({ ...query, branchId });
    }

    // ─── GET /reports/sales/transactions ─────────────────────────────────────
    // Paginated transaction table — also accepts status, search, page, limit
    @Get('transactions')
    @SharedReportFilters()
// ← removed: status, search, page, limit @ApiQuery decorators
    getSalesTransactions(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        return this.salesReportService.getSalesTransactions({ ...query, branchId });
    }

    // ─── GET /reports/sales/by-branch ────────────────────────────────────────
    // Per-branch tab: one KPI block per active branch
    @Get('by-branch')
    @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
    @SharedReportFilters()
    getByBranch(
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
    ) {
        return this.salesReportService.getReportByBranch(query);
    }

    // ─── GET /reports/sales/export/csv ───────────────────────────────────────
    // Downloads full filtered transaction list as CSV
    @Get('export/csv')
    @SharedReportFilters()
    async exportCsv(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
        @Res() res: Response,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        const csv = await this.salesReportService.exportToCsv({ ...query, branchId },user);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="sales-report-${query.dateFrom ?? 'all'}.csv"`,
        );
        res.send(csv);
    }

    // ─── GET /reports/sales/export/pdf ───────────────────────────────────────
    // Downloads full filtered transaction list as styled PDF
    @Get('export/pdf')
    @SharedReportFilters()
    async exportPdf(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
        @Res() res: Response,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        const pdfBuffer = await this.salesReportService.exportToPdf({ ...query, branchId },user);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="sales-report-${query.dateFrom ?? 'all'}.pdf"`,
        );
        res.send(pdfBuffer);
    }

    // ─── GET /reports/sales/list ──────────────────────────────────────────────
    // Paginated DailySummary list
    @Get('list')
    @SharedReportFilters()
// ← removed: page, limit @ApiQuery decorators
    getSummaryList(
        @CurrentUser() user: JwtPayload,
        @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto,
    ) {
        const branchId = this.resolvebranchId(user, query.branchId);
        return this.salesReportService.getSummaryList({ ...query, branchId });
    }

    // ─── POST /reports/sales ──────────────────────────────────────────────────
    // Manually create a DailySummary record
    @Post()
    @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
    createSummary(
        @Body(new ZodValidationPipe(CreateSummarySchema)) body: CreateSummaryDto,
    ) {
        return this.salesReportService.createDailySummary(body);
    }

    // ─── GET /reports/sales/:id ───────────────────────────────────────────────
    // Must stay BELOW all named @Get() routes — NestJS matches routes top to bottom
    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.salesReportService.getOneSummary(id);
    }

    // ─── PUT /reports/sales/:id ───────────────────────────────────────────────
    @Put(':id')
    @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
    updateSummary(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(CreateSummarySchema)) body: CreateSummaryDto,
    ) {
        return this.salesReportService.updateSummary(id, body);
    }

    // ─── DELETE /reports/sales/:id ────────────────────────────────────────────
    @Delete(':id')
    @Roles('SUPER_ADMIN')
    deleteSummary(@Param('id') id: string) {
        return this.salesReportService.deleteSummary(id);
    }
}