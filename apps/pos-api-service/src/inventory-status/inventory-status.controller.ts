import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { InventoryStatusService } from './inventory-status.service';
import { QueryInventoryStatusSchema } from './schemas/query-inventory-status.schema';
import type { QueryInventoryStatusDto } from './schemas/query-inventory-status.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BranchScope, BranchScopeResult } from '../auth/decorators/branch-scope.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '../common/constants/roles.constants';
import { JwtPayload } from '@ryzera/pos-schema';

// INVENTORY_MANAGER can only ever see their own branch's inventory status —
// they never get the all-branches / per-branch-export endpoints below
// (those stay ADMIN-only, same as before).
@ApiTags('Inventory Status')
@ApiBearerAuth()
@Controller('inventory-status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY_MANAGER)
export class InventoryStatusController {
  constructor(
    private readonly inventoryStatusService: InventoryStatusService,
  ) {}

  // ─── Private helpers ──────────────────────────────────────────────────────

  private parseQuery(
    rawQuery: Record<string, unknown>,
  ): QueryInventoryStatusDto {
    const result = QueryInventoryStatusSchema.safeParse(rawQuery);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten().fieldErrors);
    }
    return result.data;
  }

  private resolveEffectiveBranchId(
    user: JwtPayload,
    queryBranchId: number | undefined,
  ): number | undefined {
    if (user.roles?.includes('ADMIN') || user.userType === 'ADMIN')
      return queryBranchId;
    return user.branchId ?? undefined;
  }

  // ─── KPI cards + inventory detail table ──────────────────────────────────

  @Get('cards')
  @ApiOperation({ summary: 'KPI summary cards and inventory detail table' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    enum: ['InStock', 'LowStock', 'OutOfStock'],
  })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  async getInventoryStatus(
    @BranchScope() scope: BranchScopeResult,
    @Query() rawQuery: Record<string, unknown>,
  ) {
    const dto = this.parseQuery(rawQuery);
    dto.branchId = scope.branchId ?? dto.branchId;
    return this.inventoryStatusService.getInventoryStatus(dto);
  }

  // ─── Per-branch breakdown (ADMIN only) ─────────────────────────────────────

  @Get('by-branch')
  @Roles(ROLES.ADMIN)
  @ApiOperation({
    summary: 'Inventory breakdown per branch (ADMIN only)',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    enum: ['InStock', 'LowStock', 'OutOfStock'],
  })
  async getInventoryByBranch(@Query() rawQuery: Record<string, unknown>) {
    const dto = this.parseQuery(rawQuery);
    return this.inventoryStatusService.getInventoryByBranch(dto);
  }

  // ─── All-branches / single-branch CSV export ──────────────────────────────

  @Get('export/csv')
  @ApiOperation({
    summary: 'Export inventory as CSV (all-branches or single-branch view)',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    enum: ['InStock', 'LowStock', 'OutOfStock'],
  })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Query() rawQuery: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const dto = this.parseQuery(rawQuery);
    dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);

    const buffer = await this.inventoryStatusService.exportCsv(dto, user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="inventory-status.csv"',
    );
    res.send(buffer);
  }

  // ─── All-branches / single-branch PDF export ──────────────────────────────

  @Get('export/pdf')
  @ApiOperation({
    summary: 'Export inventory as PDF (all-branches or single-branch view)',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    enum: ['InStock', 'LowStock', 'OutOfStock'],
  })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  async exportPdf(
    @CurrentUser() user: JwtPayload,
    @Query() rawQuery: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const dto = this.parseQuery(rawQuery);
    dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);

    const buffer = await this.inventoryStatusService.exportPdf(dto, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="inventory-status.pdf"',
    );
    res.send(buffer);
  }

  // ─── Per-branch CSV export (ADMIN only) ────────────────────────────────────

  @Get('export/branch/csv')
  @Roles(ROLES.ADMIN)
  @ApiOperation({
    summary:
      'Export ONE branch inventory as CSV — matches the per-branch tab table exactly',
  })
  @ApiQuery({
    name: 'invBranchId',
    required: true,
    type: Number,
    description: 'Branch ID (integer) from the by-branch API response',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    enum: ['InStock', 'LowStock', 'OutOfStock'],
  })
  async exportBranchCsv(
    @CurrentUser() user: JwtPayload,
    @Query() rawQuery: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const raw = rawQuery['invBranchId'];
    if (raw === undefined || raw === null || raw === '') {
      throw new BadRequestException('invBranchId query parameter is required.');
    }

    const invBranchId = Number(raw);
    if (!Number.isInteger(invBranchId) || invBranchId <= 0) {
      throw new BadRequestException('invBranchId must be a positive integer.');
    }

    const dto = this.parseQuery(rawQuery);
    const buffer = await this.inventoryStatusService.exportBranchCsv(
      invBranchId,
      dto,
      user,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory-branch-${invBranchId}.csv"`,
    );
    res.send(buffer);
  }

  // ─── Per-branch PDF export (ADMIN only) ────────────────────────────────────

  @Get('export/branch/pdf')
  @Roles(ROLES.ADMIN)
  @ApiOperation({
    summary:
      'Export ONE branch inventory as PDF — matches the per-branch tab table exactly',
  })
  @ApiQuery({
    name: 'invBranchId',
    required: true,
    type: Number,
    description: 'Branch ID (integer) from the by-branch API response',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    enum: ['InStock', 'LowStock', 'OutOfStock'],
  })
  async exportBranchPdf(
    @CurrentUser() user: JwtPayload,
    @Query() rawQuery: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const raw = rawQuery['invBranchId'];
    if (raw === undefined || raw === null || raw === '') {
      throw new BadRequestException('invBranchId query parameter is required.');
    }

    const invBranchId = Number(raw);
    if (!Number.isInteger(invBranchId) || invBranchId <= 0) {
      throw new BadRequestException('invBranchId must be a positive integer.');
    }

    const dto = this.parseQuery(rawQuery);
    const buffer = await this.inventoryStatusService.exportBranchPdf(
      invBranchId,
      dto,
      user,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory-branch-${invBranchId}.pdf"`,
    );
    res.send(buffer);
  }
}
