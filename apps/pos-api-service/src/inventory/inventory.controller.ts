import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AdjustStockSchema } from '@ryzera/pos-schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private inv: InventoryService) {}

  @Get('stock')
  getBranchStock(@Query('branchId') branchId: string) {
    return this.inv.getBranchStock(branchId);
  }

  @Post('adjust')
  adjust(
    @Body(new ZodValidationPipe(AdjustStockSchema)) dto: any,
    @CurrentUser() user: any,
  ) {
    return this.inv.adjustStock(dto, user.sub);
  }

  @Get('logs')
  getLogs(
    @Query('branchId') branchId?: string,
    @Query('productId') productId?: string,
  ) {
    return this.inv.getLogs(branchId, productId);
  }
}
