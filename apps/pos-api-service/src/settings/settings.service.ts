import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './schema/settings.schema';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create setting. */
  async create(data: CreateSettingDto) {
    const branchId = data.branchId ? Number(data.branchId) : null;
    return this.prisma.syncSetting.create({
      data: {
        key: data.key,
        value: data.value,
        scope: data.scope || (branchId ? 'BRANCH' : 'GLOBAL'),
        branch_id: branchId,
      },
    });
  }

  /** Get all settings with optional branch filter. */
  async findAll(companyId?: string, branchId?: string) {
    const where: any = {};
    if (branchId) where.branch_id = Number(branchId);
    
    return this.prisma.syncSetting.findMany({
      where,
      orderBy: { key: 'asc' },
      include: { branch: true },
    });
  }

  /** 
   * Get setting by key with hierarchy support (v2.0)
   * Step 1: Search for branch-specific override
   * Step 2: Fallback to global company-wide setting
   */
  async findByKey(key: string, companyId?: string, branchId?: string) {
    // 1. Try to find branch-specific override
    if (branchId) {
      const branchSetting = await this.prisma.syncSetting.findFirst({
        where: { key, branch_id: Number(branchId) }
      });
      if (branchSetting) return branchSetting;
    }

    // 2. Fallback to global setting (branch_id is null)
    const globalSetting = await this.prisma.syncSetting.findFirst({
      where: { key, branch_id: null }
    });
    if (!globalSetting) {
      throw new NotFoundException(`Setting with key "${key}" not found in branch or global scope`);
    }
    return globalSetting;
  }

  /** Update setting value. throws NotFoundException if missing. */
  async update(key: string, data: UpdateSettingDto, companyId?: string, branchId?: string) {
    const where: any = { key };
    if (branchId) where.branch_id = Number(branchId);
    
    const existing = await this.prisma.syncSetting.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    
    return this.prisma.syncSetting.update({
      where: { id: existing.id },
      data: { value: data.value },
    });
  }

  /** Delete setting by key. throws NotFoundException if missing. */
  async delete(key: string, companyId?: string, branchId?: string) {
    const where: any = { key };
    if (branchId) where.branch_id = Number(branchId);
    
    const existing = await this.prisma.syncSetting.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    
    return this.prisma.syncSetting.delete({ where: { id: existing.id } });
  }
}