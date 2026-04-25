import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationSchema, CreateNotificationDto } from './schema/notification.schema';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guards';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  // @Roles('ADMIN')
  async create(@Body() data: unknown) {
    const validated = CreateNotificationSchema.parse(data) as CreateNotificationDto;
    return this.notificationService.create(validated);
  }

  @Get()
  // @Roles('MANAGER', 'ADMIN')
  findAll(@Query('userId') userId?: string) {
    return this.notificationService.findAll(userId);
  }

  @Get('unread/count')
  // @Roles('MANAGER', 'ADMIN')
  getUnreadCount(@Query('userId') userId?: string) {
    return this.notificationService.findUnreadCount(userId);
  }

  @Patch(':id/read')
  // @Roles('MANAGER', 'ADMIN')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read/all')
  // @Roles('MANAGER', 'ADMIN')
  markAllAsRead(@Query('userId') userId?: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  // @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }

  @Delete()
  // @Roles('ADMIN')
  deleteAll(@Query('userId') userId?: string) {
    return this.notificationService.deleteAll(userId);
  }
}