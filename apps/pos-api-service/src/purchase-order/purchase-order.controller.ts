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
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderStatusDto,
  CreateInvoiceDto,
} from '@ryzera/pos-schema';
import {
  CreatePurchaseOrderSchema,
  UpdatePurchaseOrderStatusSchema,
  CreateInvoiceSchema,
} from '@ryzera/pos-schema';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { PurchaseOrderQueryDto } from './purchase-order-query.schema';
import { PurchaseOrderQuerySchema } from './purchase-order-query.schema';
import { PurchaseOrderService } from './purchase-order.service';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'supplierId', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'],
  })
  @ApiResponse({ status: 200, description: 'Paginated purchase order list' })
  findAll(
    @Query(new ZodValidationPipe(PurchaseOrderQuerySchema))
    query: PurchaseOrderQueryDto,
  ) {
    return this.poService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @ApiResponse({ status: 200, description: 'Purchase order detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.poService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a purchase order (DRAFT)' })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: String,
    description: 'Acting user UUID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['supplierId', 'branchId', 'items'],
      properties: {
        supplierId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        branchId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        notes: { type: 'string', example: 'Urgent restock for branch opening' },
        stockAlertId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['productId', 'quantity', 'unitCost'],
            properties: {
              productId: {
                type: 'string',
                format: 'uuid',
                example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
              },
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
    @Body(new ZodValidationPipe(CreatePurchaseOrderSchema))
    dto: CreatePurchaseOrderDto,
    @Query('userId', ParseUuidPipe) userId: string,
  ) {
    return this.poService.create(dto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status', 'userId'],
      properties: {
        status: {
          type: 'string',
          enum: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'],
          example: 'SENT',
        },
        userId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated — if RECEIVED, stock auto-restocked',
  })
  @ApiResponse({ status: 400, description: 'Invalid transition' })
  updateStatus(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(UpdatePurchaseOrderStatusSchema))
    dto: UpdatePurchaseOrderStatusDto,
  ) {
    return this.poService.updateStatus(id, dto);
  }

  @Post(':id/invoice')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invoice for a received purchase order' })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['invoiceNo', 'totalAmount'],
      properties: {
        invoiceNo: { type: 'string', example: 'INV-2026-001' },
        totalAmount: { type: 'number', example: 9000.0 },
        dueDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-05-01T00:00:00.000Z',
        },
        notes: { type: 'string', example: 'Net 30 payment terms' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  @ApiResponse({
    status: 400,
    description: 'PO not received or invoice exists',
  })
  createInvoice(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(CreateInvoiceSchema)) dto: CreateInvoiceDto,
  ) {
    return this.poService.createInvoice(id, dto);
  }

  @Patch(':id/invoice/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
  @ApiResponse({ status: 400, description: 'Already paid or cancelled' })
  markInvoicePaid(@Param('id', ParseUuidPipe) id: string) {
    return this.poService.markInvoicePaid(id);
  }
}
