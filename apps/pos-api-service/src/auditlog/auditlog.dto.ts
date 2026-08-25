import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { LogAction, LogStatus } from '@ryzera/pos-database';// adjust import path to your Prisma client output

/**
 * Query params for GET /users/:id/audit-logs
 * Matches the mockup: filter by action/status, paginate results.
 */
export class AuditLogQueryDto {
    @ApiPropertyOptional({ enum: LogAction, description: 'Filter by action type' })
    @IsOptional()
    @IsEnum(LogAction)
    action?: LogAction;

    @ApiPropertyOptional({ enum: LogStatus, description: 'Filter by SUCCESS / FAILED' })
    @IsOptional()
    @IsEnum(LogStatus)
    status?: LogStatus;

    @ApiPropertyOptional({ description: 'Start date (ISO 8601), inclusive' })
    @IsOptional()
    @IsISO8601()
    from?: string;

    @ApiPropertyOptional({ description: 'End date (ISO 8601), inclusive' })
    @IsOptional()
    @IsISO8601()
    to?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    page: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    limit: number = 20;
}

export class AuditLogItemDto {
    @ApiPropertyOptional() id: number;
    @ApiPropertyOptional() action: LogAction;
    @ApiPropertyOptional() status: LogStatus;
    @ApiPropertyOptional() ip_address: string | null;
    @ApiPropertyOptional() user_agent: string | null;
    @ApiPropertyOptional() device_info: string | null;
    @ApiPropertyOptional() created_at: Date;
    @ApiPropertyOptional({ description: 'Branch name, if the action happened at a branch' })
    branch_name?: string | null;
}

export class PaginatedAuditLogDto {
    @ApiPropertyOptional({ type: [AuditLogItemDto] })
    data: AuditLogItemDto[];
    @ApiPropertyOptional() total: number;
    @ApiPropertyOptional() page: number;
    @ApiPropertyOptional() limit: number;
    @ApiPropertyOptional() totalPages: number;
}