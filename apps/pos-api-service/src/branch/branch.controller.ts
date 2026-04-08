import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Controller('branches')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Get()
    getAll() { return this.branchService.getAllBranches(); }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) { return this.branchService.getBranchById(id); }

    @Post()
    create(@Body() dto: CreateBranchDto) { return this.branchService.createBranch(dto); }

    @Post(':id/deactivate')
    deactivate(@Param('id', ParseIntPipe) id: number) { return this.branchService.deactivateBranch(id); }
}