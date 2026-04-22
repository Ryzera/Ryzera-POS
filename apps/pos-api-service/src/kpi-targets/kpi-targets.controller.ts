import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

import { KpiTargetsService }  from './kpi-targets.service';
import { ZodValidationPipe }  from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard }       from '../common/guards/jwt-auth.guard';
import { RolesGuard }         from '../common/guards/roles.guard';
import { Roles }              from '../common/decorators/roles.decorator';
import { CurrentUser }        from '../common/decorators/current-user.decorator';
import type { JwtPayload }    from '../common/interfaces/jwt-payload.interface';

// ─── New KPI Settings schemas (all sections) ─────────────────────────────────
import {
    SaveAllKpiSettingsSchema,
    UpsertSalesTargetSchema,
    UpsertMarginTargetSchema,
    UpsertInventoryThresholdSchema,
    UpsertNotificationRuleSchema,
    UpsertReportDefaultSchema,
    GetKpiSettingsSchema,
    type SaveAllKpiSettingsDto,
    type UpsertSalesTargetDto,
    type UpsertMarginTargetDto,
    type UpsertInventoryThresholdDto,
    type UpsertNotificationRuleDto,
    type UpsertReportDefaultDto,
    type GetKpiSettingsDto,
} from './schemas/kpi-settings.schema';

// ─── Legacy schema — kept so the old POST /kpi-targets endpoint still works ──
import { CreateKpiTargetSchema }      from './schemas/create-kpi-target.schema';
import type { CreateKpiTargetDto }    from './schemas/create-kpi-target.schema';

@ApiTags('KPI Settings')
@ApiBearerAuth()
@Controller('kpi-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpiTargetsController {
    constructor(private readonly kpiTargetsService: KpiTargetsService) {}

    // ─── GET /kpi-settings ────────────────────────────────────────────────────
    @Get()
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Load all KPI settings for the Settings page (SUPER_ADMIN only)' })
    getAllSettings(
        @Query(new ZodValidationPipe(GetKpiSettingsSchema)) query: GetKpiSettingsDto,
    ) {
        return this.kpiTargetsService.getAllSettings(query);
    }

    // ─── POST /kpi-settings/save-all ─────────────────────────────────────────
    @Post('save-all')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Save ALL KPI settings atomically — "Save All Changes" button (SUPER_ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['sales_targets', 'margin_target', 'inventory_threshold', 'notification_rules', 'report_defaults'],
            properties: {
                sales_targets: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            period_type:   { type: 'string', enum: ['Daily', 'Weekly', 'Monthly'] },
                            target_amount: { type: 'number', example: 500000 },
                            branch_id:     { type: 'number', example: 0 },
                        },
                    },
                    example: [
                        { period_type: 'Monthly', target_amount: 500000, branch_id: 0 },
                        { period_type: 'Weekly',  target_amount: 125000, branch_id: 0 },
                        { period_type: 'Daily',   target_amount: 17850,  branch_id: 0 },
                    ],
                },
                margin_target: {
                    type: 'object',
                    properties: {
                        target_gross_margin: { type: 'number', example: 38 },
                        target_net_margin:   { type: 'number', example: 32 },
                        branch_id:           { type: 'number', example: 0 },
                    },
                },
                inventory_threshold: {
                    type: 'object',
                    properties: {
                        default_reorder_level: { type: 'number', example: 20 },
                        critical_stock_level:  { type: 'number', example: 5 },
                        zero_sales_hours:      { type: 'number', example: 24 },
                        branch_id:             { type: 'number', example: 0 },
                    },
                },
                notification_rules: {
                    type: 'object',
                    properties: {
                        daily_target_midday:        { type: 'boolean', example: true },
                        unusual_hourly_drop:        { type: 'boolean', example: true },
                        zero_sales_product:         { type: 'boolean', example: true },
                        low_stock_alert:            { type: 'boolean', example: true },
                        out_of_stock_alert:         { type: 'boolean', example: true },
                        daily_summary_notification: { type: 'boolean', example: true },
                        weekly_performance_summary: { type: 'boolean', example: false },
                        margin_below_target:        { type: 'boolean', example: true },
                        check_frequency_minutes:    { type: 'number',  example: 5 },
                        branch_id:                  { type: 'number',  example: 0 },
                    },
                },
                report_defaults: {
                    type: 'object',
                    properties: {
                        default_date_range:   { type: 'string',  example: 'LAST_30_DAYS' },
                        default_branch_view:  { type: 'string',  example: 'ALL' },
                        show_target_progress: { type: 'boolean', example: true },
                        branch_id:            { type: 'number',  example: 0 },
                    },
                },
            },
        },
    })
    saveAll(
        @Body(new ZodValidationPipe(SaveAllKpiSettingsSchema)) dto: SaveAllKpiSettingsDto,
    ) {
        return this.kpiTargetsService.saveAllSettings(dto);
    }

    // ─── POST /kpi-settings/targets ──────────────────────────────────────────
    @Post('targets')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Upsert a single sales target row (SUPER_ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['period_type', 'target_amount'],
            properties: {
                period_type:   { type: 'string', enum: ['Daily', 'Weekly', 'Monthly'], example: 'Monthly' },
                target_amount: { type: 'number', example: 500000 },
                branch_id:     { type: 'number', example: 0, description: '0 = All Branches' },
            },
        },
    })
    upsertSalesTarget(
        @Body(new ZodValidationPipe(UpsertSalesTargetSchema)) dto: UpsertSalesTargetDto,
    ) {
        return this.kpiTargetsService.upsertSalesTarget(dto);
    }

    // ─── POST /kpi-settings/margin-targets ───────────────────────────────────
    @Post('margin-targets')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Upsert profit margin targets (gross + net) (SUPER_ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['target_gross_margin', 'target_net_margin'],
            properties: {
                target_gross_margin: { type: 'number', example: 38, description: 'Target Gross Margin %' },
                target_net_margin:   { type: 'number', example: 32, description: 'Target Net Margin %' },
                branch_id:           { type: 'number', example: 0, description: '0 = All Branches' },
            },
        },
    })
    upsertMarginTarget(
        @Body(new ZodValidationPipe(UpsertMarginTargetSchema)) dto: UpsertMarginTargetDto,
    ) {
        return this.kpiTargetsService.upsertMarginTarget(dto);
    }

    // ─── POST /kpi-settings/inventory-thresholds ─────────────────────────────
    @Post('inventory-thresholds')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Upsert inventory stock thresholds (SUPER_ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['default_reorder_level', 'critical_stock_level', 'zero_sales_hours'],
            properties: {
                default_reorder_level: { type: 'number', example: 20, description: 'Reorder alert fires when stock < this' },
                critical_stock_level:  { type: 'number', example: 5,  description: 'Triggers urgent alert' },
                zero_sales_hours:      { type: 'number', example: 24, description: 'Alert if product has no sales for this many hours' },
                branch_id:             { type: 'number', example: 0,  description: '0 = All Branches' },
            },
        },
    })
    upsertInventoryThreshold(
        @Body(new ZodValidationPipe(UpsertInventoryThresholdSchema)) dto: UpsertInventoryThresholdDto,
    ) {
        return this.kpiTargetsService.upsertInventoryThreshold(dto);
    }

    // ─── POST /kpi-settings/notification-rules ───────────────────────────────
    @Post('notification-rules')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Upsert notification rule toggles (SUPER_ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                daily_target_midday:        { type: 'boolean', example: true,  description: 'Alert when <50% of daily target reached by 12PM' },
                unusual_hourly_drop:        { type: 'boolean', example: true,  description: 'Alert when hourly sales are >80% below average' },
                zero_sales_product:         { type: 'boolean', example: true,  description: 'Alert when a product has zero sales today' },
                low_stock_alert:            { type: 'boolean', example: true,  description: 'Alert when stock falls below reorder level' },
                out_of_stock_alert:         { type: 'boolean', example: true,  description: 'Immediate alert when stock reaches zero' },
                daily_summary_notification: { type: 'boolean', example: true,  description: 'End-of-day sales summary at 9PM' },
                weekly_performance_summary: { type: 'boolean', example: false, description: 'Monday morning weekly digest' },
                margin_below_target:        { type: 'boolean', example: true,  description: 'Alert when profit margin drops below target' },
                check_frequency_minutes:    { type: 'number',  example: 5,     description: 'How often the system checks alert conditions (1|5|10|30|60)' },
                branch_id:                  { type: 'number',  example: 0,     description: '0 = All Branches' },
            },
        },
    })
    upsertNotificationRules(
        @Body(new ZodValidationPipe(UpsertNotificationRuleSchema)) dto: UpsertNotificationRuleDto,
    ) {
        return this.kpiTargetsService.upsertNotificationRules(dto);
    }

    // ─── POST /kpi-settings/report-defaults ──────────────────────────────────
    @Post('report-defaults')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Upsert report display defaults (SUPER_ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                default_date_range:   {
                    type: 'string',
                    enum: ['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'THIS_MONTH', 'CUSTOM'],
                    example: 'LAST_30_DAYS',
                    description: 'Default date range pre-selected on report pages',
                },
                default_branch_view:  { type: 'string',  example: 'ALL',  description: 'ALL or a branch_id string' },
                show_target_progress: { type: 'boolean', example: true,   description: 'Show monthly target progress bar on Dashboard' },
                branch_id:            { type: 'number',  example: 0,      description: '0 = All Branches' },
            },
        },
    })
    upsertReportDefaults(
        @Body(new ZodValidationPipe(UpsertReportDefaultSchema)) dto: UpsertReportDefaultDto,
    ) {
        return this.kpiTargetsService.upsertReportDefaults(dto);
    }

    // ─── GET /kpi-settings/progress ──────────────────────────────────────────
    @Get('progress')
    @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'CASHIER')
    @ApiOperation({ summary: 'Monthly target progress bar data (Dashboard widget — all roles)' })
    getProgress(@CurrentUser() user: JwtPayload) {
        const branchId = user.role === 'SUPER_ADMIN'
            ? undefined
            : (user.branchId ?? undefined);
        return this.kpiTargetsService.getTargetProgress(branchId);
    }
}