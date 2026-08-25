import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountRuleDto } from './dto/create-discount-rule.schema';

@Injectable()
export class DiscountRuleService {
    constructor(private prisma: PrismaService) {}

    // ── Create Rule ───────────────────────────────────────
    async createRule(
        dto: CreateDiscountRuleDto,
        userType: string,
        userBranchId: number,
    ) {
        if (dto.scope === 'GLOBAL' && userType !== 'ADMIN') {
            throw new ForbiddenException(
                'Only Super Admin can create GLOBAL discount rules',
            );
        }

        if (dto.scope === 'BRANCH') {
            if (!dto.branch_id) {
                throw new BadRequestException(
                    'branch_id is required for BRANCH scope rules',
                );
            }
            if (userType !== 'ADMIN' && userBranchId !== dto.branch_id) {
                throw new ForbiddenException(
                    'Branch Manager can only create rules for own branch',
                );
            }
        }

        // NOTE: schema has a single `max_value` field covering both
        // PERCENTAGE and FIXED types (no separate max_percent/max_amount).
        if (dto.discount_type === 'PERCENTAGE' && !dto.max_percent) {
            throw new BadRequestException(
                'max_percent is required for PERCENTAGE type',
            );
        }

        if (dto.discount_type === 'FIXED' && !dto.max_amount) {
            throw new BadRequestException(
                'max_amount is required for FIXED type',
            );
        }

        if (new Date(dto.valid_from) >= new Date(dto.valid_until)) {
            throw new BadRequestException(
                'valid_from must be before valid_until',
            );
        }

        return this.prisma.discountRule.create({
            data: {
                // NOTE: schema requires `name` and `value` — make sure
                // CreateDiscountRuleDto actually provides these.
                name:         dto.name,
                value:        dto.value,
                scope:        dto.scope as any,
                type:         dto.discount_type as any,
                max_value:    dto.discount_type === 'PERCENTAGE'
                    ? dto.max_percent
                    : dto.max_amount,
                description:  dto.description,
                valid_from:   new Date(dto.valid_from),
                valid_until:  new Date(dto.valid_until),
                branch_id:    dto.scope === 'BRANCH' ? dto.branch_id : null,
                created_by:   dto.created_by,
                status:       'ACTIVE',
            },
        });
    }

    // ── Validate Discount Percent (billing.service call කරනවා) ──
    async validateDiscountPercent(
        discountPercent: number,
        branchId: number,
    ): Promise<void> {
        const now = new Date();

        // GLOBAL rules fetch
        const globalRules = await this.prisma.discountRule.findMany({
            where: {
                status:      'ACTIVE',
                scope:       'GLOBAL' as any,
                valid_from:  { lte: now },
                valid_until: { gte: now },
            },
        });

        // BRANCH rules fetch
        const branchRules = await this.prisma.discountRule.findMany({
            where: {
                status:      'ACTIVE',
                scope:       'BRANCH' as any,
                branch_id:   branchId,
                valid_from:  { lte: now },
                valid_until: { gte: now },
            },
        });

        // GLOBAL check
        if (globalRules.length > 0) {
            const globalMax = Math.min(
                ...globalRules.map((r) => Number(r.max_value ?? 100)),
            );
            if (discountPercent > globalMax) {
                throw new BadRequestException(
                    `Discount cannot exceed ${globalMax}%. Chain-wide rule applies.`,
                );
            }
        }

        // BRANCH check
        if (branchRules.length > 0) {
            const branchMax = Math.min(
                ...branchRules.map((r) => Number(r.max_value ?? 100)),
            );
            if (discountPercent > branchMax) {
                throw new BadRequestException(
                    `Discount cannot exceed ${branchMax}%. Branch rule applies.`,
                );
            }
        }
    }

    // ── Get Active Rules for Branch (Cashier) ─────────────
    async getActiveRulesForBranch(branchId: number) {
        const now   = new Date();
        const rules = await this.prisma.discountRule.findMany({
            where: {
                status:      'ACTIVE',
                valid_from:  { lte: now },
                valid_until: { gte: now },
                OR: [
                    { scope: 'GLOBAL' as any },
                    { scope: 'BRANCH' as any, branch_id: branchId },
                ],
            },
            orderBy: { scope: 'asc' },
        });

        return rules.map((rule) => ({
            discount_rule_id: rule.id,
            scope:            rule.scope,
            scope_label:      rule.scope === 'GLOBAL'
                ? '🌐 Chain-wide Discount'
                : '🏪 Branch Discount',
            type: rule.type,
            // NOTE: schema no longer distinguishes max_percent/max_amount —
            // both are stored in max_value. Splitting them back out by type
            // here for backward compatibility with API consumers.
            max_percent: rule.type === 'PERCENTAGE' && rule.max_value
                ? Number(rule.max_value)
                : null,
            max_amount: rule.type === 'FIXED' && rule.max_value
                ? Number(rule.max_value)
                : null,
            description: rule.description,
            valid_until: rule.valid_until,
        }));
    }

    // ── Get All Rules ─────────────────────────────────────
    async getAllRules() {
        return this.prisma.discountRule.findMany({
            orderBy: { created_at: 'desc' },
        });
    }

    // ── Get Rule By ID ────────────────────────────────────
    async getRuleById(ruleId: number) {
        const rule = await this.prisma.discountRule.findUnique({
            where: { id: ruleId },
        });
        if (!rule) throw new NotFoundException('Discount rule not found');
        return rule;
    }

    // ── Deactivate Rule ───────────────────────────────────
    async deactivateRule(ruleId: number, userType: string) {
        await this.getRuleById(ruleId);

        if (userType !== 'ADMIN') {
            throw new ForbiddenException(
                'Only Admin can deactivate rules',
            );
        }

        return this.prisma.discountRule.update({
            where: { id: ruleId },
            data:  { status: 'INACTIVE' },
        });
    }
}
