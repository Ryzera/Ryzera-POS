import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) {}

    // Get all unread notifications for a user/branch
    async getUnread(branchId?: number) {
        return this.prisma.notification.findMany({
            where: {
                is_read: false,
                ...(branchId ? { branch_id: branchId } : {}),
            },
            orderBy: { created_at: 'desc' },
            take: 20,
        });
    }

    // Mark a notification as read
    async markRead(notificationId: number) {
        return this.prisma.notification.update({
            where: { notification_id: notificationId },
            data: { is_read: true },
        });
    }

    // Mark all notifications as read for a branch
    async markAllRead(branchId?: number) {
        return this.prisma.notification.updateMany({
            where: {
                is_read: false,
                ...(branchId ? { branch_id: branchId } : {}),
            },
            data: { is_read: true },
        });
    }

    // Get unread count only (for the bell badge)
    async getUnreadCount(branchId?: number) {
        const count = await this.prisma.notification.count({
            where: {
                is_read: false,
                ...(branchId ? { branch_id: branchId } : {}),
            },
        });
        return { count };
    }
}