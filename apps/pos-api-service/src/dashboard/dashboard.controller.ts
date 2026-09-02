import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BranchScope, BranchScopeResult } from '../auth/decorators/branch-scope.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../common/constants/roles.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@ryzera/pos-schema';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_MANAGER, ROLES.CASHIER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Resolves the branch scope the SAME way for every endpoint below:
  // ADMIN may query any branch (or none = all); everyone else is
  // always locked to their own branch from the JWT, full stop —
  // the query param is ignored for non-admins.
  private resolveBranchId(
    user: JwtPayload,
    queryBranchId?: number,
  ): number | undefined {
    const isAdmin = user.roles?.includes('ADMIN') || user.userType === 'ADMIN';
    return isAdmin ? queryBranchId : (user.branchId ?? undefined);
  }

  @Get('kpi')
  getKpiCards(
    @BranchScope() scope: BranchScopeResult,
    @Query('branchId') branchId?: number,
  ) {
    const effectiveBranchId =
      scope.branchId ?? (branchId ? Number(branchId) : undefined);
    return this.dashboardService.getKpiCards(effectiveBranchId);
  }

  @Get('live-sales')
  async getLiveSales(
    @BranchScope() scope: BranchScopeResult,
    @Query('branchId') branchId?: number,
  ) {
    const effectiveBranchId =
      scope.branchId ?? (branchId ? Number(branchId) : undefined);
    return this.dashboardService.getLiveSales(effectiveBranchId);
  }

  @Get('low-stock-alerts')
  async getLowStockAlerts(
    @BranchScope() scope: BranchScopeResult,
    @Query('branchId') branchId?: number,
  ) {
    const effectiveBranchId =
      scope.branchId ?? (branchId ? Number(branchId) : undefined);
    return this.dashboardService.getLowStockAlerts(effectiveBranchId);
  }

  @Get('sales-trend')
  async getSalesTrend(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId?: number,
  ) {
    return this.dashboardService.getSalesTrend(
      this.resolveBranchId(user, branchId),
    );
  }
}