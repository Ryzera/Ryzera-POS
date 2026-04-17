import { z } from 'zod';

// ─── Stock Status Enum ────────────────────────────────────────────────────────
export const StockStatusEnum = z.enum(['InStock', 'LowStock', 'OutOfStock']);
export type StockStatus = z.infer<typeof StockStatusEnum>;

// ─── Query Schema ─────────────────────────────────────────────────────────────
export const QueryInventoryStatusSchema = z.object({
    /**
     * Filter products by category name (case-insensitive partial match).
     * Example: "Dairy Products"
     */
    category: z
        .string()
        .trim()
        .min(1, 'Category must not be empty')
        .optional(),

    /**
     * Filter products by computed stock status.
     * Valid values: "InStock" | "LowStock" | "OutOfStock"
     */
    stockStatus: StockStatusEnum.optional(),

    /**
     * Target branch ID. Coerced from string query param to number.
     * SUPER_ADMIN can omit this to get aggregated data across all branches.
     * BRANCH_MANAGER always gets their own branchId injected by the controller.
     */
    branchId: z.coerce.number().int().positive().optional(),
});

export type QueryInventoryStatusDto = z.infer<typeof QueryInventoryStatusSchema>;