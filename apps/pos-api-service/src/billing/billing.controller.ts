import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateSaleSchema, CreateSaleDto } from './dto/create-sale.dto';
import { ProcessPaymentSchema, ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('sales')
  createSale(@Body() body: unknown) {
    const dto: CreateSaleDto = CreateSaleSchema.parse(body);
    return this.billingService.createSale(dto);
  }

  @Post('sales/payment')
  processPayment(@Body() body: unknown) {
    const dto: ProcessPaymentDto = ProcessPaymentSchema.parse(body);
    return this.billingService.processPayment(dto);
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
