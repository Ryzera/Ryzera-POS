import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateInvoiceSchema,
  UpdateInvoiceStatusSchema,
} from '@ryzera/pos-schema';

@Controller('invoices')
export class InvoiceController {
  constructor(private inv: InvoiceService) {}

  @Get() findAll(@Query('status') status?: string) {
    return this.inv.findAll(status);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.inv.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateInvoiceSchema)) dto: any) {
    return this.inv.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateInvoiceStatusSchema)) dto: any,
  ) {
    return this.inv.updateStatus(id, dto);
  }
}
