import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BranchService }      from './branch.service';
import { ZodValidationPipe }  from '../common/pipes/zod-validation.pipe';
import { CreateBranchSchema } from './schemas/create-branch.schema';
import type { CreateBranchDto } from './schemas/create-branch.schema';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Get()
    getAll() {
        return this.branchService.getAllBranches();
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.branchService.getBranchById(id);
    }

    @Post()
    create(@Body(new ZodValidationPipe(CreateBranchSchema)) dto: CreateBranchDto) {
        return this.branchService.createBranch(dto);
    }

    @Post(':id/deactivate')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.branchService.deactivateBranch(id);
    }
}