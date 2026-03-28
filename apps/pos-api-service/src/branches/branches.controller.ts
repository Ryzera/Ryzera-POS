import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() data: any) {
    return this.branchesService.createBranch(data);
  }

  @Get()
  findAll() {
    return this.branchesService.getAllBranches();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.getBranchById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.branchesService.updateBranch(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.deleteBranch(id);
  }
}
