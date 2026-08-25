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
  CreateTransferDto,
  UpdateTransferStatusDto,
} from '@ryzera/pos-schema';
import {
  CreateTransferSchema,
  UpdateTransferStatusSchema,
} from '@ryzera/pos-schema';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  BranchScope,
  BranchScopeResult,
} from '../auth/decorators/branch-scope.decorator';
import type { TransferQueryDto } from './transfer-query.schema';
import { TransferQuerySchema } from './transfer-query.schema';
import { TransferService } from './transfer.service';

@ApiTags('Transfers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get()
  @ApiOperation({ summary: 'List all transfers (paginated) — non-admin restricted to their own branch' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sourceBranchId', required: false, type: Number })
  @ApiQuery({ name: 'destinationBranchId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED'],
  })
  @ApiResponse({ status: 200, description: 'Paginated transfer list' })
  findAll(
      @Query(new ZodValidationPipe(TransferQuerySchema)) query: TransferQueryDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    // Non-admin: ignore any branch filters they pass and force to their own branch
    // (as either source or destination).
    const scopedQuery = scope.branchId
        ? {
          ...query,
          sourceBranchId: undefined,
          destinationBranchId: undefined,
          ownBranchId: scope.branchId,
        }
        : query;
    return this.transferService.findAll(scopedQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer by ID' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiResponse({ status: 200, description: 'Transfer detail' })
  @ApiResponse({ status: 403, description: 'Forbidden — not your branch' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(
      @Param('id', ParseIntPipe) id: number,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const transfer = await this.transferService.findOne(id);
    this.assertBranchAccess(
        scope,
        transfer.sourceBranch_id,
        transfer.destinationBranch_id,
    );
    return transfer;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transfer request' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sourceBranchId', 'destinationBranchId', 'items'],
      properties: {
        sourceBranchId: { type: 'number', example: 1 },
        destinationBranchId: { type: 'number', example: 2 },
        notes: { type: 'string', example: 'Weekly stock redistribution' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['productId', 'quantity'],
            properties: {
              productId: { type: 'number', example: 10 },
              quantity: { type: 'integer', minimum: 1, example: 20 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Transfer created' })
  create(
      @Body(new ZodValidationPipe(CreateTransferSchema)) dto: CreateTransferDto,
      @Query('userId', ParseIntPipe) userId: number,
      @BranchScope() scope: BranchScopeResult,
  ) {
    // Non-admin must be initiating from (or receiving into) their own branch.
    this.assertBranchAccess(scope, dto.sourceBranchId, dto.destinationBranchId);
    return this.transferService.create(dto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transfer status (SHIP / RECEIVE / CANCEL)' })
  @ApiParam({ name: 'id', description: 'Transfer ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status', 'userId'],
      properties: {
        status: {
          type: 'string',
          enum: ['SHIPPED', 'RECEIVED', 'CANCELLED'],
          example: 'SHIPPED',
        },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated — stock adjusted automatically',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition or insufficient stock',
  })
  async updateStatus(
      @Param('id', ParseIntPipe) id: number,
      @Body(new ZodValidationPipe(UpdateTransferStatusSchema))
      dto: UpdateTransferStatusDto,
      @BranchScope() scope: BranchScopeResult,
  ) {
    const transfer = await this.transferService.findOne(id);
    this.assertBranchAccess(
        scope,
        transfer.sourceBranch_id,
        transfer.destinationBranch_id,
    );
    return this.transferService.updateStatus(id, dto);
  }

  // Non-admin must be either the source or destination branch of the transfer.
  private assertBranchAccess(
      scope: BranchScopeResult,
      sourceBranchId: number,
      destinationBranchId: number,
  ) {
    if (
        scope.branchId &&
        scope.branchId !== sourceBranchId &&
        scope.branchId !== destinationBranchId
    ) {
      throw new ForbiddenException(
          'You cannot access transfers outside your branch',
      );
    }
  }
}