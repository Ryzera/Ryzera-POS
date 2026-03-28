import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll() {
    return this.invoicesService.getAllInvoices();
  }

  @Get('branch/:branchId')
  findByBranch(@Param('branchId') branchId: string) {
    return this.invoicesService.getInvoicesByBranch(branchId);
  }

  @Get('order/:purchaseOrderId')
  findByOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.invoicesService.getInvoiceByOrderId(purchaseOrderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.getInvoiceById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() data: { status: string; paidAt?: string },
  ) {
    return this.invoicesService.updateInvoiceStatus(
      id,
      data.status,
      data.paidAt,
    );
  }
}
