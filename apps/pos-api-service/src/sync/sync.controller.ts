import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushDto } from './dto/push.dto';
import { RetryDto } from './dto/retry.dto';

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Get('status')
  async getStatus() {
    return this.syncService.getStatus();
  }

  @Post('push')
  async pushData(@Body() data: PushDto) {
    return this.syncService.push(data);
  }

  @Post('pull')
  async pullData(@Body('lastSync') lastSync: Date) {
    return this.syncService.pull(lastSync);
  }

  @Post('retry/:id')
  async retry(@Param('id') id: string) {
    return this.syncService.retry(id);
  }

  @Post('success/:id')
  async markAsSynced(@Param('id') id: string) {
    return this.syncService.markAsSynced(id);
  }

  @Post('fail/:id')
  async markAsFailed(@Param('id') id: string, @Body('error') error: string) {
    return this.syncService.markAsFailed(id, error);
  }
}