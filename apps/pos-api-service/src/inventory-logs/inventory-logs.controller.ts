import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryLogsService } from './inventory-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory-logs')
export class InventoryLogsController {
  constructor(private readonly inventoryLogsService: InventoryLogsService) {}

  @Post()
  create(@Body() data: any) {
    return this.inventoryLogsService.createLog(data);
  }

  @Get()
  findAll() {
    return this.inventoryLogsService.getAllLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryLogsService.getLogById(id);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryLogsService.getLogsByProduct(productId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.inventoryLogsService.getLogsByUser(userId);
  }
}
