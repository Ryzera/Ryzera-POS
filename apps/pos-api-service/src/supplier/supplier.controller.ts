import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateSupplierSchema, UpdateSupplierSchema } from '@ryzera/pos-schema';

@Controller('suppliers')
export class SupplierController {
  constructor(private supplier: SupplierService) {}

  @Get() findAll(@Query('active') active?: string) {
    return this.supplier.findAll(active === 'true');
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.supplier.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateSupplierSchema)) dto: any) {
    return this.supplier.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSupplierSchema)) dto: any,
  ) {
    return this.supplier.update(id, dto);
  }

  @Delete(':id') deactivate(@Param('id') id: string) {
    return this.supplier.deactivate(id);
  }
}
