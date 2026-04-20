import { z } from 'zod';

// ─── Query Schema ──────────────────────────────────────────────────────────────

export const ProductPerformanceQuerySchema = z.object({
    dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFrom must be YYYY-MM-DD')
        .optional(),

    dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateTo must be YYYY-MM-DD')
        .optional(),

    category: z.string().trim().min(1).optional(),

    page: z
        .string()
        .regex(/^\d+$/, 'page must be a positive integer')
        .transform(Number)
        .refine((n) => n >= 1, 'page must be >= 1')
        .optional()
        .default(1),

    limit: z
        .string()
        .regex(/^\d+$/, 'limit must be a positive integer')
        .transform(Number)
        .refine((n) => n >= 1, 'limit must be >= 1')
        .optional()
        .default(10),

    branchId: z
        .string()
        .regex(/^\d+$/, 'branchId must be a positive integer')
        .transform(Number)
        .optional(),
});

export type ProductPerformanceQuery = z.infer<
    typeof ProductPerformanceQuerySchema
>;

// ─── Resolved Filter ───────────────────────────────────────────────────────────

export type ResolvedProductPerformanceFilter = ProductPerformanceQuery & {
    resolvedBranchId?: number;
};