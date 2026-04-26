import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INotificationRepository } from './notification.repository.interface';
import { Notification, Prisma } from '@prisma/client';

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
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnreadCount(userId?: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        isRead: false,
        ...(userId && { userId }),
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.updateMany({
      where: {
        isRead: false,
        ...(userId && { userId }),
      },
      data: { isRead: true },
    });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({ where: { id } });
  }

  async deleteAll(userId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.deleteMany({
      where: userId ? { userId } : {},
    });
  }
}