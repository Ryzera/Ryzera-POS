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
import type { CreateSupplierDto, UpdateSupplierDto } from '@ryzera/pos-schema';
import { CreateSupplierSchema, UpdateSupplierSchema } from '@ryzera/pos-schema';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { SupplierListQueryDto } from './supplier-query.schema';
import { SupplierListQuerySchema } from './supplier-query.schema';
import { SupplierService } from './supplier.service';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'List all suppliers (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Paginated supplier list' })
  findAll(
    @Query(new ZodValidationPipe(SupplierListQuerySchema))
    query: SupplierListQueryDto,
  ) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier UUID' })
  @ApiResponse({ status: 200, description: 'Supplier detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.supplierService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a supplier' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Ceylon Beverages Ltd' },
        contactName: { type: 'string', example: 'Kamal Perera' },
        email: { type: 'string', example: 'kamal@ceylonbev.lk' },
        phone: { type: 'string', example: '+94112345678' },
        address: { type: 'string', example: '45 Industrial Zone, Colombo' },
        leadTimeDays: { type: 'integer', example: 3 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'Name conflict' })
  create(
    @Body(new ZodValidationPipe(CreateSupplierSchema)) dto: CreateSupplierDto,
  ) {
    return this.supplierService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Ceylon Beverages Ltd' },
        contactName: { type: 'string', example: 'Kamal Perera' },
        email: { type: 'string', example: 'kamal@ceylonbev.lk' },
        phone: { type: 'string', example: '+94112345678' },
        address: { type: 'string', example: '45 Industrial Zone, Colombo' },
        leadTimeDays: { type: 'integer', example: 3 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Inactive supplier' })
  @ApiResponse({ status: 409, description: 'Name conflict' })
  update(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(UpdateSupplierSchema)) dto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete (deactivate) a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier UUID' })
  @ApiResponse({ status: 200, description: 'Deactivated' })
  @ApiResponse({ status: 400, description: 'Already inactive or has products' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.supplierService.remove(id);
  }
}
