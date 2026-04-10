import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  providers: [ProductService, CategoryService],
  controllers: [ProductController, CategoryController],
  exports: [ProductService],
})
export class ProductModule {}
