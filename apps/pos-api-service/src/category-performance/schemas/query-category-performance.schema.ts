import { z } from 'zod';

/**
 * Zod schema for Category Performance query parameters.
 *
 * All three params are optional individually but dateFrom + dateTo
 * must always appear together (both or neither).
 *
 * branchId coercion rules:
 *   - Not sent in query   → undefined   (All Branches — SUPER_ADMIN only)
 *   - Sent as "2"         → number 2    (single branch filter)
 *   - Sent as "0" or ""   → validation error (not a positive integer)
 */
export const QueryCategoryPerformanceSchema = z.object({
    /** ISO date string — start of the report range (inclusive) */
    dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateFrom must be in YYYY-MM-DD format' })
        .optional(),

    /** ISO date string — end of the report range (inclusive) */
    dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateTo must be in YYYY-MM-DD format' })
        .optional(),

    /**
     * Branch ID — numeric, coerced from query string.
     * SUPER_ADMIN: pass a branchId to scope to one branch; omit for all branches.
     * BRANCH_MANAGER: this value is always overridden in the controller.
     */
    branchId: z.coerce.number().int().positive().optional(),
}).refine(
    (data) => {
        // Both dates must be present together, or both absent.
        if (data.dateFrom && !data.dateTo) return false;
        if (data.dateTo && !data.dateFrom) return false;
        return true;
    },
    { message: 'Both dateFrom and dateTo must be provided together' },
).refine(
    (data) => {
        // If both dates are provided, dateFrom must not be after dateTo.
        if (data.dateFrom && data.dateTo) {
            return new Date(data.dateFrom) <= new Date(data.dateTo);
        }
        return true;
    },
    { message: 'dateFrom must not be after dateTo' },
);

export type QueryCategoryPerformanceDto = z.infer<typeof QueryCategoryPerformanceSchema>;