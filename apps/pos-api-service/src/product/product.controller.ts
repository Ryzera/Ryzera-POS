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
import { ProductService } from './product.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateProductSchema, UpdateProductSchema } from '@ryzera/pos-schema';

@Controller('products')
export class ProductController {
  constructor(private product: ProductService) {}

  @Get() findAll(@Query('status') status?: string) {
    return this.product.findAll(status);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.product.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateProductSchema)) dto: any) {
    return this.product.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) dto: any,
  ) {
    return this.product.update(id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.product.remove(id);
  }
}
