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
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  BranchScope,
  BranchScopeResult,
} from '../auth/decorators/branch-scope.decorator';
import type { PurchaseOrderQueryDto } from './purchase-order-query.schema';
import { PurchaseOrderQuerySchema } from './purchase-order-query.schema';
import { PurchaseOrderService } from './purchase-order.service';

const CreatePurchaseOrderSchema = z.object({
  supplierId: z.number().int().positive(),
  branchId: z.number().int().positive(),
  notes: z.string().trim().max(500).optional(),
  stockAlertId: z.number().int().positive().optional(),
  items: z
      .array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().min(1),
            unitCost: z.number().positive(),
          }),
      )
      .min(1),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED']),
  userId: z.number().int().positive(),
});

const CreateInvoiceSchema = z.object({
  invoiceNo: z.string().trim().min(1).max(50),
  totalAmount: z.number().positive(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().trim().max(500).optional(),
});

type CreatePODto = z.infer<typeof CreatePurchaseOrderSchema>;
type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders (paginated) — non-admin restricted to their own branch' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'],
  })
  @ApiResponse({ status: 200, description: 'Paginated purchase order list' })
  findAll(
      @Query(new ZodValidationPipe(PurchaseOrderQuerySchema))
      query: PurchaseOrderQueryDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const scopedQuery = scope.branchId
        ? { ...query, branchId: scope.branchId }
        : query;
    return this.poService.findAll(scopedQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiParam({ name: 'id', description: 'Purchase Order ID' })
  @ApiResponse({ status: 200, description: 'Purchase order detail' })
  @ApiResponse({ status: 403, description: 'Forbidden — not your branch' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(
      @Param('id', ParseIntPipe) id: number,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const po = await this.poService.findOne(id);
    this.assertBranchAccess(scope, po.branch_id);
    return po;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a purchase order (DRAFT)' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['supplierId', 'branchId', 'items'],
      properties: {
        supplierId: { type: 'number', example: 1 },
        branchId: { type: 'number', example: 1 },
        notes: { type: 'string', example: 'Urgent restock' },
        stockAlertId: { type: 'number', example: 1 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['productId', 'quantity', 'unitCost'],
            properties: {
              productId: { type: 'number', example: 1 },
              quantity: { type: 'integer', minimum: 1, example: 50 },
              unitCost: { type: 'number', example: 180.0 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Created' })
  create(
      @Body(new ZodValidationPipe(CreatePurchaseOrderSchema)) dto: CreatePODto,
      @Query('userId', ParseIntPipe) userId: number,
      @BranchScope() scope: BranchScopeResult,
  ) {
    this.assertBranchAccess(scope, dto.branchId);
    return this.poService.create(dto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiParam({ name: 'id', description: 'Purchase Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status', 'userId'],
      properties: {
        status: {
          type: 'string',
          enum: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'],
        },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid transition' })
  async updateStatus(
      @Param('id', ParseIntPipe) id: number,
      @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const po = await this.poService.findOne(id);
    this.assertBranchAccess(scope, po.branch_id);
    return this.poService.updateStatus(id, dto);
  }

  @Post(':id/invoice')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invoice for a received purchase order' })
  @ApiParam({ name: 'id', description: 'Purchase Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['invoiceNo', 'totalAmount'],
      properties: {
        invoiceNo: { type: 'string', example: 'INV-2026-001' },
        totalAmount: { type: 'number', example: 9000.0 },
        dueDate: { type: 'string', format: 'date-time' },
        notes: { type: 'string', example: 'Net 30 payment terms' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  @ApiResponse({
    status: 400,
    description: 'PO not received or invoice exists',
  })
  async createInvoice(
      @Param('id', ParseIntPipe) id: number,
      @Body(new ZodValidationPipe(CreateInvoiceSchema)) dto: CreateInvoiceDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const po = await this.poService.findOne(id);
    this.assertBranchAccess(scope, po.branch_id);
    return this.poService.createInvoice(id, dto);
  }

  @Patch(':id/invoice/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiParam({ name: 'id', description: 'Purchase Order ID' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
  @ApiResponse({ status: 400, description: 'Already paid or cancelled' })
  async markInvoicePaid(
      @Param('id', ParseIntPipe) id: number,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const po = await this.poService.findOne(id);
    this.assertBranchAccess(scope, po.branch_id);
    return this.poService.markInvoicePaid(id);
  }

  private assertBranchAccess(scope: BranchScopeResult, branchId: number) {
    if (scope.branchId && scope.branchId !== branchId) {
      throw new ForbiddenException(
          "You cannot access another branch's purchase orders",
      );
    }
  }
}