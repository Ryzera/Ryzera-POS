import { Body, Controller, Get, Post, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushSyncSchema, PushSyncDto } from './schema/push-sync.schema';

/**
 * REST controller for offline‑first sync operations.
 * All endpoints are prefixed with /api/sync.
 */
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  async push(@Body() data: unknown) {
    const validated = PushSyncSchema.parse(data) as PushSyncDto;
    return this.syncService.push(validated);
  }

  @Get('status')
  getStatus() {
    return this.syncService.getStatus();
  }

  @Post('fail/:id')
  fail(@Param('id', ParseUUIDPipe) id: string, @Body('error') error: string) {
    return this.syncService.fail(id, error);
  }

  @Post('retry/:id')
  retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncService.retry(id);
  }

  @Post('success/:id')
  success(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncService.success(id);
  }

  @Get('check-queue')
  async checkQueue(
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string,
  ) {
    
    return this.syncService.checkQueueOverload(companyId, branchId);
  }

  @Get('conflict-rules')
  getConflictRules() {
    return this.syncService.getConflictRules();
  }
}