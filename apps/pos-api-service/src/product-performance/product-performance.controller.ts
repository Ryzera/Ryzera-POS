import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiQuery, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ProductPerformanceService } from './product-performance.service';
import { ProductPerformanceQuerySchema } from './schemas/product-performance.schema';
import type { ResolvedProductPerformanceFilter } from './schemas/product-performance.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('ProductPerformance')
@ApiBearerAuth()
@Controller('product-performance')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class ProductPerformanceController {
    constructor(
        private readonly productPerformanceService: ProductPerformanceService,
    ) {}

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private parseQuery(
        raw: Record<string, unknown>,
    ): ResolvedProductPerformanceFilter {
        const result = ProductPerformanceQuerySchema.safeParse(raw);
        if (!result.success) {
            const messages = result.error.issues
                .map((e) => e.message)
                .join('; ');
            throw new BadRequestException(messages);
        }
        return result.data as ResolvedProductPerformanceFilter;
    }

    private resolvebranchId(
        user: JwtPayload,
        queryBranchId?: number,
    ): number | undefined {
        if (user.role === 'SUPER_ADMIN') return queryBranchId;
        return user.branchId ?? undefined;
    }

    // ─── KPI Cards ────────────────────────────────────────────────────────────

    @Get('cards')
    @ApiOperation({ summary: 'Get Product Performance KPI summary cards' })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Category name partial match',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'Filter by branch ID (SUPER_ADMIN only)',
    })
    async getKpiCards(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('category') category?: string,
        @Query('branchId') branchId?: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, category, branchId });
        query.resolvedBranchId = this.resolvebranchId(user, query.branchId);
        return this.productPerformanceService.getKpiCards(query);
    }

    // ─── Top 10 Products ──────────────────────────────────────────────────────

    @Get('top-products')
    @ApiOperation({ summary: 'Get top 10 products by units sold (bar chart)' })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Category name partial match',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'Filter by branch ID (SUPER_ADMIN only)',
    })
    async getTopProducts(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('category') category?: string,
        @Query('branchId') branchId?: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, category, branchId });
        query.resolvedBranchId = this.resolvebranchId(user, query.branchId);
        return this.productPerformanceService.getTopProducts(query);
    }

    // ─── Payment Methods ──────────────────────────────────────────────────────

    @Get('payment-methods')
    @ApiOperation({ summary: 'Get payment method breakdown (pie chart)' })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'Filter by branch ID (SUPER_ADMIN only)',
    })
    async getPaymentMethodBreakdown(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('branchId') branchId?: string,
    ) {
        const query = this.parseQuery({ dateFrom, dateTo, branchId });
        query.resolvedBranchId = this.resolvebranchId(user, query.branchId);
        return this.productPerformanceService.getPaymentMethodBreakdown(query);
    }

    // ─── Per-Branch Summary ───────────────────────────────────────────────────

    @Get('per-branch')
    @ApiOperation({ summary: 'Get per-branch summary — SUPER_ADMIN only' })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Category name partial match',
    })
    async getPerBranchSummary(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('category') category?: string,
    ) {
        if (user.role === 'BRANCH_MANAGER') {
            throw new ForbiddenException(
                'Branch managers cannot access the per-branch summary.',
            );
        }
        const query = this.parseQuery({ dateFrom, dateTo, category });
        query.resolvedBranchId = undefined;
        return this.productPerformanceService.getPerBranchSummary(query);
    }

    // ─── Product Table ────────────────────────────────────────────────────────

    @Get('table')
    @ApiOperation({
        summary: 'Get paginated product performance details table',
    })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Category name partial match',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'Filter by branch ID (SUPER_ADMIN only)',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number (default: 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        example: 10,
        description: 'Records per page (default: 10)',
    })
    async getProductTable(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('category') category?: string,
        @Query('branchId') branchId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const query = this.parseQuery({
            dateFrom,
            dateTo,
            category,
            branchId,
            page,
            limit,
        });
        query.resolvedBranchId = this.resolvebranchId(user, query.branchId);
        return this.productPerformanceService.getProductTable(query);
    }

    // ─── Export CSV ───────────────────────────────────────────────────────────

    @Get('export/csv')
    @ApiOperation({ summary: 'Export product performance data as CSV file' })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Category name partial match',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'Filter by branch ID (SUPER_ADMIN only)',
    })
    async exportCsv(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('category') category?: string,
        @Query('branchId') branchId?: string,
        @Res() res?: Response,
    ): Promise<void> {
        const query = this.parseQuery({ dateFrom, dateTo, category, branchId });
        query.resolvedBranchId = this.resolvebranchId(user, query.branchId);
        const csv = await this.productPerformanceService.exportToCsv(query,user);
        res!.setHeader('Content-Type', 'text/csv');
        res!.setHeader(
            'Content-Disposition',
            'attachment; filename="product-performance.csv"',
        );
        res!.send(csv);
    }

    // ─── Export PDF ───────────────────────────────────────────────────────────

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export product performance data as PDF file' })
    @ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Category name partial match',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        example: 1,
        description: 'Filter by branch ID (SUPER_ADMIN only)',
    })
    async exportPdf(
        @CurrentUser() user: JwtPayload,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('category') category?: string,
        @Query('branchId') branchId?: string,
        @Res() res?: Response,
    ): Promise<void> {
        const query = this.parseQuery({ dateFrom, dateTo, category, branchId });
        query.resolvedBranchId = this.resolvebranchId(user, query.branchId);
        const pdfBuffer =
            await this.productPerformanceService.exportToPdf(query,user);
        res!.setHeader('Content-Type', 'application/pdf');
        res!.setHeader(
            'Content-Disposition',
            'attachment; filename="product-performance.pdf"',
        );
        res!.send(pdfBuffer);
    }
}