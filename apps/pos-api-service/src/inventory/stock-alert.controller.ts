import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { StockAlertService } from './stock-alert.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ResolveAlertSchema } from '@ryzera/pos-schema';

@Controller('stock-alerts')
export class StockAlertController {
  constructor(private alerts: StockAlertService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.alerts.findAll(status, branchId);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ResolveAlertSchema)) dto: any,
  ) {
    return this.alerts.resolve(id, dto);
  }
}
