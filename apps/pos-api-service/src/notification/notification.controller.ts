import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@ryzera/pos-schema';
import { NotificationService } from './notification.service';
import { CreateNotificationSchema, CreateNotificationDto } from './schema/notification.schema';

/**
 * Real-time notification system.
 * WebSocket events are emitted on create/update.
 
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** Create notification. Triggers WebSocket event. @example {"title":"Test","message":"Hello","type":"INFO"} */
  @Post()
  @Roles('ADMIN')
  async create(@Body() data: unknown) {
    const validated = CreateNotificationSchema.parse(data) as CreateNotificationDto;
    return this.notificationService.create(validated);
  }

  /** Get all notifications. @example GET /api/notifications */
  @Get()
  @Roles('MANAGER', 'ADMIN')
  findAll(@Query('userId') userId: string | undefined, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles.includes('ADMIN') || user.userType === 'ADMIN';
    return this.notificationService.findAll(isAdmin ? userId : String(user.userId));
  }

  /** Get unread notification count. @example GET /api/notifications/unread/count */
  @Get('unread/count')
  @Roles('MANAGER', 'ADMIN')
  getUnreadCount(@Query('userId') userId: string | undefined, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles.includes('ADMIN') || user.userType === 'ADMIN';
    return this.notificationService.findUnreadCount(isAdmin ? userId : String(user.userId));
  }

  /** Mark single notification as read. @example PATCH /api/notifications/{id}/read */
  @Patch(':id/read')
  @Roles('MANAGER', 'ADMIN')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  /** Mark all notifications as read. @example PATCH /api/notifications/read/all */
  @Patch('read/all')
  @Roles('MANAGER', 'ADMIN')
  markAllAsRead(@Query('userId') userId: string | undefined, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles.includes('ADMIN') || user.userType === 'ADMIN';
    return this.notificationService.markAllAsRead(isAdmin ? userId : String(user.userId));
  }

  /** Delete notification by ID. @example DELETE /api/notifications/{id} */
  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }

  /** Delete all notifications. @example DELETE /api/notifications */
  @Delete()
  @Roles('ADMIN')
  deleteAll(@Query('userId') userId: string | undefined, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.roles.includes('ADMIN') || user.userType === 'ADMIN';
    return this.notificationService.deleteAll(isAdmin ? userId : String(user.userId));
  }

  /** Admin broadcast endpoint - sends notification to all users. @example POST /api/notifications/broadcast */
  @Post('broadcast')
  @Roles('ADMIN')
  async broadcast(@Body() body: { title: string; message: string; type?: string; targetBranch?: string; targetRole?: string }) {
    const allowedTypes = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
    const notificationType = body.type && allowedTypes.includes(body.type.toUpperCase()) 
      ? body.type.toUpperCase() as 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
      : 'INFO';
    
    return this.notificationService.broadcast({
      title: body.title,
      message: body.message,
      type: notificationType,
      userId: undefined,
      branchId: body.targetBranch && body.targetBranch !== 'ALL'
        ? Number(body.targetBranch)
        : null,
      targetRole: body.targetRole && body.targetRole !== 'ALL' ? body.targetRole : undefined,
    });
  }
}