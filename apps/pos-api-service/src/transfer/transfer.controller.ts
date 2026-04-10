import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateTransferSchema,
  UpdateTransferStatusSchema,
} from '@ryzera/pos-schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('transfers')
export class TransferController {
  constructor(private transfer: TransferService) {}

  @Get() findAll(@Query('branchId') branchId?: string) {
    return this.transfer.findAll(branchId);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.transfer.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTransferSchema)) dto: any,
    @CurrentUser() user: any,
  ) {
    return this.transfer.create(dto, user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTransferStatusSchema)) dto: any,
    @CurrentUser() user: any,
  ) {
    return this.transfer.updateStatus(id, dto, user.sub);
  }
}
