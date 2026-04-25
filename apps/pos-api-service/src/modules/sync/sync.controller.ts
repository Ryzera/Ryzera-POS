import { Body, Controller, Get, Post, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushSyncSchema, PushSyncDto } from './schema/push-sync.schema';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guards';
// import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Offline-first sync operations.
 * Push/status are public (any authenticated user).
 * Fail/retry/success/queue require MANAGER/ADMIN (commented - waiting auth fix).
 * Conflict rules are public.
 */
@Controller('sync')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /** Push offline data for sync. Any authenticated user. @example POST /api/sync/push */
  @Post('push')
  async push(@Body() data: unknown) {
    const validated = PushSyncSchema.parse(data) as PushSyncDto;
    return this.syncService.push(validated);
  }

  /** Get sync status (pending/synced/failed counts). @example GET /api/sync/status */
  @Get('status')
  async getStatus() {
    return this.syncService.getStatus();
  }

  /** Mark record as failed. MANAGER/ADMIN only. @example POST /api/sync/fail/{id} Body: {"error":"..."} */
  @Post('fail/:id')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  fail(@Param('id', ParseUUIDPipe) id: string, @Body('error') error: string) {
    return this.syncService.fail(id, error);
  }

  /** Retry failed record. MANAGER/ADMIN only. @example POST /api/sync/retry/{id} */
  @Post('retry/:id')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncService.retry(id);
  }

  /** Mark record as successfully synced. MANAGER/ADMIN only. @example POST /api/sync/success/{id} */
  @Post('success/:id')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  success(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncService.success(id);
  }

  /** Check if queue is overloaded (>50 pending). MANAGER/ADMIN only. @example GET /api/sync/check-queue */
  @Get('check-queue')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  async checkQueue(
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.syncService.checkQueueOverload(companyId, branchId);
  }

  /** Get conflict resolution rules. Public endpoint. @example GET /api/sync/conflict-rules */
  @Get('conflict-rules')
  getConflictRules() {
    return this.syncService.getConflictRules();
  }
}