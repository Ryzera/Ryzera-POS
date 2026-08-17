import {
    Controller, Get, Post, Patch,
    Body, Param, Query,
    ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateBillSchema, JwtPayload } from '@ryzera/pos-schema';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    // GET /billing
    @Get()
    @Roles('ADMIN', 'MANAGER', 'CASHIER')
    findAll(
        @CurrentUser() user: JwtPayload,
        @Query('branchId') branchId?: string,
    ) {
        const branch = branchId ? parseInt(branchId) : user.branchId ?? undefined;
        return this.billingService.findAll(user.companyId, branch ?? undefined);
    }

    // GET /billing/:id
    @Get(':id')
    @Roles('ADMIN', 'MANAGER', 'CASHIER')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.billingService.findOne(id);
    }

    // POST /billing
    @Post()
    @Roles('ADMIN', 'MANAGER', 'CASHIER')
    create(@Body() body: unknown, @CurrentUser() user: JwtPayload) {
        const dto = CreateBillSchema.parse(body);
        return this.billingService.create(dto, user.userId, user.companyId);
    }

    // PATCH /billing/:id/cancel
    @Patch(':id/cancel')
    @Roles('ADMIN', 'MANAGER')
    @HttpCode(HttpStatus.OK)
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.billingService.cancel(id);
    }
}