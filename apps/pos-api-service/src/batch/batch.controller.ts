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
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { BatchQueryDto } from './batch-query.schema';
import { BatchQuerySchema } from './batch-query.schema';
import { BatchService } from './batch.service';

const CreateBatchSchema = z.object({
  product_id: z.number().positive(),
  batchNumber: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1),
  manufactureDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
});

const UpdateBatchSchema = z.object({
  batchNumber: z.string().trim().min(1).max(100).optional(),
  quantity: z.number().int().min(1).optional(),
  manufactureDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
});

type CreateBatchDto = z.infer<typeof CreateBatchSchema>;
type UpdateBatchDto = z.infer<typeof UpdateBatchSchema>;

@ApiTags('Batches')
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  @ApiOperation({ summary: 'List batches (paginated, filterable by expiry)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'expiringInDays', required: false, type: Number })
  @ApiQuery({ name: 'expired', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Paginated batch list' })
  findAll(
    @Query(new ZodValidationPipe(BatchQuerySchema)) query: BatchQueryDto,
  ) {
    return this.batchService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch by ID' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({ status: 200, description: 'Batch detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a batch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['product_id', 'batchNumber', 'quantity'],
      properties: {
        product_id: { type: 'number', example: 1 },
        batchNumber: { type: 'string', example: 'BATCH-001' },
        quantity: { type: 'integer', minimum: 1, example: 100 },
        manufactureDate: { type: 'string', format: 'date-time' },
        expiryDate: { type: 'string', format: 'date-time' },
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
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        batchNumber: { type: 'string', example: 'BATCH-001' },
        quantity: { type: 'integer', minimum: 1, example: 100 },
        manufactureDate: { type: 'string', format: 'date-time' },
        expiryDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 409, description: 'Batch number conflict' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateBatchSchema)) dto: UpdateBatchDto,
  ) {
    return this.batchService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a batch' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.remove(id);
  }
}
