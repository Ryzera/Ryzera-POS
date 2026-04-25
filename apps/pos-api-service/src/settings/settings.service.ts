import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './schema/settings.schema';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSettingDto) {
    // Create a default company if companyId not provided
    let companyId = data.companyId;
    
    if (!companyId) {
      // Check if default company exists
      const defaultCompany = await this.prisma.syncCompany.findFirst({
        where: { code: 'DEFAULT' }
      });
      
      if (defaultCompany) {
        companyId = defaultCompany.id;
      } else {
        // Create default company
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
        company: {
          connect: { id: companyId }
        },
        ...(data.branchId && {
          branch: {
            connect: { id: data.branchId }
          }
        })
      },
    });
  }

  async findAll(companyId?: string, branchId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    
    return this.prisma.syncSetting.findMany({
      where,
      orderBy: { key: 'asc' },
      include: {
        company: true,
        branch: true,
      },
    });
  }

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