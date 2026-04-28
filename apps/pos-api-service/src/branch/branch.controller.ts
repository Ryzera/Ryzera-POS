import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import type { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';
import { CreateBranchSchema, UpdateBranchSchema } from '@ryzera/pos-schema';

import { ParseUuidPipe } from '../common/pipes/parse-uuid.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { BranchListQueryDto } from './branch-query.schema';
import { BranchListQuerySchema } from './branch-query.schema';
import { BranchService } from './branch.service';

@ApiTags('Branches')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'List all branches (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated branch list' })
  findAll(
      @Query(new ZodValidationPipe(BranchListQuerySchema)) query: BranchListQueryDto,
  ) {
    return this.branchService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch detail' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.branchService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name:    { type: 'string', example: 'Colombo Main Branch' },
        address: { type: 'string', example: '123 Galle Rd, Colombo 03' },
        phone:   { type: 'string', example: '+94771234567' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Branch created' })
  @ApiResponse({ status: 409, description: 'Branch name already exists' })
  create(@Body(new ZodValidationPipe(CreateBranchSchema)) dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:    { type: 'string', example: 'Colombo Main Branch' },
        address: { type: 'string', example: '123 Galle Rd, Colombo 03' },
        phone:   { type: 'string', example: '+94771234567' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Branch updated' })
  @ApiResponse({ status: 400, description: 'Branch is inactive' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiResponse({ status: 409, description: 'Branch name already exists' })
  update(
      @Param('id', ParseUuidPipe) id: string,
      @Body(new ZodValidationPipe(UpdateBranchSchema)) dto: UpdateBranchDto,
  ) {
    return this.branchService.update(id, dto);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate an inactive branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch reactivated' })
  @ApiResponse({ status: 400, description: 'Branch is already active or suspended' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  reactivate(@Param('id', ParseUuidPipe) id: string) {
    return this.branchService.reactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete (deactivate) a branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch deactivated' })
  @ApiResponse({ status: 400, description: 'Branch is already inactive or suspended' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.branchService.remove(id);
  }
}