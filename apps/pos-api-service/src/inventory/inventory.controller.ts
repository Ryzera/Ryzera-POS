import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import type {
  AdjustStockDto,
  AssignProductToBranchDto,
} from '@ryzera/pos-schema';
import {
  AdjustStockSchema,
  AssignProductToBranchSchema,
} from '@ryzera/pos-schema';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type {
  BranchProductQueryDto,
  InventoryLogQueryDto,
  StockAlertQueryDto,
} from './inventory-query.schema';
import {
  BranchProductQuerySchema,
  InventoryLogQuerySchema,
  StockAlertQuerySchema,
} from './inventory-query.schema';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('branch-products')
  @ApiOperation({ summary: 'List all branch-product stock levels' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated branch-product list' })
  findAllBranchProducts(
    @Query(new ZodValidationPipe(BranchProductQuerySchema))
    query: BranchProductQueryDto,
  ) {
    return this.inventoryService.findAllBranchProducts(query);
  }

  @Get('branch-products/:branchId/:productId')
  @ApiOperation({ summary: 'Get stock level for a product in a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Branch product detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findBranchProduct(
    @Param('branchId', ParseUuidPipe) branchId: string,
    @Param('productId', ParseUuidPipe) productId: string,
  ) {
    return this.inventoryService.findBranchProduct(branchId, productId);
  }

  @Post('branch-products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a product to a branch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productId', 'branchId'],
      properties: {
        productId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        branchId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        stockQty: { type: 'integer', minimum: 0, example: 0 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Assigned' })
  @ApiResponse({ status: 409, description: 'Already assigned' })
  assignProductToBranch(
    @Body(new ZodValidationPipe(AssignProductToBranchSchema))
    dto: AssignProductToBranchDto,
  ) {
    return this.inventoryService.assignProductToBranch(dto);
  }

  @Patch('branch-products/:branchId/:productId/adjust')
  @ApiOperation({ summary: 'Adjust stock for a product in a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: String,
    description: 'Acting user UUID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['changeQty', 'action'],
      properties: {
        changeQty: { type: 'integer', example: -5 },
        action: {
          type: 'string',
          enum: [
            'CREATE',
            'UPDATE',
            'SALE',
            'RESTOCK',
            'DELETE',
            'TRANSFER',
            'ADJUSTMENT',
            'STOCK_TAKE',
            'RETURN_FROM_CUSTOMER',
            'RETURN_TO_SUPPLIER',
            'WASTE_DAMAGED',
          ],
          example: 'ADJUSTMENT',
        },
        description: {
          type: 'string',
          example: 'Manual correction after stock-take',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Stock adjusted' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  adjustStock(
    @Param('branchId', ParseUuidPipe) branchId: string,
    @Param('productId', ParseUuidPipe) productId: string,
    @Query('userId', ParseUuidPipe) userId: string,
    @Body(new ZodValidationPipe(AdjustStockSchema)) dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(branchId, productId, userId, dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'List inventory audit logs' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated logs' })
  findAllLogs(
    @Query(new ZodValidationPipe(InventoryLogQuerySchema))
    query: InventoryLogQueryDto,
  ) {
    return this.inventoryService.findAllLogs(query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'List stock alerts' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'SEEN', 'RESOLVED'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated alerts' })
  findAllAlerts(
    @Query(new ZodValidationPipe(StockAlertQuerySchema))
    query: StockAlertQueryDto,
  ) {
    return this.inventoryService.findAllAlerts(query);
  }

  @Patch('alerts/:id/seen')
  @ApiOperation({ summary: 'Mark alert as seen' })
  @ApiParam({ name: 'id', description: 'Alert UUID' })
  @ApiResponse({ status: 200, description: 'Marked as seen' })
  markAlertSeen(@Param('id', ParseUuidPipe) id: string) {
    return this.inventoryService.markAlertSeen(id);
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve a stock alert' })
  @ApiParam({ name: 'id', description: 'Alert UUID' })
  @ApiResponse({ status: 200, description: 'Resolved' })
  resolveAlert(@Param('id', ParseUuidPipe) id: string) {
    return this.inventoryService.resolveAlert(id);
  }
}
