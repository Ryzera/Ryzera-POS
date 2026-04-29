import { Controller, Get, Patch, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { BranchGuard }   from '../common/guards/branch.guard';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Notifications')       // ← add this
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    getUnread(@CurrentUser() user: JwtPayload) {
        const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId ?? undefined;
        return this.notificationsService.getUnread(branchId);
    }

    @Get('count')
    getCount(@CurrentUser() user: JwtPayload) {
        const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId ?? undefined;
        return this.notificationsService.getUnreadCount(branchId);
    }

    @Patch(':id/read')
    markRead(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.markRead(id);
    }

    @Patch('read-all')
    markAllRead(@CurrentUser() user: JwtPayload) {
        const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId ?? undefined;
        return this.notificationsService.markAllRead(branchId);
    }
}