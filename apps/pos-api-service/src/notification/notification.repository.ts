import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INotificationRepository } from './notification.repository.interface';
import { Notification, Prisma } from '@ryzera/pos-database';

/**
 * Stores and retrieves notification records using Prisma ORM.
 * All database queries are centralised here so that the service layer
 * never needs to know which database or ORM we use.
 * This repository pattern enables future expansion (e.g., Redis, Elasticsearch).
 */
@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async findAll(userId?: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: userId ? { user_id: Number(userId) } : {},
      orderBy: { created_at: 'desc' },
    });
  }

  async findUnreadCount(userId?: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        is_read: false,
        ...(userId && { user_id: Number(userId) }),
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.updateMany({
      where: {
        is_read: false,
        ...(userId && { user_id: Number(userId) }),
      },
      data: { is_read: true },
    });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({ where: { id } });
  }

  async deleteAll(userId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.deleteMany({
      where: userId ? { user_id: Number(userId) } : {},
    });
  }
}