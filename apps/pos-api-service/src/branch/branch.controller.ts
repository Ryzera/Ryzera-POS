import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateBranchSchema, UpdateBranchSchema } from '@ryzera/pos-schema';

@Controller('branches')
export class BranchController {
  constructor(private branch: BranchService) {}

  @Get() findAll() {
    return this.branch.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.branch.findOne(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateBranchSchema))
  create(@Body() dto: any) {
    return this.branch.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateBranchSchema)) dto: any,
  ) {
    return this.branch.update(id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.branch.remove(id);
  }
}
