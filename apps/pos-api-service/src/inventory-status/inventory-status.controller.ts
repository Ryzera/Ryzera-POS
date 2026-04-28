// ============================================================
// Inventory Status Controller
// File: src/inventory-status/inventory-status.controller.ts
//
// Route summary:
//  GET /inventory-status/cards             → KPI cards + detail table
//  GET /inventory-status/by-branch         → Per-branch breakdown (SUPER_ADMIN)
//  GET /inventory-status/export/csv        → All-branches / single-branch CSV
//  GET /inventory-status/export/pdf        → All-branches / single-branch PDF
//  GET /inventory-status/export/branch/csv → One specific branch CSV (SUPER_ADMIN)
//  GET /inventory-status/export/branch/pdf → One specific branch PDF (SUPER_ADMIN)
//
// The /export/branch/* routes accept an `invBranchId` query param (InvBranch
// UUID), taken directly from the by-branch API response, so no auth-ID
// resolution is needed. They mirror exactly what each branch's table shows in
// the Per Branch tab.
// ============================================================

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

import { InventoryStatusService }       from './inventory-status.service';
import { QueryInventoryStatusSchema }   from './schemas/query-inventory-status.schema';
import type { QueryInventoryStatusDto } from './schemas/query-inventory-status.schema';
import { JwtAuthGuard }                 from '../common/guards/jwt-auth.guard';
import { RolesGuard }                   from '../common/guards/roles.guard';
import { BranchGuard }                  from '../common/guards/branch.guard';
import { Roles }                        from '../common/decorators/roles.decorator';
import { CurrentUser }                  from '../common/decorators/current-user.decorator';
import type { JwtPayload }              from '../common/interfaces/jwt-payload.interface';

@ApiTags('Inventory Status')
@ApiBearerAuth()
@Controller('inventory-status')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class InventoryStatusController {

    constructor(private readonly inventoryStatusService: InventoryStatusService) {}

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Validates and parses raw query-string params through the Zod schema.
     * Throws a structured 400 on any validation failure.
     */
    private parseQuery(rawQuery: Record<string, unknown>): QueryInventoryStatusDto {
        const result = QueryInventoryStatusSchema.safeParse(rawQuery);
        if (!result.success) {
            throw new BadRequestException(result.error.flatten().fieldErrors);
        }
        return result.data;
    }

    /**
     * Resolves which branchId to scope the query to:
     *  - SUPER_ADMIN: whatever the query says (undefined = all branches).
     *  - BRANCH_MANAGER: always their own branch from the JWT.
     */
    private resolveEffectiveBranchId(
        user:          JwtPayload,
        queryBranchId: number | undefined,
    ): number | undefined {
        if (user.role === 'SUPER_ADMIN') return queryBranchId;
        return user.branchId ?? undefined;
    }

    // ─── KPI cards + inventory detail table ──────────────────────────────────

    @Get('cards')
    @ApiOperation({ summary: 'KPI summary cards and inventory detail table' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    @ApiQuery({ name: 'branchId',    required: false, type: Number })
    async getInventoryStatus(
        @CurrentUser() user:                JwtPayload,
        @Query()       rawQuery: Record<string, unknown>,
    ) {
        const dto = this.parseQuery(rawQuery);
        dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);
        return this.inventoryStatusService.getInventoryStatus(dto);
    }

    // ─── Per-branch breakdown (SUPER_ADMIN only) ──────────────────────────────

    @Get('by-branch')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Inventory breakdown per branch (SUPER_ADMIN only)' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    async getInventoryByBranch(
        @Query() rawQuery: Record<string, unknown>,
    ) {
        const dto = this.parseQuery(rawQuery);
        return this.inventoryStatusService.getInventoryByBranch(dto);
    }

    // ─── All-branches / single-branch CSV export ──────────────────────────────

    @Get('export/csv')
    @ApiOperation({ summary: 'Export inventory as CSV (all-branches or single-branch view)' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    @ApiQuery({ name: 'branchId',    required: false, type: Number })
    async exportCsv(
        @CurrentUser() user:                JwtPayload,
        @Query()       rawQuery: Record<string, unknown>,
        @Res()         res:      Response,
    ) {
        const dto = this.parseQuery(rawQuery);
        dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);

        const buffer = await this.inventoryStatusService.exportCsv(dto, user);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory-status.csv"');
        res.send(buffer);
    }

    // ─── All-branches / single-branch PDF export ──────────────────────────────

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export inventory as PDF (all-branches or single-branch view)' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    @ApiQuery({ name: 'branchId',    required: false, type: Number })
    async exportPdf(
        @CurrentUser() user:                JwtPayload,
        @Query()       rawQuery: Record<string, unknown>,
        @Res()         res:      Response,
    ) {
        const dto = this.parseQuery(rawQuery);
        dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);

        const buffer = await this.inventoryStatusService.exportPdf(dto, user);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory-status.pdf"');
        res.send(buffer);
    }

    // ─── Per-branch CSV export (one specific InvBranch UUID) ─────────────────

    @Get('export/branch/csv')
    @Roles('SUPER_ADMIN')
    @ApiOperation({
        summary: 'Export ONE branch inventory as CSV — matches the per-branch tab table exactly',
    })
    @ApiQuery({
        name:        'invBranchId',
        required:    true,
        description: 'InvBranch UUID (from the by-branch API response)',
    })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    async exportBranchCsv(
        @CurrentUser() user:                JwtPayload,
        @Query()       rawQuery: Record<string, unknown>,
        @Res()         res:      Response,
    ) {
        const invBranchId = rawQuery['invBranchId'];
        if (!invBranchId || typeof invBranchId !== 'string') {
            throw new BadRequestException('invBranchId query parameter is required.');
        }

        const dto    = this.parseQuery(rawQuery);
        const buffer = await this.inventoryStatusService.exportBranchCsv(invBranchId, dto, user);
        const safeName = invBranchId.slice(0, 8);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="inventory-${safeName}.csv"`);
        res.send(buffer);
    }

    // ─── Per-branch PDF export (one specific InvBranch UUID) ─────────────────

    @Get('export/branch/pdf')
    @Roles('SUPER_ADMIN')
    @ApiOperation({
        summary: 'Export ONE branch inventory as PDF — matches the per-branch tab table exactly',
    })
    @ApiQuery({
        name:        'invBranchId',
        required:    true,
        description: 'InvBranch UUID (from the by-branch API response)',
    })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    async exportBranchPdf(
        @CurrentUser() user:                JwtPayload,
        @Query()       rawQuery: Record<string, unknown>,
        @Res()         res:      Response,
    ) {
        const invBranchId = rawQuery['invBranchId'];
        if (!invBranchId || typeof invBranchId !== 'string') {
            throw new BadRequestException('invBranchId query parameter is required.');
        }

        const dto    = this.parseQuery(rawQuery);
        const buffer = await this.inventoryStatusService.exportBranchPdf(invBranchId, dto, user);
        const safeName = invBranchId.slice(0, 8);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="inventory-${safeName}.pdf"`);
        res.send(buffer);
    }
}