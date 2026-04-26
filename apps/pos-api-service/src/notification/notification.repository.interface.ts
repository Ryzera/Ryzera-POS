
import { Notification, Prisma } from '@prisma/client';

/**
 * Defines the contract for notification database operations.
 * Separating the interface allows us to switch implementations without changing business logic.
 * This is useful for future expansion (e.g., switching to Redis, different database).
 */
export interface INotificationRepository {
  create(data: Prisma.NotificationCreateInput): Promise<Notification>;
  findAll(userId?: string): Promise<Notification[]>;
  findUnreadCount(userId?: string): Promise<number>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId?: string): Promise<Prisma.BatchPayload>;
  delete(id: string): Promise<Notification>;
  deleteAll(userId?: string): Promise<Prisma.BatchPayload>;
}