import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Delete,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { BackupService } from './backup.service';
import { PushSyncDto } from './schema/push-sync.schema';
import { FailSyncDto } from './schema/fail-sync.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '@ryzera/pos-schema';

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly backupService: BackupService,
  ) {}

  /**
   * DESIGN RATIONALE: Cross-branch access control helper.
   * Enforces strict multi-tenant isolation by ensuring non-admin users (Managers & Cashiers)
   * cannot request or push data for branches other than their own JWT-derived branchId.
   */
  private validateBranch(user: JwtPayload, branchId?: number | string | null) {
    const isAdmin = user.roles.includes('ADMIN') || user.userType === 'ADMIN';
    if (isAdmin) return;

    if (branchId && String(user.branchId) !== String(branchId)) {
      throw new ForbiddenException(`You do not have access to branch ${branchId}`);
    }
  }

  /**
   * DESIGN RATIONALE: Data ingestion endpoint for online/offline payloads.
   * Validated via PushSyncDto to prevent corrupt or partial offline payloads
   * from entering the central database.
   */
  @Post('push')
  @Roles('CASHIER', 'MANAGER', 'ADMIN')
  async push(@Body() data: PushSyncDto, @CurrentUser() user: JwtPayload) {
    this.validateBranch(user, data.branchId);
    return this.syncService.push(data);
  }

  /**
   * DESIGN RATIONALE: Sync queue status monitoring endpoint.
   * Allows branch managers and central admins to inspect real-time sync backlog rates.
   */
  @Get('status')
  @Roles('MANAGER', 'ADMIN')
  async getStatus(@Query('branchId') branchId: string | undefined, @CurrentUser() user: JwtPayload) {
    const finalBranchId = branchId || user.branchId?.toString();
    this.validateBranch(user, finalBranchId);
    if (finalBranchId) return this.syncService.getBranchStatus(parseInt(finalBranchId, 10));
    return this.syncService.getStatus();
  }

  @Post('fail/:id')
  @Roles('ADMIN')
  async fail(@Param('id', ParseIntPipe) id: number, @Body() body: FailSyncDto) {
    return this.syncService.fail(id, body.errorMessage);
  }

  @Post('retry/:id')
  @Roles('ADMIN')
  async retry(@Param('id', ParseIntPipe) id: number) {
    return this.syncService.retry(id);
  }

  @Post('success/:id')
  @Roles('ADMIN')
  async success(@Param('id', ParseIntPipe) id: number) {
    return this.syncService.success(id);
  }

  @Get('check-queue')
  @Roles('MANAGER', 'ADMIN')
  async checkQueue(@Query('branchId') branchId: string | undefined, @CurrentUser() user: JwtPayload) {
    const finalBranchId = branchId || user.branchId?.toString();
    this.validateBranch(user, finalBranchId);
    return this.syncService.checkQueueOverload(finalBranchId ? parseInt(finalBranchId, 10) : undefined);
  }

  @Get('conflict-rules')
  @Roles('ADMIN')
  async getConflictRules() {
    return this.syncService.getConflictRules();
  }

  @Get('status/all')
  @Roles('ADMIN')
  async getAllStatus() {
    return this.syncService.getAllStatus();
  }

  @Get('status/:branchId')
  @Roles('MANAGER', 'ADMIN')
  async getBranchStatus(@Param('branchId', ParseIntPipe) branchId: number, @CurrentUser() user: JwtPayload) {
    this.validateBranch(user, branchId);
    return this.syncService.getBranchStatus(branchId);
  }

  @Post('resolve-conflict')
  @Roles('ADMIN', 'MANAGER')
  async resolveConflict(
    @Body()
    data: {
      conflictId: number;
      resolution: 'branch_wins' | 'server_wins' | 'manual_merge';
      mergedData?: any;
    },
  ) {
    return this.syncService.resolveConflict(data.conflictId, data.resolution, data.mergedData);
  }

  @Delete('prune')
  @Roles('ADMIN')
  async pruneOldLogs() {
    return this.syncService.pruneOldLogs();
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.syncService.delete(id);
  }

  // --- Tier B: Enterprise Batch & Operations ---

  @Post('batch-push')
  @Roles('MANAGER', 'ADMIN')
  async batchPush(@Body() data: any[]) {
    return this.syncService.batchPush(data);
  }

  @Post('batch-retry')
  @Roles('ADMIN')
  async batchRetry(@Body() body: { ids: number[] }) {
    return this.syncService.batchRetry(body.ids);
  }

  @Post('batch-delete')
  @Roles('ADMIN')
  async batchDelete(@Body() body: { ids: number[] }) {
    return this.syncService.batchDelete(body.ids);
  }

  @Get('export/csv')
  @Roles('ADMIN')
  async exportCsv() {
    return this.syncService.exportData('csv');
  }

  @Get('export/json')
  @Roles('ADMIN')
  async exportJson() {
    return this.syncService.exportData('json');
  }

  @Post('import')
  @Roles('ADMIN')
  async importData(@Body() data: any[]) {
    return this.syncService.importData(data);
  }

  @Post('search')
  @Roles('ADMIN')
  async search(@Body() criteria: any) {
    return this.syncService.search(criteria);
  }



  // --- v2.0 Dashboard Unification ---

  @Get('conflicts')
  @Roles('ADMIN', 'MANAGER')
  async listConflicts(@Query('branchId') branchId?: string) {
    return this.syncService.getConflicts(branchId ? parseInt(branchId, 10) : undefined);
  }

  @Get('audit')
  @Roles('ADMIN')
  async getAudit(@Query('branchId') branchId?: string) {
    return this.syncService.getAuditLogs(branchId ? { branch_id: parseInt(branchId, 10) } : {});
  }

  @Post('audit/seed')
  @Roles('ADMIN')
  async seedAudit() {
    return this.syncService.seedAuditLogs();
  }

  @Post('seed-logs')
  @Roles('ADMIN')
  async seedLogs() {
    return this.syncService.seedSyncLogs();
  }

  // --- Real Enterprise DR / Backup ---
  @Post('backup/snapshot')
  @Roles('ADMIN')
  async createSnapshot() {
    return this.backupService.createSnapshot();
  }

  @Post('backup/drill')
  @Roles('ADMIN')
  async runDrill() {
    return this.backupService.runDrDrill();
  }

  @Post('network/offline')
  @Roles('ADMIN')
  async simulateOffline() {
    return this.syncService.setNetworkState(false);
  }

  @Post('network/online')
  @Roles('ADMIN')
  async simulateOnline() {
    return this.syncService.setNetworkState(true);
  }

  @Post('test/sale')
  @Roles('ADMIN')
  async createTestSale() {
    return this.syncService.push({
      entity: 'sales',
      payload: { id: Date.now(), item: 'Test Product', amount: 1500, date: new Date().toISOString() },
      branchId: 1
    });
  }

  @Get('devices')
  @Roles('ADMIN', 'MANAGER')
  async listDevices(@Query('branchId') branchId?: string) {
    return this.syncService.getDevices(branchId ? parseInt(branchId, 10) : undefined);
  }

  @Post('devices')
  @Roles('CASHIER', 'MANAGER', 'ADMIN')
  async registerDevice(@Body() data: any) {
    return this.syncService.registerDevice(data);
  }

  @Post('devices/:id/approve')
  @Roles('ADMIN')
  async approveDevice(@Param('id', ParseIntPipe) id: number) {
    return this.syncService.approveDevice(id);
  }

  @Get('health')
  @Roles('MANAGER', 'ADMIN')
  async getHealth(@Query('branchId') branchId: string | undefined, @CurrentUser() user: JwtPayload) {
    const finalBranchId = branchId || user.branchId?.toString();
    this.validateBranch(user, finalBranchId);
    return this.syncService.getHealthStatus(finalBranchId ? parseInt(finalBranchId, 10) : undefined);
  }

  @Get('metrics')
  @Roles('MANAGER', 'ADMIN')
  async getMetrics(
    @Query('branchId') branchId: string | undefined,
    @Query('days') days: string | undefined,
    @CurrentUser() user: JwtPayload
  ) {
    const finalBranchId = branchId || user.branchId?.toString();
    this.validateBranch(user, finalBranchId);
    const bId = finalBranchId ? parseInt(finalBranchId, 10) : undefined;
    const d = days ? parseInt(days, 10) : 1;
    return this.syncService.getSyncMetrics(bId, d);
  }

  // --- Settings ---
  @Get('settings')
  @Roles('ADMIN')
  async getSettings(@Query('branchId') branchId?: string) {
    return this.syncService.getSettings(branchId ? parseInt(branchId, 10) : undefined);
  }

  @Post('settings')
  @Roles('ADMIN')
  async saveSettings(
    @Body() data: any[],
    @Query('branchId') branchId?: string
  ) {
    return this.syncService.saveSettings(data, branchId ? parseInt(branchId, 10) : undefined);
  }

  // --- Delta Sync ---
  @Get('delta')
  @Roles('CASHIER', 'MANAGER', 'ADMIN')
  async getDelta(
    @Query('since') since: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() user?: JwtPayload
  ) {
    if (user) {
      this.validateBranch(user, branchId);
    }
    const sinceDate = since ? new Date(since) : new Date(0);
    return this.syncService.getDeltaUpdates(sinceDate, branchId ? parseInt(branchId, 10) : undefined);
  }
}
