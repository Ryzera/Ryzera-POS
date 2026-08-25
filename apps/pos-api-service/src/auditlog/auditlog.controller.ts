import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // adjust to your actual guard paths
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditLogService } from './auditlog.service';
import { AuditLogQueryDto, PaginatedAuditLogDto } from './auditlog.dto';

@ApiTags('Users - Audit Logs')
@ApiBearerAuth() // tells Swagger this endpoint needs the JWT bearer token
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get(':id/audit-logs')
    @Roles('ADMIN', 'MANAGER') // adjust to match your actual role names / authority checks
    @ApiOperation({ summary: 'Get login/activity history for a specific user (paginated, filterable)' })
    @ApiOkResponse({ type: PaginatedAuditLogDto })
    getUserLogs(
        @Param('id', ParseIntPipe) id: number,
        @Query() query: AuditLogQueryDto,
    ) {
        return this.auditLogService.getLogs(id, query);
    }
}