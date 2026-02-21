import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Body() data: any) {
    return this.suppliersService.createSupplier(data);
  }

  @Get()
  findAll() {
    return this.suppliersService.getAllSuppliers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.getSupplierById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.suppliersService.updateSupplier(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.deleteSupplier(id);
  }
}
