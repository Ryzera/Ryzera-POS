import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateSaleSchema, CreateSaleDto } from './schema/create-sale.schema';
import { ProcessPaymentSchema, ProcessPaymentDto } from './schema/process-payment.schema';
import { ReturnsService } from '../returns/returns.service';
import { CreateReturnSchema } from '../returns/schema/create-return.schema';
import { ZodIssue } from 'zod';

// Zod's raw `issues` are objects ({ code, message, path, ... }) — sending
// them straight to the client renders as "[object Object]" once the
// frontend tries to display them. Reduce each issue to a readable
// "field: message" string instead.
function formatZodIssues(issues: ZodIssue[]): string[] {
    return issues.map((issue) => {
        const field = issue.path.join('.');
        return field ? `${field}: ${issue.message}` : issue.message;
    });
}

@Controller('billing')
export class BillingController {
    constructor(
        private billingService: BillingService,
        private returnsService: ReturnsService,
    ) {}

    @Post('sales')
    createSale(@Body() body: unknown) {
        const result = CreateSaleSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestException(formatZodIssues(result.error.issues));
        }
        return this.billingService.createSale(result.data);
    }

    @Post('sales/payment')
    processPayment(@Body() body: unknown) {
        const result = ProcessPaymentSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestException(formatZodIssues(result.error.issues));
        }
        return this.billingService.processPayment(result.data);
    }

    @Patch('sales/:id/cancel')
    cancelSale(@Param('id', ParseIntPipe) id: number) {
        return this.billingService.cancelSale(id);
    }

    @Get('sales/:id')
    getSaleById(@Param('id', ParseIntPipe) id: number) {
        return this.billingService.getSaleById(id);
    }

    @Get('sales')
    getAllSales(@Query('branch_id') branch_id?: string) {
        return this.billingService.getAllSales(branch_id);
    }

    // Cashier checkout screen — GET /api/billing/discounts/branch/1
    // branch_id here refers to discount_rule.branch_id, which is Int.
    @Get('discounts/branch/:branchId')
    getAvailableDiscounts(@Param('branchId', ParseIntPipe) branchId: number) {
        return this.billingService.getAvailableDiscounts(branchId);
    }

    @Post('sales/returns')
    processReturn(@Body() body: unknown) {
        const result = CreateReturnSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestException(formatZodIssues(result.error.issues));
        }
        return this.returnsService.processReturn(result.data);
    }
}