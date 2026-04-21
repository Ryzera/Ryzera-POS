import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateSaleSchema, CreateSaleDto } from './schema/create-sale.schema';
import { ProcessPaymentSchema, ProcessPaymentDto } from './schema/process-payment.schema';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('sales')
  createSale(@Body() body: unknown) {
    const result = CreateSaleSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    return this.billingService.createSale(result.data);
  }

  @Post('sales/payment')
  processPayment(@Body() body: unknown) {
    const result = ProcessPaymentSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    return this.billingService.processPayment(result.data);
  }

  @Patch('sales/:id/cancel')
  cancelSale(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.cancelSale(id);
  }

  @Get('sales/:id')
  getSaleById(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.getSaleById(id);
  }

  @Get('sales')
  getAllSales(@Query('branch_id') branch_id?: string) {
    return this.billingService.getAllSales(branch_id);
  }
}