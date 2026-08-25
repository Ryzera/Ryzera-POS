import {
    Controller, Get, Post, Patch, Body, Param,
    Query, Headers, ParseIntPipe,
} from '@nestjs/common';
import { CashierService } from './cashier.service';
import { createCashierSchema, CreateCashierDto } from './dto/create-cashier.schema';
import { updateCashierSchema, UpdateCashierDto } from './dto/update-cashier.schema';

// ⚠️ TEMPORARY: headers eken user info ganawa.
// Auth module ready unaama, @UseGuards(JwtAuthGuard) add karala
// @Req() req.user eken userType/branchId/companyId ganna one.
@Controller('cashiers')
export class CashierController {
    constructor(private readonly cashierService: CashierService) {}

    @Get()
    findAll(
        @Headers('x-user-type') userType: string,
        @Headers('x-branch-id') branchIdHeader: string,
        @Headers('x-company-id') companyIdHeader: string,
        @Query('branch_id') filterBranchId?: string,
    ) {
        const companyId    = parseInt(companyIdHeader);
        const userBranchId = branchIdHeader ? parseInt(branchIdHeader) : null;

        if (userType === 'ADMIN' && filterBranchId) {
            return this.cashierService.findByBranch(parseInt(filterBranchId), companyId);
        }
        return this.cashierService.findAll(userType, userBranchId, companyId);
    }

    @Post()
    create(
        @Body() body: unknown,
        @Headers('x-company-id') companyIdHeader: string,
    ) {
        const dto: CreateCashierDto = createCashierSchema.parse(body);
        return this.cashierService.create(dto, parseInt(companyIdHeader));
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
        const dto: UpdateCashierDto = updateCashierSchema.parse(body);
        return this.cashierService.update(id, dto);
    }

    @Patch(':id/deactivate')
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.cashierService.deactivate(id);
    }
}