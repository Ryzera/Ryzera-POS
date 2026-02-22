import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    try {
      return await this.prisma.systemSetting.findMany();
    } catch (error) {
      console.error('Error in getAll:', error);
      throw new InternalServerErrorException('Failed to get settings');
    }
  }

  async getByKey(key: string) {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key }
      });
      
      if (!setting) {
        throw new NotFoundException(`Setting with key '${key}' not found`);
      }
      
      return setting;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getByKey:', error);
      throw new InternalServerErrorException('Failed to get setting');
    }
  }

  async set(key: string, value: string, description?: string) {
    try {
      console.log('Creating/updating setting:', { key, value, description });
      
      if (!value) {
        throw new Error('Value is required');
      }
      
      const result = await this.prisma.systemSetting.upsert({
        where: { key },
        update: { 
          value: value,
          description: description || null
        },
        create: { 
          key, 
          value, 
          description: description || null
        }
      });
      
      console.log('Upsert result:', result);
      return result;
    } catch (error) {
      console.error('Error in set setting:', error);
      throw new InternalServerErrorException(`Failed to set setting: ${error.message}`);
    }
  }

  async delete(key: string) {
    try {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key }
      });
      
      if (!existing) {
        throw new NotFoundException(`Setting with key '${key}' not found`);
      }
      
      return await this.prisma.systemSetting.delete({
        where: { key }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in delete setting:', error);
      throw new InternalServerErrorException('Failed to delete setting');
    }
  }
}