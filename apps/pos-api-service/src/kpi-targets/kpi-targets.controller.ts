import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@ryzera/pos-schema';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

import { KpiTargetsService } from './kpi-targets.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  BranchScope,
  BranchScopeResult,
} from '../auth/decorators/branch-scope.decorator';
import { ROLES } from '../common/constants/roles.constants';

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

@ApiTags('KPI Settings')
@ApiBearerAuth()
@Controller('kpi-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpiTargetsController {
  constructor(private readonly kpiTargetsService: KpiTargetsService) {}

  /**
   * ADMIN can target any branch (0 = All Branches).
   * MANAGER is force-pinned to their own branch — 0/"All Branches" and any
   * other branch_id in the request body/query is silently overridden here,
   * so a manager can never touch another branch's (or the global) KPI settings.
   */
  private resolveWriteBranchId(user: JwtPayload, requested?: number): number {
    if (user.roles?.includes('ADMIN') || user.userType === 'ADMIN')
      return requested ?? 0;
    if (!user.branchId) {
      throw new ForbiddenException('Your account has no branch assigned.');
    }
    return user.branchId;
  }

  private resolveReadBranchId(user: JwtPayload, requested?: number): number {
    if (user.roles?.includes('ADMIN') || user.userType === 'ADMIN')
      return requested ?? 0;
    return user.branchId ?? 0;
  }

  // ─── GET /kpi-settings ────────────────────────────────────────────────────
  @Get()
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({
    summary:
      'Load KPI settings for the Settings page. ADMIN: any branch. MANAGER: own branch only.',
  })
  getAllSettings(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(GetKpiSettingsSchema))
    query: GetKpiSettingsDto,
  ) {
    const branchId = this.resolveReadBranchId(user, query.branchId);
    return this.kpiTargetsService.getAllSettings({ ...query, branchId });
  }

  // ─── POST /kpi-settings/save-all ─────────────────────────────────────────
  @Post('save-all')
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({
    summary:
      'Save ALL KPI settings atomically. ADMIN: any branch (0 = All Branches). MANAGER: own branch only.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'sales_targets',
        'margin_target',
        'inventory_threshold',
        'notification_rules',
        'report_defaults',
      ],
      properties: {
        sales_targets: { type: 'array', items: { type: 'object' } },
        margin_target: { type: 'object' },
        inventory_threshold: { type: 'object' },
        notification_rules: { type: 'object' },
        report_defaults: { type: 'object' },
      },
    },
  })
  saveAll(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(SaveAllKpiSettingsSchema))
    dto: SaveAllKpiSettingsDto,
  ) {
    const pin = (branchId?: number) =>
      this.resolveWriteBranchId(user, branchId);

    const scoped: SaveAllKpiSettingsDto = {
      ...dto,
      // MANAGER can never submit "All Branches" (0) or another branch's rows —
      // every sub-section is re-pinned to their own branch server-side.
      sales_targets: dto.sales_targets.map((t) => ({
        ...t,
        branch_id: pin(t.branch_id),
      })),
      margin_target: {
        ...dto.margin_target,
        branch_id: pin(dto.margin_target.branch_id),
      },
      inventory_threshold: {
        ...dto.inventory_threshold,
        branch_id: pin(dto.inventory_threshold.branch_id),
      },
      notification_rules: {
        ...dto.notification_rules,
        branch_id: pin(dto.notification_rules.branch_id),
      },
      report_defaults: {
        ...dto.report_defaults,
        branch_id: pin(dto.report_defaults.branch_id),
      },
    };

    return this.kpiTargetsService.saveAllSettings(scoped);
  }

  // ─── POST /kpi-settings/targets ──────────────────────────────────────────
  @Post('targets')
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Upsert a single sales target row' })
  upsertSalesTarget(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpsertSalesTargetSchema))
    dto: UpsertSalesTargetDto,
  ) {
    return this.kpiTargetsService.upsertSalesTarget({
      ...dto,
      branch_id: this.resolveWriteBranchId(user, dto.branch_id),
    });
  }

  // ─── POST /kpi-settings/margin-targets ───────────────────────────────────
  @Post('margin-targets')
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Upsert profit margin targets (gross + net)' })
  upsertMarginTarget(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpsertMarginTargetSchema))
    dto: UpsertMarginTargetDto,
  ) {
    return this.kpiTargetsService.upsertMarginTarget({
      ...dto,
      branch_id: this.resolveWriteBranchId(user, dto.branch_id),
    });
  }

  // ─── POST /kpi-settings/inventory-thresholds ─────────────────────────────
  @Post('inventory-thresholds')
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Upsert inventory stock thresholds' })
  upsertInventoryThreshold(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpsertInventoryThresholdSchema))
    dto: UpsertInventoryThresholdDto,
  ) {
    return this.kpiTargetsService.upsertInventoryThreshold({
      ...dto,
      branch_id: this.resolveWriteBranchId(user, dto.branch_id),
    });
  }

  // ─── POST /kpi-settings/notification-rules ───────────────────────────────
  @Post('notification-rules')
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Upsert notification rule toggles' })
  upsertNotificationRules(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpsertNotificationRuleSchema))
    dto: UpsertNotificationRuleDto,
  ) {
    return this.kpiTargetsService.upsertNotificationRules({
      ...dto,
      branch_id: this.resolveWriteBranchId(user, dto.branch_id),
    });
  }

  // ─── POST /kpi-settings/report-defaults ──────────────────────────────────
  @Post('report-defaults')
  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Upsert report display defaults' })
  upsertReportDefaults(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpsertReportDefaultSchema))
    dto: UpsertReportDefaultDto,
  ) {
    return this.kpiTargetsService.upsertReportDefaults({
      ...dto,
      branch_id: this.resolveWriteBranchId(user, dto.branch_id),
    });
  }

  // ─── GET /kpi-settings/progress ──────────────────────────────────────────
  @Get('progress')
  @Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.INVENTORY_MANAGER)
  @ApiOperation({
    summary: 'Monthly target progress bar data (Dashboard widget — all roles)',
  })
  getProgress(
    @CurrentUser() user: JwtPayload,
    @Query(new ZodValidationPipe(GetKpiSettingsSchema))
    query: GetKpiSettingsDto,
  ) {
    // ADMIN can request any branch's progress (e.g. via the Dashboard branch
    // selector) — same resolution rule as GET /kpi-settings. MANAGER/CASHIER/
    // INVENTORY_MANAGER are always pinned to their own branch regardless of
    // what's requested.
    const branchId =
      user.roles?.includes('ADMIN') || user.userType === 'ADMIN'
        ? (query.branchId ?? undefined)
        : (user.branchId ?? undefined);
    return this.kpiTargetsService.getTargetProgress(branchId);
  }
}
