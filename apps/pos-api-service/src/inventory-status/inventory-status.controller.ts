import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';  // ← ADD

import { InventoryStatusService }        from './inventory-status.service';
import { QueryInventoryStatusSchema }    from './schemas/query-inventory-status.schema';
import type { QueryInventoryStatusDto }  from './schemas/query-inventory-status.schema';

import { JwtAuthGuard }  from '../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../common/guards/roles.guard';
import { BranchGuard }   from '../common/guards/branch.guard';
import { Roles }         from '../common/decorators/roles.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Inventory Status')       // ← ADD
@ApiBearerAuth()                   // ← ADD — enables the 🔒 lock icon per endpoint
@Controller('inventory-status')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class InventoryStatusController {

    constructor(private readonly inventoryStatusService: InventoryStatusService) {}

    private parseQuery(rawQuery: Record<string, unknown>): QueryInventoryStatusDto {
        const result = QueryInventoryStatusSchema.safeParse(rawQuery);
        if (!result.success) {
            throw new BadRequestException(result.error.flatten().fieldErrors);
        }
        return result.data;
    }

    private resolveEffectiveBranchId(
        user: JwtPayload,
        queryBranchId?: number,
    ): number | undefined {
        if (user.role === 'SUPER_ADMIN') return queryBranchId;
        return user.branchId ?? undefined;
    }

    @Get('cards')
    @ApiOperation({ summary: 'Get KPI cards + inventory detail table' })   // ← ADD
    @ApiQuery({ name: 'category',    required: false })                    // ← ADD
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    @ApiQuery({ name: 'branchId',    required: false, type: Number })
    async getInventoryStatus(
        @CurrentUser() user: JwtPayload,
        @Query() rawQuery: Record<string, unknown>,
    ) {
        const dto = this.parseQuery(rawQuery);
        dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);
        return this.inventoryStatusService.getInventoryStatus(dto);
    }

    @Get('by-branch')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Get inventory broken down per branch (SUPER_ADMIN only)' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    async getInventoryByBranch(
        @Query() rawQuery: Record<string, unknown>,
    ) {
        const dto = this.parseQuery(rawQuery);
        return this.inventoryStatusService.getInventoryByBranch(dto);
    }

    @Get('export/csv')
    @ApiOperation({ summary: 'Export inventory as CSV file' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    @ApiQuery({ name: 'branchId',    required: false, type: Number })
    async exportCsv(
        @CurrentUser() user: JwtPayload,
        @Query() rawQuery: Record<string, unknown>,
        @Res() res: Response,
    ) {
        const dto = this.parseQuery(rawQuery);
        dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);
        const buffer = await this.inventoryStatusService.exportCsv(dto,user);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory-status.csv"');
        res.send(buffer);
    }

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export inventory as PDF file' })
    @ApiQuery({ name: 'category',    required: false })
    @ApiQuery({ name: 'stockStatus', required: false, enum: ['InStock', 'LowStock', 'OutOfStock'] })
    @ApiQuery({ name: 'branchId',    required: false, type: Number })
    async exportPdf(
        @CurrentUser() user: JwtPayload,
        @Query() rawQuery: Record<string, unknown>,
        @Res() res: Response,
    ) {
        const dto = this.parseQuery(rawQuery);
        dto.branchId = this.resolveEffectiveBranchId(user, dto.branchId);
        const buffer = await this.inventoryStatusService.exportPdf(dto,user);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory-status.pdf"');
        res.send(buffer);
    }
}