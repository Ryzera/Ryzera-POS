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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { TransferQueryDto } from './transfer-query.schema';
import { TransferQuerySchema } from './transfer-query.schema';
import { TransferService } from './transfer.service';
import {
  CreateTransferSchema,
  UpdateTransferStatusSchema,
} from '@ryzera/pos-schema';
import type {
  CreateTransferDto,
  UpdateTransferStatusDto,
} from '@ryzera/pos-schema';

@ApiTags('Transfers')
@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get()
  @ApiOperation({ summary: 'List all transfers (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sourceBranchId', required: false, type: String })
  @ApiQuery({ name: 'destinationBranchId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED'],
  })
  @ApiResponse({ status: 200, description: 'Paginated transfer list' })
  findAll(
    @Query(new ZodValidationPipe(TransferQuerySchema))
    query: TransferQueryDto,
  ) {
    return this.transferService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer by ID' })
  @ApiParam({ name: 'id', description: 'Transfer UUID' })
  @ApiResponse({ status: 200, description: 'Transfer detail' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.transferService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transfer request' })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiResponse({ status: 201, description: 'Transfer created' })
  create(
    @Body(new ZodValidationPipe(CreateTransferSchema)) dto: CreateTransferDto,
    @Query('userId', ParseUuidPipe) userId: string,
  ) {
    return this.transferService.create(dto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transfer status (SHIP / RECEIVE / CANCEL)' })
  @ApiParam({ name: 'id', description: 'Transfer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated — stock adjusted automatically',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition or insufficient stock',
  })
  updateStatus(
    @Param('id', ParseUuidPipe) id: string,
    @Body(new ZodValidationPipe(UpdateTransferStatusSchema))
    dto: UpdateTransferStatusDto,
  ) {
    return this.transferService.updateStatus(id, dto);
  }
}
