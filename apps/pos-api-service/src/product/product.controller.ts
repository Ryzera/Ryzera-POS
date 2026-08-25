import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { ProductListQueryDto } from './product-query.schema';
import { ProductListQuerySchema } from './product-query.schema';
import { ProductService } from './product.service';

const CreateProductSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  description: z.string().trim().optional(),
  price: z.number().min(0),
  cost_price: z.number().min(0).optional(),
  quantity: z.number().int().min(0).default(0),
  min_quantity: z.number().int().min(0).default(0),
  unit: z.enum(['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR']).default('PCS'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
  company_id: z.number().positive(),
  branch_id: z.number().positive().optional(),
  category_id: z.number().positive().optional(),
  supplier_id: z.number().positive().optional(),
});

const UpdateProductSchema = CreateProductSchema.omit({
  company_id: true,
}).partial();

type CreateProductDto = z.infer<typeof CreateProductSchema>;
type UpdateProductDto = z.infer<typeof UpdateProductSchema>;

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated, filterable)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
  })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated product list' })
  findAll(
      @Query(new ZodValidationPipe(ProductListQuerySchema))
      query: ProductListQueryDto,
  ) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'code', 'price', 'company_id'],
      properties: {
        name: { type: 'string', example: 'Coca Cola 330ml' },
        code: { type: 'string', example: 'CC-330' },
        sku: { type: 'string', example: 'CC-330-SKU' },
        barcode: { type: 'string', example: '5449000000996' },
        description: { type: 'string', example: 'Carbonated soft drink' },
        price: { type: 'number', example: 250.0 },
        cost_price: { type: 'number', example: 180.0 },
        min_quantity: { type: 'integer', example: 5 },
        unit: {
          type: 'string',
          enum: ['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR'],
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
        },
        company_id: { type: 'number', example: 1 },
        branch_id: { type: 'number', example: 1 },
        category_id: { type: 'number', example: 1 },
        supplier_id: { type: 'number', example: 1 },
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
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Coca Cola 330ml' },
        code: { type: 'string', example: 'CC-330' },
        sku: { type: 'string', example: 'CC-330-SKU' },
        barcode: { type: 'string', example: '5449000000996' },
        description: { type: 'string', example: 'Carbonated soft drink' },
        price: { type: 'number', example: 250.0 },
        cost_price: { type: 'number', example: 180.0 },
        min_quantity: { type: 'integer', example: 5 },
        unit: {
          type: 'string',
          enum: ['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR'],
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
        },
        category_id: { type: 'number', example: 1 },
        supplier_id: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 409, description: 'SKU or barcode conflict' })
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body(new ZodValidationPipe(UpdateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete (discontinue) a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Discontinued' })
  @ApiResponse({ status: 400, description: 'Already discontinued' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}