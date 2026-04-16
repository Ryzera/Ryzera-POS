import { Injectable, NotFoundException } from '@nestjs/common';
import { PushSyncDto } from './schema/push-sync.schema';
import { SyncRepository } from './repository/sync.repository';
import { EmailService } from '../../email/email.service';
import { SyncStatus } from '@prisma/client';

/**
 * Implements the offline‑first sync logic.
 * Data is saved locally first (PENDING), then later synced to the cloud.
 * Failures are tracked, retried, and email alerts are sent to the admin.
 */
@Injectable()
export class SyncService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly emailService: EmailService,
  ) {}

  async push(data: PushSyncDto) {
    return this.syncRepository.create({
      companyId: data.companyId ?? null,
      branchId: data.branchId ?? null,
      entity: data.entity,
      payload: data.payload,
      status: SyncStatus.PENDING,
      error: null,
      attempts: 0,
    });
  }

  async getStatus() {
    const pending = await this.syncRepository.countByStatus(SyncStatus.PENDING);
    const synced = await this.syncRepository.countByStatus(SyncStatus.SYNCED);
    const failed = await this.syncRepository.countByStatus(SyncStatus.FAILED);
    return { pending, synced, failed, total: pending + synced + failed };
  }

  async fail(id: string, errorMessage: string) {
    const record = await this.syncRepository.findById(id);
    if (!record) throw new NotFoundException(`SyncLog with id ${id} not found`);
    const updated = await this.syncRepository.updateStatus(id, SyncStatus.FAILED, errorMessage, undefined, true);
    await this.emailService.sendSyncFailureAlert(
      updated.id,
      updated.entity,
      errorMessage,
      updated.attempts,
      record.branchId,
      record.companyId,
      'fail',
    );
    if (updated.attempts >= 3) {
      await this.emailService.sendManualInterventionAlert(
        updated.id,
        updated.entity,
        errorMessage,
        updated.attempts,
        record.branchId,
        record.companyId,
        'fail',
      );
    }
    return updated;
  }

  async retry(id: string) {
    const record = await this.syncRepository.findById(id);
    if (!record) throw new NotFoundException(`SyncLog with id ${id} not found`);
    if (record.status !== SyncStatus.FAILED)
      throw new NotFoundException(`Only FAILED records can be retried`);
    return this.syncRepository.updateStatus(id, SyncStatus.PENDING, null, undefined, true);
  }

  async success(id: string) {
    const record = await this.syncRepository.findById(id);
    if (!record) throw new NotFoundException(`SyncLog with id ${id} not found`);
    return this.syncRepository.updateStatus(id, SyncStatus.SYNCED, null, new Date(), false);
  }

  async checkQueueOverload(companyId?: string, branchId?: string) {
    const threshold = 50; // fixed – not overrideable
    const pendingCount = await this.syncRepository.countByStatus(SyncStatus.PENDING);
    if (pendingCount >= threshold) {
      await this.emailService.sendQueueOverloadAlert(pendingCount, threshold);
    }
    return {
      companyId: companyId ?? null,
      branchId: branchId ?? null,
      pendingCount,
      threshold,
      overloaded: pendingCount >= threshold,
    };
  }

  getConflictRules() {
    return {
      duplicatePending: 'Same pending payload in same branch/company/entity is skipped',
      alreadySyncedRetry: 'Already synced records cannot be retried',
      latestProcessingWins: 'If record is already synced, further processing is skipped',
      failedRecords: 'Failed records remain available for retry/manual intervention',
    };
  }
}