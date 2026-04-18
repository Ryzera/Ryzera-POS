import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CreateProductDto, UpdateProductDto } from '@ryzera/pos-schema';
import { CreateProductSchema, UpdateProductSchema } from '@ryzera/pos-schema';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { ProductListQueryDto } from './product-query.schema';
import { ProductListQuerySchema } from './product-query.schema';
import { ProductService } from './product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated, filterable)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'name / SKU / barcode',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
  })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'supplierId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  findAll(
    @Query(new ZodValidationPipe(ProductListQuerySchema))
    query: ProductListQueryDto,
  ) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'sku', 'price'],
      properties: {
        name: { type: 'string', example: 'Coca Cola 330ml' },
        sku: { type: 'string', example: 'CC-330' },
        barcode: { type: 'string', example: '5449000000996' },
        description: { type: 'string', example: 'Carbonated soft drink' },
        price: { type: 'number', example: 250.0 },
        costPrice: { type: 'number', example: 180.0 },
        minStock: { type: 'integer', example: 5 },
        unit: {
          type: 'string',
          enum: ['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR'],
          example: 'PCS',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
          example: 'ACTIVE',
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        supplierId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'SKU or barcode conflict' })
  create(
    @Body(new ZodValidationPipe(CreateProductSchema)) dto: CreateProductDto,
  ) {
    return this.productService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Coca Cola 330ml' },
        sku: { type: 'string', example: 'CC-330' },
        barcode: { type: 'string', example: '5449000000996' },
        description: { type: 'string', example: 'Carbonated soft drink' },
        price: { type: 'number', example: 250.0 },
        costPrice: { type: 'number', example: 180.0 },
        minStock: { type: 'integer', example: 5 },
        unit: {
          type: 'string',
          enum: ['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR'],
          example: 'PCS',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
          example: 'ACTIVE',
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        supplierId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 409, description: 'SKU or barcode conflict' })
  update(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete (discontinue) a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Discontinued' })
  @ApiResponse({ status: 400, description: 'Already discontinued' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.productService.remove(id);
  }
}
