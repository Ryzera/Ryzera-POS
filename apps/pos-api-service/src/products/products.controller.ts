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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  create(@Body() data: any) {
    return this.productService.createProduct(data);
  }

  @Get()
  findAll() {
    return this.productService.getAllProducts();
  }

  @Get('low-stock')
  lowStock() {
    return this.productService.getLowStockProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productService.updateProduct(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
