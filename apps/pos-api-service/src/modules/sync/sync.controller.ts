import { Body, Controller, Get, Post, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushSyncSchema, PushSyncDto } from './schema/push-sync.schema';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guards';
// import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('sync')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  async push(@Body() data: unknown) {
    const validated = PushSyncSchema.parse(data) as PushSyncDto;
    return this.syncService.push(validated);
  }

  @Get('status')
  async getStatus() {
    return this.syncService.getStatus();
  }

  @Post('fail/:id')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  fail(@Param('id', ParseUUIDPipe) id: string, @Body('error') error: string) {
    return this.syncService.fail(id, error);
  }

  @Post('retry/:id')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncService.retry(id);
  }

  @Post('success/:id')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
  success(@Param('id', ParseUUIDPipe) id: string) {
    return this.syncService.success(id);
  }

  @Get('check-queue')
  // @UseGuards(RolesGuard)
  // @Roles('MANAGER', 'ADMIN')
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