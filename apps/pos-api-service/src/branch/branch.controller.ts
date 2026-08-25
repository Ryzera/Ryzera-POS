import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
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
import type { BranchListQueryDto } from './branch-query.schema';
import { BranchListQuerySchema } from './branch-query.schema';
import { BranchService } from './branch.service';

const CreateBranchSchema = z.object({
    name: z.string().trim().min(1),
    code: z.string().trim().min(2).max(20),
    company_id: z.number().positive(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().email().optional(),
    city: z.string().trim().optional(),
    manager_name: z.string().trim().optional(),
});

const UpdateBranchSchema = CreateBranchSchema.omit({ company_id: true })
    .partial()
    .extend({
        is_active: z.boolean().optional(),
    });

type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('branches')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Get()
    @ApiOperation({ summary: 'List all branches (paginated) — ADMIN sees all, others see only their own branch' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Paginated branch list' })
    async findAll(
        @Query(new ZodValidationPipe(BranchListQuerySchema))
        query: BranchListQueryDto,
        @BranchScope() scope: BranchScopeResult,
    ) {
        if (scope.branchId) {
            const branch = await this.branchService.findOne(scope.branchId);
            return { items: [branch], total: 1, page: 1, limit: 1 };
        }
        return this.branchService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single branch by ID' })
    @ApiParam({ name: 'id', description: 'Branch ID' })
    @ApiResponse({ status: 200, description: 'Branch detail' })
    @ApiResponse({ status: 403, description: 'Forbidden — not your branch' })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
    ) {
        this.assertBranchAccess(scope, id);
        return this.branchService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new branch — ADMIN only' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'code', 'company_id'],
            properties: {
                name: { type: 'string', example: 'Colombo Main Branch' },
                code: { type: 'string', example: 'CMB-01' },
                company_id: { type: 'number', example: 1 },
                address: { type: 'string', example: '123 Galle Rd' },
                phone: { type: 'string', example: '+94771234567' },
                email: { type: 'string', example: 'colombo@ryzera.lk' },
                city: { type: 'string', example: 'Colombo' },
                manager_name: { type: 'string', example: 'Kamal Perera' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Branch created' })
    @ApiResponse({ status: 409, description: 'Branch code already exists' })
    create(
        @Body(new ZodValidationPipe(CreateBranchSchema)) dto: CreateBranchDto,
        @BranchScope() scope: BranchScopeResult,
    ) {
        this.assertAdmin(scope);
        return this.branchService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a branch — ADMIN only' })
    @ApiParam({ name: 'id', description: 'Branch ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Colombo Main Branch' },
                code: { type: 'string', example: 'CMB-01' },
                address: { type: 'string', example: '123 Galle Rd' },
                phone: { type: 'string', example: '+94771234567' },
                email: { type: 'string', example: 'colombo@ryzera.lk' },
                city: { type: 'string', example: 'Colombo' },
                manager_name: { type: 'string', example: 'Kamal Perera' },
                is_active: { type: 'boolean', example: true },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Branch updated' })
    @ApiResponse({ status: 400, description: 'Branch is inactive' })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ZodValidationPipe(UpdateBranchSchema)) dto: UpdateBranchDto,
        @BranchScope() scope: BranchScopeResult,
    ) {
        this.assertAdmin(scope);
        return this.branchService.update(id, dto);
    }

    @Patch(':id/reactivate')
    @ApiOperation({ summary: 'Reactivate an inactive branch — ADMIN only' })
    @ApiParam({ name: 'id', description: 'Branch ID' })
    @ApiResponse({ status: 200, description: 'Branch reactivated' })
    @ApiResponse({ status: 400, description: 'Branch is already active' })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    reactivate(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
    ) {
        this.assertAdmin(scope);
        return this.branchService.reactivate(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Soft-delete (deactivate) a branch — ADMIN only' })
    @ApiParam({ name: 'id', description: 'Branch ID' })
    @ApiResponse({ status: 200, description: 'Branch deactivated' })
    @ApiResponse({ status: 400, description: 'Branch is already inactive' })
    @ApiResponse({ status: 404, description: 'Branch not found' })
    remove(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
    ) {
        this.assertAdmin(scope);
        return this.branchService.remove(id);
    }

    private assertBranchAccess(scope: BranchScopeResult, branchId: number) {
        if (scope.branchId && scope.branchId !== branchId) {
            throw new ForbiddenException('You cannot access another branch');
        }
    }

    private assertAdmin(scope: BranchScopeResult) {
        if (scope.branchId) {
            throw new ForbiddenException('Only ADMIN can manage branches');
        }
    }
}