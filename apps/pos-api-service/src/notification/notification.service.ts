import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /** Create notification and emit WebSocket event for real-time updates. */
  async create(data: CreateNotificationDto) {
    const notification = await this.notificationRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId || null,
    });

    // WebSocket emission ensures all connected clients get instant updates
    this.notificationGateway.sendNotification('new-notification', notification);
    return notification;
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