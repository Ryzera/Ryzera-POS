import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { BranchService } from './branch.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

// Separating the Schemas (values) from the DTOs (types)
import {
  CreateBranchSchema,
  UpdateBranchSchema,
} from '@ryzera/pos-schema';
import type { CreateBranchDto, UpdateBranchDto } from '@ryzera/pos-schema';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  findAll() {
    return this.branchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Post()
  create(
      @Body(new ZodValidationPipe(CreateBranchSchema)) dto: CreateBranchDto,
  ) {
    return this.branchService.create(dto);
  }

  @Put(':id')
  update(
      @Param('id') id: string,
      @Body(new ZodValidationPipe(UpdateBranchSchema)) dto: UpdateBranchDto,
  ) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}