import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async getStatus() {
    try {
      const pending = await this.prisma.syncLog.count({ where: { status: 'PENDING' } });
      const synced = await this.prisma.syncLog.count({ where: { status: 'SYNCED' } });
      const failed = await this.prisma.syncLog.count({ where: { status: 'FAILED' } });

      return { 
        pending, 
        synced, 
        failed,
        total: pending + synced + failed
      };
    } catch (error) {
      console.error('Error in getStatus:', error);
      return { 
        statusCode: 500,
        message: 'Internal server error' 
      };
    }
  }

  async push(data: any) {
    try {
      return await this.prisma.syncLog.create({
        data: {
          entity: data.entity,
          status: 'PENDING',
          payload: data.payload || {},
        },
      });
    } catch (error) {
      console.error('Error in push:', error);
      return { 
        statusCode: 500,
        message: `Failed to push data: ${error.message}` 
      };
    }
  }

  async pull(lastSyncTime: Date) {
    try {
      return await this.prisma.syncLog.findMany({
        where: {
          createdAt: { gt: lastSyncTime },
          status: 'SYNCED',
        },
      });
    } catch (error) {
      console.error('Error in pull:', error);
      return { 
        statusCode: 500,
        message: `Failed to pull data: ${error.message}` 
      };
    }
  }

  async retry(id: string) {
    try {
      // First check if the record exists
      const existing = await this.prisma.syncLog.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return { 
          statusCode: 404,
          message: `Sync log with id '${id}' not found` 
        };
      }
      
      // Update the record
      return await this.prisma.syncLog.update({
        where: { id },
        data: { 
          status: 'PENDING',
          attempts: {
            increment: 1
          }
        },
      });
    } catch (error) {
      console.error('Error in retry:', error);
      return { 
        statusCode: 500,
        message: `Failed to retry sync: ${error.message}` 
      };
    }
  }

  async markAsSynced(id: string) {
    try {
      return await this.prisma.syncLog.update({
        where: { id },
        data: { 
          status: 'SYNCED',
          syncedAt: new Date()
        },
      });
    } catch (error) {
      console.error('Error in markAsSynced:', error);
      return { 
        statusCode: 500,
        message: `Failed to mark as synced: ${error.message}` 
      };
    }
  }

  async markAsFailed(id: string, error: string) {
    try {
      return await this.prisma.syncLog.update({
        where: { id },
        data: { 
          status: 'FAILED',
          error: error
        },
      });
    } catch (error) {
      console.error('Error in markAsFailed:', error);
      return { 
        statusCode: 500,
        message: `Failed to mark as failed: ${error.message}` 
      };
    }
  }
}