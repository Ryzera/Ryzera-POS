import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dash: DashboardService) {}

  @Get('summary')
  summary(@Query('branchId') branchId?: string) {
    return this.dash.getSummary(branchId);
  }

  @Get('low-stock')
  lowStock(@Query('branchId') branchId?: string) {
    return this.dash.getLowStockProducts(branchId);
  }

  @Get('expiring-batches')
  expiring(@Query('days') days?: string) {
    return this.dash.getExpiringBatches(days ? parseInt(days) : 30);
  }
}
