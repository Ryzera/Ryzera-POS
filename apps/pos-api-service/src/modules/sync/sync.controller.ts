import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushSyncDto } from './dto/push-sync.dto';

/**
 * REST controller for the sync module.
 * Base route: /api/sync
 */
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('test')
  getTest() {
    return this.syncService.getTest();
  }

  @Post('push')
  push(@Body() data: PushSyncDto) {
    return this.syncService.push(data);
  }

  @Get('status')
  getStatus() {
    return this.syncService.getStatus();
  }

  @Post('fail/:id')
  fail(@Param('id') id: string, @Body('error') error: string) {
    return this.syncService.fail(id, error);
  }

  @Post('retry/:id')
  retry(@Param('id') id: string) {
    return this.syncService.retry(id);
  }

  @Post('success/:id')
  success(@Param('id') id: string) {
    return this.syncService.success(id);
  }
}