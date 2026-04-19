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
import type { CreateBatchDto, UpdateBatchDto } from '@ryzera/pos-schema';
import { CreateBatchSchema, UpdateBatchSchema } from '@ryzera/pos-schema';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { BatchQueryDto } from './batch-query.schema';
import { BatchQuerySchema } from './batch-query.schema';
import { BatchService } from './batch.service';

@ApiTags('Batches')
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  @ApiOperation({ summary: 'List batches (paginated, filterable by expiry)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({
    name: 'expiringInDays',
    required: false,
    type: Number,
    description: 'Batches expiring within N days',
  })
  @ApiQuery({
    name: 'expired',
    required: false,
    type: Boolean,
    description: 'Show only expired batches',
  })
  @ApiResponse({ status: 200, description: 'Paginated batch list' })
  findAll(
    @Query(new ZodValidationPipe(BatchQuerySchema)) query: BatchQueryDto,
  ) {
    return this.batchService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch by ID' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Batch detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.batchService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a batch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productId', 'batchNumber', 'quantity'],
      properties: {
        productId: {
          type: 'string',
          format: 'uuid',
          example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        batchNumber: { type: 'string', example: 'BATCH-001' },
        quantity: { type: 'integer', minimum: 1, example: 100 },
        manufactureDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-01T00:00:00.000Z',
        },
        expiryDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'Batch number conflict' })
  create(@Body(new ZodValidationPipe(CreateBatchSchema)) dto: CreateBatchDto) {
    return this.batchService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a batch' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        batchNumber: { type: 'string', example: 'BATCH-001' },
        quantity: { type: 'integer', minimum: 1, example: 100 },
        manufactureDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-01-01T00:00:00.000Z',
        },
        expiryDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 409, description: 'Batch number conflict' })
  update(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(UpdateBatchSchema)) dto: UpdateBatchDto,
  ) {
    return this.batchService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a batch' })
  @ApiParam({ name: 'id', description: 'Batch UUID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.batchService.remove(id);
  }
}
