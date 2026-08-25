import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { DiscountRuleService } from './discount-rule.service';
import { CreateDiscountRuleSchema } from './dto/create-discount-rule.schema';

// NOTE: no 'api/' prefix here — main.ts already sets a global prefix ('api'),
// so this controller only needs the resource path.
@Controller('discount-rules')
export class DiscountRuleController {
    constructor(private discountRuleService: DiscountRuleService) {}

    // POST /api/discount-rules
    @Post()
    async createRule(@Body() body: unknown) {
        const dto      = CreateDiscountRuleSchema.parse(body);
        // TODO: replace with real values once JWT/auth guard is wired in
        const userType = 'ADMIN'; // req.user.userType
        const branchId = 1;       // req.user.branchId
        return this.discountRuleService.createRule(dto, userType, branchId);
    }

    // GET /api/discount-rules
    @Get()
    async getAllRules() {
        return this.discountRuleService.getAllRules();
    }

    // GET /api/discount-rules/branch/:branchId
    // NOTE: this route must be declared before ':id' so 'branch' isn't
    // parsed as an :id param. branch_id is Int in the discount_rule table.
    @Get('branch/:branchId')
    async getActiveRulesForBranch(
        @Param('branchId', ParseIntPipe) branchId: number,
    ) {
        return this.discountRuleService.getActiveRulesForBranch(branchId);
    }

    // GET /api/discount-rules/:id
    @Get(':id')
    async getRuleById(@Param('id', ParseIntPipe) id: number) {
        return this.discountRuleService.getRuleById(id);
    }

    // PATCH /api/discount-rules/:id/deactivate
    @Patch(':id/deactivate')
    async deactivateRule(@Param('id', ParseIntPipe) id: number) {
        // TODO: replace with real value once JWT/auth guard is wired in
        const userType = 'ADMIN'; // req.user.userType
        return this.discountRuleService.deactivateRule(id, userType);
    }
}