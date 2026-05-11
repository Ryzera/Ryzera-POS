import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationSchema, CreateNotificationDto } from './schema/notification.schema';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guards';
// import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Real-time notification system.
 * WebSocket events are emitted on create/update.
 * Auth guards temporarily disabled - waiting for auth module fix.
 */
@Controller('notifications')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** Create notification. Triggers WebSocket event. @example {"title":"Test","message":"Hello","type":"INFO"} */
  @Post()
  // @Roles('ADMIN')
  async create(@Body() data: unknown) {
    const validated = CreateNotificationSchema.parse(data) as CreateNotificationDto;
    return this.notificationService.create(validated);
  }

  /** Get all notifications. @example GET /api/notifications */
  @Get()
  // @Roles('MANAGER', 'ADMIN')
  findAll(@Query('userId') userId?: string) {
    return this.notificationService.findAll(userId);
  }

  /** Get unread notification count. @example GET /api/notifications/unread/count */
  @Get('unread/count')
  // @Roles('MANAGER', 'ADMIN')
  getUnreadCount(@Query('userId') userId?: string) {
    return this.notificationService.findUnreadCount(userId);
  }

  /** Mark single notification as read. @example PATCH /api/notifications/{id}/read */
  @Patch(':id/read')
  // @Roles('MANAGER', 'ADMIN')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  /** Mark all notifications as read. @example PATCH /api/notifications/read/all */
  @Patch('read/all')
  // @Roles('MANAGER', 'ADMIN')
  markAllAsRead(@Query('userId') userId?: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  /** Delete notification by ID. @example DELETE /api/notifications/{id} */
  @Delete(':id')
  // @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }

  /** Delete all notifications. @example DELETE /api/notifications */
  @Delete()
  // @Roles('ADMIN')
  deleteAll(@Query('userId') userId?: string) {
    return this.notificationService.deleteAll(userId);
  }

  /** Admin broadcast endpoint - sends notification to all users. @example POST /api/notifications/broadcast */
  @Post('broadcast')
  // @Roles('ADMIN')
  async broadcast(@Body() body: { title: string; message: string; type?: string }) {
    const allowedTypes = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
    const notificationType = body.type && allowedTypes.includes(body.type.toUpperCase()) 
      ? body.type.toUpperCase() as 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
      : 'INFO';
    
    return this.notificationService.create({
      title: body.title,
      message: body.message,
      type: notificationType,
      userId: null,
    });
  }
}