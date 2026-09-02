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

  async create(data: any): Promise<Notification> {
    const { target_role, ...createData } = data;
    return (this.prisma.notification.create({
      data: createData,
      select: {
        id: true,
        branch_id: true,
        type: true,
        title: true,
        message: true,
        is_read: true,
        user_id: true,
        created_at: true,
        updated_at: true,
      },
    }) as unknown) as Notification;
  }

  async findAll(userId?: string): Promise<Notification[]> {
    return (this.prisma.notification.findMany({
      where: userId ? { OR: [{ user_id: Number(userId) }, { user_id: null }] } : {},
      select: {
        id: true,
        branch_id: true,
        type: true,
        title: true,
        message: true,
        is_read: true,
        user_id: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
    }) as unknown) as Notification[];
  }

  async findUnreadCount(userId?: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        is_read: false,
        ...(userId && { OR: [{ user_id: Number(userId) }, { user_id: null }] }),
      },
    });
  }

  async markAsRead(id: string | number): Promise<Notification> {
    return (this.prisma.notification.update({
      where: { id: Number(id) },
      data: { is_read: true },
      select: {
        id: true,
        branch_id: true,
        type: true,
        title: true,
        message: true,
        is_read: true,
        user_id: true,
        created_at: true,
        updated_at: true,
      },
    }) as unknown) as Notification;
  }

  async markAllAsRead(userId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.updateMany({
      where: {
        is_read: false,
        ...(userId && { OR: [{ user_id: Number(userId) }, { user_id: null }] }),
      },
      data: { is_read: true },
    });
  }

  async delete(id: string | number): Promise<Notification> {
    return (this.prisma.notification.delete({
      where: { id: Number(id) },
      select: {
        id: true,
        branch_id: true,
        type: true,
        title: true,
        message: true,
        is_read: true,
        user_id: true,
        created_at: true,
        updated_at: true,
      },
    }) as unknown) as Notification;
  }

  async deleteAll(userId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.notification.deleteMany({
      where: userId ? { OR: [{ user_id: Number(userId) }, { user_id: null }] } : {},
    });
  }
}