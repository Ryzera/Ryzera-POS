import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';          // ← add this import
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard }   from '../common/guards/roles.guard';
import { BranchGuard }  from '../common/guards/branch.guard';
import { Roles }        from '../common/decorators/roles.decorator';
import { CurrentUser }  from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth()                                           // ← add this decorator
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('kpi')
    getKpiCards(@CurrentUser() user: JwtPayload) {
        const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId ?? undefined;
        return this.dashboardService.getKpiCards(branchId);
    }

    @Get('live-sales')
    async getLiveSales(@Query('branchId') branchId?: number) {
        return this.dashboardService.getLiveSales(branchId);
    }

    @Get('low-stock-alerts')
    async getLowStockAlerts(@Query('branchId') branchId?: number) {
        return this.dashboardService.getLowStockAlerts(branchId);
    }

    @Get('sales-trend')
    async getSalesTrend(@Query('branchId') branchId?: number) {
        return this.dashboardService.getSalesTrend(branchId);
    }
}