import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreatePurchaseOrderSchema,
  UpdatePurchaseOrderStatusSchema,
} from '@ryzera/pos-schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('purchase-orders')
export class PurchaseController {
  constructor(private po: PurchaseService) {}

  @Get() findAll(@Query('branchId') branchId?: string) {
    return this.po.findAll(branchId);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.po.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreatePurchaseOrderSchema)) dto: any,
    @CurrentUser() user: any,
  ) {
    return this.po.create(dto, user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePurchaseOrderStatusSchema)) dto: any,
    @CurrentUser() user: any,
  ) {
    return this.po.updateStatus(id, dto, user.sub);
  }
}
