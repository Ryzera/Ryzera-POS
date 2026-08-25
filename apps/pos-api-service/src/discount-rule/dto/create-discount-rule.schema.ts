import { z } from 'zod';

export const CreateDiscountRuleSchema = z.object({
    name:          z.string().min(1),
    value:         z.number().min(0),
    scope:         z.enum(['GLOBAL', 'BRANCH']),
    discount_type: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
    max_percent:   z.number().min(0).max(100).optional(),
    max_amount:    z.number().min(0).optional(),
    description:   z.string().optional(),
    valid_from:    z.string().datetime(),
    valid_until:   z.string().datetime(),
    branch_id:     z.number().int().positive().optional(),
    created_by:    z.number().int().positive(),
});

export type CreateDiscountRuleDto = z.infer<typeof CreateDiscountRuleSchema>;