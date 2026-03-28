import { Controller, Get, Post, Param, Patch, UseGuards } from '@nestjs/common';
import { StockAlertsService } from './stock-alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stock-alerts')
export class StockAlertsController {
  constructor(private readonly stockAlertsService: StockAlertsService) {}

  @Get()
  findAll() {
    return this.stockAlertsService.getAllAlerts();
  }

  @Get('branch/:branchId')
  findByBranch(@Param('branchId') branchId: string) {
    return this.stockAlertsService.getAlertsByBranch(branchId);
  }

  @Get('branch/:branchId/pending')
  getPending(@Param('branchId') branchId: string) {
    return this.stockAlertsService.getPendingAlerts(branchId);
  }

  @Patch(':id/seen')
  markSeen(@Param('id') id: string) {
    return this.stockAlertsService.markAsSeen(id);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.stockAlertsService.resolveAlert(id);
  }
}
