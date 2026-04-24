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
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Paginated branch list' })
    findAll(
        @Query(new ZodValidationPipe(BranchListQuerySchema))
        query: BranchListQueryDto,
    ) {
        return this.branchService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single branch by ID' })
    @ApiParam({ name: 'id', description: 'Branch UUID' })
    @ApiResponse({ status: 200, description: 'Branch detail' })
    @ApiResponse({ status: 400, description: 'Invalid UUID' })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    findOne(@Param('id', ParseUuidPipe) id: string) {
        return this.branchService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new branch' })
    @ApiResponse({ status: 201, description: 'Branch created' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 409, description: 'Branch name already exists' })
    create(
        @Body(new ZodValidationPipe(CreateBranchSchema)) dto: CreateBranchDto,
    ) {
        return this.branchService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a branch' })
    @ApiParam({ name: 'id', description: 'Branch UUID' })
    @ApiResponse({ status: 200, description: 'Branch updated' })
    @ApiResponse({ status: 400, description: 'Validation error or invalid UUID' })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    @ApiResponse({ status: 409, description: 'Branch name already exists' })
    update(
        @Param('id', ParseUuidPipe) id: string,
        @Body(new ZodValidationPipe(UpdateBranchSchema)) dto: UpdateBranchDto,
    ) {
        return this.branchService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft-delete (deactivate) a branch' })
    @ApiParam({ name: 'id', description: 'Branch UUID' })
    @ApiResponse({ status: 200, description: 'Branch deactivated' })
    @ApiResponse({
        status: 400,
        description: 'Invalid UUID or business rule violation',
    })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    remove(@Param('id', ParseUuidPipe) id: string) {
        return this.branchService.remove(id);
    }
}