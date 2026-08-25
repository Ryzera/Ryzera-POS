import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import type {
  AdjustStockDto,
  AssignProductToBranchDto,
} from '@ryzera/pos-schema';
import {
  AdjustStockSchema,
  AssignProductToBranchSchema,
} from '@ryzera/pos-schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  BranchScope,
  BranchScopeResult,
} from '../auth/decorators/branch-scope.decorator';
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

// Action types a CASHIER is permitted to submit via adjustStock.
// MANAGER / INVENTORY_MANAGER are not restricted by this list.
const CASHIER_ALLOWED_ACTIONS = [
  'SALE',
  'RETURN_FROM_CUSTOMER',
  'WASTE_DAMAGED',
];

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('branch-products')
  @Roles('MANAGER', 'INVENTORY_MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'List all branch-product stock levels' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated branch-product list' })
  findAllBranchProducts(
      @Query(new ZodValidationPipe(BranchProductQuerySchema))
      query: BranchProductQueryDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const scopedQuery = scope.branchId
        ? { ...query, branchId: scope.branchId }
        : query;
    return this.inventoryService.findAllBranchProducts(scopedQuery);
  }

  @Get('branch-products/:branchId/:productId')
  @Roles('MANAGER', 'INVENTORY_MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Get stock level for a product in a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Branch product detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findBranchProduct(
      @Param('branchId', ParseIntPipe) branchId: number,
      @Param('productId', ParseIntPipe) productId: number,
      @BranchScope() scope: BranchScopeResult,
  ) {
    this.assertBranchAccess(scope, branchId);
    return this.inventoryService.findBranchProduct(branchId, productId);
  }

  @Post('branch-products')
  @Roles('INVENTORY_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a product to a branch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productId', 'branchId'],
      properties: {
        productId: { type: 'number', example: 1 },
        branchId: { type: 'number', example: 1 },
        stockQty: { type: 'integer', minimum: 0, example: 0 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Assigned' })
  @ApiResponse({ status: 409, description: 'Already assigned' })
  assignProductToBranch(
      @Body(new ZodValidationPipe(AssignProductToBranchSchema))
      dto: AssignProductToBranchDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    this.assertBranchAccess(scope, dto.branchId);
    return this.inventoryService.assignProductToBranch(dto);
  }

  @Patch('branch-products/:branchId/:productId/adjust')
  @Roles('MANAGER', 'INVENTORY_MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Adjust stock for a product in a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
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
  @ApiResponse({ status: 403, description: 'Cashier not allowed to use this action type' })
  adjustStock(
      @Param('branchId', ParseIntPipe) branchId: number,
      @Param('productId', ParseIntPipe) productId: number,
      @Query('userId', ParseIntPipe) userId: number,
      @Body(new ZodValidationPipe(AdjustStockSchema)) dto: AdjustStockDto,
      @BranchScope() scope: BranchScopeResult,
      @CurrentUser() user: any,
  ) {
    this.assertBranchAccess(scope, branchId);
    this.assertActionAllowed(user, dto.action);
    return this.inventoryService.adjustStock(branchId, productId, userId, dto);
  }

  @Get('logs')
  @Roles('MANAGER', 'INVENTORY_MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'List inventory audit logs' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated logs' })
  findAllLogs(
      @Query(new ZodValidationPipe(InventoryLogQuerySchema))
      query: InventoryLogQueryDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const scopedQuery = scope.branchId
        ? { ...query, branchId: scope.branchId }
        : query;
    return this.inventoryService.findAllLogs(scopedQuery);
  }

  @Get('alerts')
  @Roles('MANAGER', 'INVENTORY_MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'List stock alerts' })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
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
      @BranchScope() scope: BranchScopeResult,
  ) {
    const scopedQuery = scope.branchId
        ? { ...query, branchId: scope.branchId }
        : query;
    return this.inventoryService.findAllAlerts(scopedQuery);
  }

  @Patch('alerts/:id/seen')
  @Roles('MANAGER', 'INVENTORY_MANAGER')
  @ApiOperation({ summary: 'Mark alert as seen' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Marked as seen' })
  markAlertSeen(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.markAlertSeen(id);
  }

  @Patch('alerts/:id/resolve')
  @Roles('MANAGER', 'INVENTORY_MANAGER')
  @ApiOperation({ summary: 'Resolve a stock alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Resolved' })
  resolveAlert(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.resolveAlert(id);
  }

  // Blocks a MANAGER/INVENTORY_MANAGER from touching another branch's data.
  // scope.branchId is undefined for ADMIN, so this is skipped for them.
  private assertBranchAccess(scope: BranchScopeResult, branchId: number) {
    if (scope.branchId && scope.branchId !== branchId) {
      throw new ForbiddenException('You cannot access another branch\'s inventory');
    }
  }

  // Cashiers may only submit SALE, RETURN_FROM_CUSTOMER, or WASTE_DAMAGED
  // via adjustStock. MANAGER / INVENTORY_MANAGER are unrestricted.
  private assertActionAllowed(user: any, action: string) {
    const roles: string[] = user?.roles ?? [];
    const isCashierOnly =
        roles.includes('CASHIER') &&
        !roles.includes('MANAGER') &&
        !roles.includes('INVENTORY_MANAGER') &&
        !roles.includes('ADMIN');

    if (isCashierOnly && !CASHIER_ALLOWED_ACTIONS.includes(action)) {
      throw new ForbiddenException(
          `Cashiers can only use these action types: ${CASHIER_ALLOWED_ACTIONS.join(', ')}`,
      );
    }
  }
}
