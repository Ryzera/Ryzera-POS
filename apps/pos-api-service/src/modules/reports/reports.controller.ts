import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard }   from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { JwtPayload }   from '../../common/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

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
// Typed request helper
// ---------------------------------------------------------------------------

interface AuthenticatedRequest {
    user: JwtPayload;
}

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
        description: 'Filter by branch ID (omit for All Branches)',
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
 * Reports Hub controller.
 * All routes require a valid JWT — enforced at the controller level.
 *
 * Base route: /reports
 */
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
        @Body(new ZodValidationPipe(GenerateReportSchema)) body: GenerateReportDto,
    ) {
        return this.reportsService.generateReport(body);
    }

    // ─── Saved Configurations ─────────────────────────────────────────────

    /**
     * GET /reports/saved-configs
     * Returns saved configs belonging to the authenticated user only.
     */
    @Get('saved-configs')
    getSavedConfigs(@Req() req: AuthenticatedRequest) {
        return this.reportsService.getAllSavedConfigs(req.user.userId);
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
        @Body(new ZodValidationPipe(SaveReportConfigSchema)) body: SaveReportConfigDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportsService.saveReportConfig(body, req.user.userId);
    }

    @Delete('saved-configs/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteConfig(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportsService.deleteSavedConfig(id, req.user.userId);
    }

    // ─── Scheduled Reports ────────────────────────────────────────────────

    /**
     * GET /reports/schedules
     * Returns ALL schedules created by any user, newest first.
     * Any authenticated user can view — but can only delete their own.
     */
    @Get('schedules')
    getSchedules() {
        return this.reportsService.getAllSchedules();  // ← no userId passed
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
        @Body(new ZodValidationPipe(CreateReportScheduleSchema)) body: CreateReportScheduleDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportsService.createSchedule(body, req.user.userId);
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
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(UpdateScheduleStatusSchema)) body: UpdateScheduleStatusDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportsService.updateScheduleStatus(id, req.user.userId, body.isActive);
    }

    /**
     * DELETE /reports/schedules/:id
     * Only the owner of the schedule can delete it — enforced in the service.
     */
    @Delete('schedules/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSchedule(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportsService.deleteSchedule(id, req.user.userId);
    }

    // ─── Delivery History ─────────────────────────────────────────────────

    @Get('schedules/:id/deliveries')
    getDeliveryHistory(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.reportsService.getDeliveryHistory(id);
    }

    @Post('deliveries/:id/resend')
    @HttpCode(HttpStatus.OK)
    resendDelivery(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.reportsService.resendDelivery(id, req.user.userId);
    }
}