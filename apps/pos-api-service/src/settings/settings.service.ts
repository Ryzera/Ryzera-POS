import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './schema/settings.schema';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create setting. Auto-creates default company if none exists. */
  async create(data: CreateSettingDto) {
    // Create default company if not exists (ensures settings have a parent context)
    let companyId = data.companyId;
    
    if (!companyId) {
      const defaultCompany = await this.prisma.syncCompany.findFirst({
        where: { code: 'DEFAULT' }
      });
      
      if (defaultCompany) {
        companyId = defaultCompany.id;
      } else {
        const newCompany = await this.prisma.syncCompany.create({
          data: {
            name: 'Default Company',
            code: 'DEFAULT',
            isActive: true,
          }
        });
        companyId = newCompany.id;
      }
    }

    return this.prisma.syncSetting.create({
      data: {
        key: data.key,
        value: data.value,
        description: data.description || null,
        scope: data.scope,
        company: { connect: { id: companyId } },
        ...(data.branchId && { branch: { connect: { id: data.branchId } } })
      },
    });
  }

  /** Get all settings with optional company/branch filters. */
  async findAll(companyId?: string, branchId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
    return this.prisma.syncSetting.findMany({
      where,
      orderBy: { key: 'asc' },
      include: { company: true, branch: true },
    });
  }

  /** Get setting by key. throws NotFoundException if missing. */
  async findByKey(key: string, companyId?: string, branchId?: string) {
    const where: any = { key };
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
    const setting = await this.prisma.syncSetting.findFirst({ where });
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return setting;
  }

  /** Update setting value. throws NotFoundException if missing. */
  async update(key: string, data: UpdateSettingDto, companyId?: string, branchId?: string) {
    const where: any = { key };
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
    const existing = await this.prisma.syncSetting.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    
    return this.prisma.syncSetting.update({
      where: { id: existing.id },
      data: { value: data.value, description: data.description || null },
    });
  }

  /** Delete setting by key. throws NotFoundException if missing. */
  async delete(key: string, companyId?: string, branchId?: string) {
    const where: any = { key };
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
    const existing = await this.prisma.syncSetting.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    
    return this.prisma.syncSetting.delete({ where: { id: existing.id } });
  }
}