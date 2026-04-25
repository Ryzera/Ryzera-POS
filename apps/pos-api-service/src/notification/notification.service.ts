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

  async create(data: CreateNotificationDto) {
    const notification = await this.notificationRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId || null,
    });

    // Emit real-time event to all connected clients
    this.notificationGateway.sendNotification('new-notification', notification);
    
    return notification;
  }

  async findAll(userId?: string) {
    return this.notificationRepository.findAll(userId);
  }

  async findUnreadCount(userId?: string) {
    return this.notificationRepository.findUnreadCount(userId);
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId?: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async delete(id: string) {
    return this.notificationRepository.delete(id);
  }

  async deleteAll(userId?: string) {
    return this.notificationRepository.deleteAll(userId);
  }
}