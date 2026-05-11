import { Controller, Post, Get, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushSyncDto } from './schema/push-sync.schema';
import { FailSyncDto } from './schema/fail-sync.schema';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('sync')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  // @Roles('CASHIER', 'MANAGER', 'ADMIN')
  async push(@Body() data: PushSyncDto) {
    return this.syncService.push(data);
  }

  @Get('status')
  // @Roles('MANAGER', 'ADMIN')
  async getStatus() {
    return this.syncService.getStatus();
  }

  @Post('fail/:id')
  // @Roles('ADMIN')
  async fail(@Param('id') id: string, @Body() body: FailSyncDto) {
    return this.syncService.fail(id, body.errorMessage);
  }

  @Post('retry/:id')
  // @Roles('ADMIN')
  async retry(@Param('id') id: string) {
    return this.syncService.retry(id);
  }

  @Post('success/:id')
  // @Roles('ADMIN')
  async success(@Param('id') id: string) {
    return this.syncService.success(id);
  }

  @Get('check-queue')
  // @Roles('MANAGER', 'ADMIN')
  async checkQueue() {
    return this.syncService.checkQueueOverload();
  }

  @Get('conflict-rules')
  async getConflictRules() {
    return this.syncService.getConflictRules();
  }

  @Get('status/:branchId')
  async getBranchStatus(@Param('branchId') branchId: string) {
    return this.syncService.getBranchStatus(branchId);
  }

  @Get('status/all')
  async getAllStatus() {
    return this.syncService.getAllStatus();
  }

  @Post('resolve-conflict')
  async resolveConflict(@Body() data: { conflictId: string; resolution: 'branch_wins' | 'server_wins' }) {
    return this.syncService.resolveConflict(data.conflictId, data.resolution);
  }

  @Delete(':id')
  // @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.syncService.delete(id);
  }

  // --- Tier B: Enterprise Batch & Operations ---

  @Post('batch-push')
  async batchPush(@Body() data: any[]) {
    return this.syncService.batchPush(data);
  }

  @Post('batch-retry')
  async batchRetry(@Body() body: { ids: string[] }) {
    return this.syncService.batchRetry(body.ids);
  }

  @Post('batch-delete')
  async batchDelete(@Body() body: { ids: string[] }) {
    return this.syncService.batchDelete(body.ids);
  }

  @Get('export/csv')
  async exportCsv() {
    return this.syncService.exportData('csv');
  }

  @Get('export/json')
  async exportJson() {
    return this.syncService.exportData('json');
  }

  @Post('import')
  async importData(@Body() data: any[]) {
    return this.syncService.importData(data);
  }

  @Post('search')
  async search(@Body() criteria: any) {
    return this.syncService.search(criteria);
  }

  // --- v2.0 Dashboard Unification ---

  @Get('conflicts')
  async listConflicts() {
    return this.syncService.getConflicts();
  }

  @Get('audit')
  async getAudit() {
    return this.syncService.getAuditLogs();
  }

  @Get('devices')
  async listDevices() {
    return this.syncService.getDevices();
  }

  @Post('devices')
  async registerDevice(@Body() data: any) {
    return this.syncService.registerDevice(data);
  }

  @Post('devices/:id/approve')
  async approveDevice(@Param('id') id: string) {
    return this.syncService.approveDevice(id);
  }

  @Get('health')
  async getHealth() {
    return this.syncService.getHealthStatus();
  }

  @Get('metrics')
  async getMetrics() {
    return this.syncService.getSyncMetrics();
  }
}

