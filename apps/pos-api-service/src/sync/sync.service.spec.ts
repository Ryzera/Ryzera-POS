import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SyncService', () => {
  let service: SyncService;
  let prisma: PrismaService;

  const mockPrismaService = {
    syncLog: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: '1', entity: 'test', status: 'PENDING' }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: '1', status: 'SYNCED' }),
    },
    systemSetting: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ key: 'test', value: 'test' }),
      delete: jest.fn().mockResolvedValue({ key: 'test' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return sync status counts', async () => {
      const result = await service.getStatus();
      expect(result).toEqual({ pending: 0, synced: 0, failed: 0, total: 0 });
      expect(prisma.syncLog.count).toHaveBeenCalledTimes(3);
    });
  });

  describe('push', () => {
    it('should create a new sync log entry', async () => {
      const data = { entity: 'product', payload: { id: '123', name: 'Test' } };
      const result = await service.push(data);
      expect(result).toEqual({ id: '1', entity: 'test', status: 'PENDING' });
      expect(prisma.syncLog.create).toHaveBeenCalledWith({
        data: {
          entity: 'product',
          status: 'PENDING',
          payload: { id: '123', name: 'Test' },
        },
      });
    });
  });

  describe('retry', () => {
    it('should update sync log status to PENDING and increment attempts', async () => {
      const id = '123';
      await service.retry(id);
      expect(prisma.syncLog.update).toHaveBeenCalledWith({
        where: { id },
        data: { status: 'PENDING', attempts: { increment: 1 } },
      });
    });
  });

  describe('markAsSynced', () => {
    it('should update sync log status to SYNCED and set syncedAt', async () => {
      const id = '123';
      await service.markAsSynced(id);
      expect(prisma.syncLog.update).toHaveBeenCalledWith({
        where: { id },
        data: { status: 'SYNCED', syncedAt: expect.any(Date) },
      });
    });
  });

  describe('markAsFailed', () => {
    it('should update sync log status to FAILED and set error message', async () => {
      const id = '123';
      const error = 'Something went wrong';
      await service.markAsFailed(id, error);
      expect(prisma.syncLog.update).toHaveBeenCalledWith({
        where: { id },
        data: { status: 'FAILED', error: error },
      });
    });
  });
});