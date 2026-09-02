import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES } from '../common/constants/roles.constants';
import { BranchScope, BranchScopeResult } from '../auth/decorators/branch-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@ryzera/pos-schema';

@ApiTags('Notifications') // ← add this
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
      @BranchScope() scope: BranchScopeResult,
      @Query('branchId') branchId?: number,
  ) {
    const effectiveBranchId =
      scope.branchId ?? (branchId ? Number(branchId) : undefined);
    return this.notificationsService.getUnread(effectiveBranchId);
  }

  @Get('count')
  getCount(@CurrentUser() user: JwtPayload) {
    const branchId =
      user.roles?.includes('ADMIN') || user.userType === 'ADMIN'
        ? undefined
        : (user.branchId ?? undefined);
    return this.notificationsService.getUnreadCount(branchId);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markRead(id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: JwtPayload) {
    const branchId =
      user.roles?.includes('ADMIN') || user.userType === 'ADMIN'
        ? undefined
        : (user.branchId ?? undefined);    return this.notificationsService.markAllRead(branchId);
  }
}
