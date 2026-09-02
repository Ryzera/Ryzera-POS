import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from './schema/notification.schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly prisma: PrismaService,
  ) {}

  /** Create notification and emit WebSocket event for real-time updates. */
  async create(data: CreateNotificationDto) {
    const notification = await this.notificationRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,
            user_id: data.userId ?? null,
      branch_id: data.branchId ?? null,
      target_role: data.targetRole ?? null,

    });

    // WebSocket emission ensures all connected clients get instant updates
    this.notificationGateway.sendNotification('new-notification', notification);
    return notification;
  }

  async broadcast(data: CreateNotificationDto) {
    const targetUsers = await this.prisma.user.findMany({
      where: {
        ...(data.branchId ? { branch_id: data.branchId } : {}),
        ...(data.targetRole
          ? { userRoles: { some: { role: { name: data.targetRole } } } }
          : {}),
      },
      select: { id: true },
    });

    if (targetUsers.length === 0) {
      return [await this.create(data)];
    }

    const notifications = await Promise.all(
      targetUsers.map((user) => this.create({ ...data, userId: user.id })),
    );
    return notifications;
  }

  /** Get all notifications for a user. */
  async findAll(userId?: string) {
    return this.notificationRepository.findAll(userId);
  }

  /** Get count of unread notifications. */
  async findUnreadCount(userId?: string) {
    return this.notificationRepository.findUnreadCount(userId);
  }

  /** Mark single notification as read. */
  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  /** Mark all notifications as read for a user. */
  async markAllAsRead(userId?: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  /** Delete notification by ID. */
  async delete(id: string) {
    return this.notificationRepository.delete(id);
  }

  /** Delete all notifications for a user. */
  async deleteAll(userId?: string) {
    return this.notificationRepository.deleteAll(userId);
  }
}