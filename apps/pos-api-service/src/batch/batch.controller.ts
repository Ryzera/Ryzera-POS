import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { BatchService } from './batch.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateBatchSchema, UpdateBatchSchema } from '@ryzera/pos-schema';

@Controller('batches')
export class BatchController {
  constructor(private batch: BatchService) {}

  @Get()
  findAll(
    @Query('productId') productId?: string,
    @Query('expiringSoonDays') days?: string,
  ) {
    return this.batch.findAll(productId, days ? parseInt(days) : undefined);
  }

  @Get(':id') findOne(@Param('id') id: string) {
    return this.batch.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateBatchSchema)) dto: any) {
    return this.batch.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateBatchSchema)) dto: any,
  ) {
    return this.batch.update(id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.batch.remove(id);
  }
}
