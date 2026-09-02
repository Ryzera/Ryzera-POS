import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BranchScope, BranchScopeResult } from '../../auth/decorators/branch-scope.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import {
    GenerateReportSchema,
} from './schemas/generate-report.schema';
import type { GenerateReportDto } from './schemas/generate-report.schema';

import {
    SaveReportConfigSchema,
} from './schemas/saved-config.schema';
import type { SaveReportConfigDto } from './schemas/saved-config.schema';

import {
    CreateReportScheduleSchema,
    UpdateScheduleStatusSchema,
} from './schemas/report-schedule.schema';
import type {
    CreateReportScheduleDto,
    UpdateScheduleStatusDto,
} from './schemas/report-schedule.schema';

// ---------------------------------------------------------------------------
// Shared Swagger schema constants
// ---------------------------------------------------------------------------

const REPORT_TYPE_ENUM = [
    'SALES',
    'PRODUCT_PERFORMANCE',
    'INVENTORY_STATUS',
    'PROFIT_AND_LOSS',
    'CATEGORY_PERFORMANCE',
    'DAILY_SUMMARY',
];

const SCHEDULE_FREQUENCY_ENUM = ['DAILY', 'WEEKLY', 'MONTHLY'];

const OPTIONAL_FILTERS = {
    branchId: {
        type: 'number',
        example: 1,
        nullable: true,
        description: 'Filter by branch ID (ADMIN only — omit for All Branches; MANAGER is always locked to their own branch)',
    },
    categoryId: {
        type: 'string',
        example: 'cat-0001-0000-0000-000000000001',
        nullable: true,
        description: 'Filter by category ID (omit for All Categories)',
    },
};

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

/**
 * Reports Hub controller — multi-report generator, saved configs,
 * and scheduled report delivery.
 *
 * Restricted to ADMIN and MANAGER.
 * Base route: /reports
 */
@ApiTags('Reports Hub')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    // ─── Report Generation ────────────────────────────────────────────────

    @Post('generate')
    @HttpCode(HttpStatus.OK)
    @ApiBody({
        description: 'Filters for on-demand report generation',
        schema: {
            type: 'object',
            required: ['reportType', 'startDate', 'endDate'],
            properties: {
                reportType: { type: 'string', enum: REPORT_TYPE_ENUM, example: 'SALES' },
                startDate:  { type: 'string', example: '2026-01-01' },
                endDate:    { type: 'string', example: '2026-01-31' },
                ...OPTIONAL_FILTERS,
            },
        },
    })
    generateReport(
        @BranchScope() scope: BranchScopeResult,
        @Body(new ZodValidationPipe(GenerateReportSchema)) body: GenerateReportDto,
    ) {
        const branchId = scope.branchId ?? body.branchId;
        return this.reportsService.generateReport({ ...body, branchId });
    }

    // ─── Saved Configurations ─────────────────────────────────────────────

    /**
     * GET /reports/saved-configs
     * Returns saved configs.
     */
    @Get('saved-configs')
    getSavedConfigs() {
        return this.reportsService.getAllSavedConfigs();
    }

    @Post('saved-configs')
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({
        description: 'Named filter configuration to save for quick re-use',
        schema: {
            type: 'object',
            required: ['configName', 'reportType', 'startDate', 'endDate'],
            properties: {
                configName: {
                    type: 'string',
                    example: 'Weekly Dairy Sales — Colombo',
                    minLength: 3,
                    maxLength: 100,
                },
                reportType: { type: 'string', enum: REPORT_TYPE_ENUM, example: 'SALES' },
                startDate:  { type: 'string', example: '2026-01-01' },
                endDate:    { type: 'string', example: '2026-01-31' },
                ...OPTIONAL_FILTERS,
            },
        },
    })
    saveConfig(
        @BranchScope() scope: BranchScopeResult,
        @Body(new ZodValidationPipe(SaveReportConfigSchema)) body: SaveReportConfigDto,
    ) {
        const branchId = scope.branchId ?? body.branchId;
        return this.reportsService.saveReportConfig({ ...body, branchId }, scope.userId);
    }

    /**
     * DELETE /reports/saved-configs/:id
     * ADMIN can delete any saved config.
     * MANAGER can delete only the configs they created themselves.
     */
    @Delete('saved-configs/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteConfig(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
    ) {
        return this.reportsService.deleteSavedConfig(String(id), scope.userId, scope.roleName);
    }

    // ─── Scheduled Reports ────────────────────────────────────────────────

    /**
     * GET /reports/schedules
     * Returns ALL schedules created by any user.
     */
    @Get('schedules')
    getSchedules() {
        return this.reportsService.getAllSchedules();
    }

    @Post('schedules')
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({
        description: 'Configuration for a new automated report schedule',
        schema: {
            type: 'object',
            required: ['scheduleName', 'reportType', 'frequency', 'recipientEmail'],
            properties: {
                scheduleName: {
                    type: 'string',
                    example: 'Weekly Sales Summary',
                    minLength: 3,
                    maxLength: 100,
                },
                reportType:     { type: 'string', enum: REPORT_TYPE_ENUM,        example: 'SALES'  },
                frequency:      { type: 'string', enum: SCHEDULE_FREQUENCY_ENUM, example: 'WEEKLY' },
                recipientEmail: { type: 'string', format: 'email', example: 'manager@ryzerapos.lk' },
                isActive:       { type: 'boolean', example: true, default: true },
                ...OPTIONAL_FILTERS,
            },
        },
    })
    createSchedule(
        @BranchScope() scope: BranchScopeResult,
        @Body(new ZodValidationPipe(CreateReportScheduleSchema)) body: CreateReportScheduleDto,
    ) {
        const branchId = scope.branchId ?? body.branchId;
        return this.reportsService.createSchedule({ ...body, branchId }, scope.userId);
    }

    @Patch('schedules/:id/status')
    @ApiBody({
        description: 'Toggle the active state of a schedule',
        schema: {
            type: 'object',
            required: ['isActive'],
            properties: {
                isActive: {
                    type: 'boolean',
                    example: false,
                    description: 'true = active, false = paused',
                },
            },
        },
    })
    updateScheduleStatus(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
        @Body(new ZodValidationPipe(UpdateScheduleStatusSchema)) body: UpdateScheduleStatusDto,
    ) {
        return this.reportsService.updateScheduleStatus(String(id), scope.userId, body.isActive);
    }

    /**
     * DELETE /reports/schedules/:id
     * ADMIN can delete any schedule.
     * MANAGER can delete only the schedules they created themselves.
     */
    @Delete('schedules/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSchedule(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
    ) {
        return this.reportsService.deleteSchedule(String(id), scope.userId, scope.roleName);
    }

    // ─── Delivery History ─────────────────────────────────────────────────

    @Get('schedules/:id/deliveries')
    getDeliveryHistory(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.reportsService.getDeliveryHistory(String(id));
    }

    @Post('deliveries/:id/resend')
    @HttpCode(HttpStatus.OK)
    resendDelivery(
        @Param('id', ParseIntPipe) id: number,
        @BranchScope() scope: BranchScopeResult,
    ) {
        return this.reportsService.resendDelivery(String(id), scope.userId);
    }
}