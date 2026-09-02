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

import { SalesReportService } from './sales-report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  BranchScope,
  BranchScopeResult,
} from '../auth/decorators/branch-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ROLES } from '../common/constants/roles.constants';
import { JwtPayload } from '@ryzera/pos-schema';
import {
  QuerySalesReportSchema,
  CreateSummarySchema,
  type QuerySalesReportDto,
  type CreateSummaryDto,
} from './schemas/sales-report.schema';

// ─── Reusable shared filter decorators (mirrors the UI filter bar) ────────────
const SharedReportFilters =
    () => (target: object, key: string, descriptor: PropertyDescriptor) => {
      ApiQuery({
        name: 'dateFrom',
        required: false,
        example: '2026-04-01',
        description: 'Start date (YYYY-MM-DD)',
      })(target, key, descriptor);
      ApiQuery({
        name: 'dateTo',
        required: false,
        example: '2026-04-05',
        description: 'End date (YYYY-MM-DD)',
      })(target, key, descriptor);
      ApiQuery({
        name: 'branchId',
        required: false,
        example: '1',
        description: 'Branch ID (ADMIN only passes this; others locked to JWT)',
      })(target, key, descriptor);
      ApiQuery({
        name: 'category',
        required: false,
        example: 'Beverages',
        description: 'Filter by category name (partial match)',
      })(target, key, descriptor);
      ApiQuery({
        name: 'product',
        required: false,
        example: 'Coca-Cola',
        description: 'Filter by product name (partial match)',
      })(target, key, descriptor);
      return descriptor;
    };

// Cashiers only ever see their own branch's sales report — never other
// reports, never KPI settings, never the audit log (enforced by the
// @Roles() on each of those controllers, not here).
@ApiTags('SalesReport')
@ApiBearerAuth()
@Controller('reports/sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER)
export class SalesReportController {
  constructor(private readonly salesReportService: SalesReportService) {}

  // ─── Helper: resolve effective branchId ───────────────────────────────────
  // ADMIN can pass any branchId; other roles are locked to their own branch
  private resolvebranchId(
    user: JwtPayload,
    queryBranchId?: number,
  ): number | undefined {
    const isAdmin = user.roles?.includes('ADMIN') || user.userType === 'ADMIN';
    return isAdmin ? queryBranchId : (user.branchId ?? undefined);
  }

  // ─── GET /reports/sales/cards ─────────────────────────────────────────────
  @Get('cards')
  @SharedReportFilters()
  getSummaryCards(
    @BranchScope() scope: BranchScopeResult,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
  ) {
    const branchId = scope.branchId ?? query.branchId;
    return this.salesReportService.getSummaryCards({ ...query, branchId });
  }

  @Get('branches')
  @Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.INVENTORY_MANAGER)
  getSalesBranches() {
    return this.salesReportService.getBranchList();
  }

  // ─── GET /reports/sales/chart ─────────────────────────────────────────────
  @Get('chart')
  @SharedReportFilters()
  getChartData(
    @BranchScope() scope: BranchScopeResult,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
  ) {
    const branchId = scope.branchId ?? query.branchId;
    return this.salesReportService.getChartData({ ...query, branchId });
  }

  // ─── GET /reports/sales/payment-methods ──────────────────────────────────
  @Get('payment-methods')
  @SharedReportFilters()
  getPaymentMethodBreakdown(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
  ) {
    const branchId = this.resolvebranchId(user, query.branchId);
    return this.salesReportService.getPaymentMethodBreakdown({
      ...query,
      branchId,
    });
  }

  // ─── GET /reports/sales/transactions ─────────────────────────────────────
  @Get('transactions')
  @SharedReportFilters()
  getSalesTransactions(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
  ) {
    const branchId = this.resolvebranchId(user, query.branchId);
    return this.salesReportService.getSalesTransactions({ ...query, branchId });
  }

  // ─── GET /reports/sales/by-branch ────────────────────────────────────────
  @Get('by-branch')
  @Roles(ROLES.ADMIN)
  @SharedReportFilters()
  getByBranch(
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
  ) {
    return this.salesReportService.getReportByBranch(query);
  }

  // ─── GET /reports/sales/export/csv ───────────────────────────────────────
  @Get('export/csv')
  @SharedReportFilters()
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
    @Res() res: Response,
  ) {
    const branchId = this.resolvebranchId(user, query.branchId);
    const csv = await this.salesReportService.exportToCsv(
      { ...query, branchId },
      user,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-report-${query.dateFrom ?? 'all'}.csv"`,
    );
    res.send(csv);
  }

  // ─── GET /reports/sales/export/pdf ───────────────────────────────────────
  @Get('export/pdf')
  @SharedReportFilters()
  async exportPdf(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
    @Res() res: Response,
  ) {
    const branchId = this.resolvebranchId(user, query.branchId);
    const pdfBuffer = await this.salesReportService.exportToPdf(
      { ...query, branchId },
      user,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-report-${query.dateFrom ?? 'all'}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  // ─── GET /reports/sales/list ──────────────────────────────────────────────
  @Get('list')
  @SharedReportFilters()
  getSummaryList(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(QuerySalesReportSchema))
    query: QuerySalesReportDto,
  ) {
    const branchId = this.resolvebranchId(user, query.branchId);
    return this.salesReportService.getSummaryList({ ...query, branchId });
  }

  // ─── POST /reports/sales ──────────────────────────────────────────────────
  @Post()
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
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
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  updateSummary(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateSummarySchema)) body: CreateSummaryDto,
  ) {
    return this.salesReportService.updateSummary(id, body);
  }

  // ─── DELETE /reports/sales/:id ────────────────────────────────────────────
  @Delete(':id')
  @Roles(ROLES.ADMIN)
  deleteSummary(@Param('id') id: string) {
    return this.salesReportService.deleteSummary(id);
  }
}
