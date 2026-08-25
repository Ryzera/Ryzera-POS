import { z } from 'zod';

// ─── Inventory Actions ────────────────────────────────
export const InventoryAction = z.enum([
    'CREATE',
    'UPDATE',
    'SALE',
    'RESTOCK',
    'DELETE',
    'TRANSFER',
    'ADJUSTMENT',
    'STOCK_TAKE',
    'RETURN_FROM_CUSTOMER',
    'RETURN_TO_SUPPLIER',
    'WASTE_DAMAGED',
]);

// ─── Assign Product to Branch ─────────────────────────
export const AssignProductToBranchSchema = z.object({
    productId: z.coerce.number().int().positive(),
    branchId:  z.coerce.number().int().positive(),
    stockQty:  z.number().int().min(0).default(0),
    minStock:  z.number().int().min(0).default(5),
});
export type AssignProductToBranchDto = z.infer<typeof AssignProductToBranchSchema>;

// ─── Manual Stock Adjustment ──────────────────────────
export const AdjustStockSchema = z.object({
    changeQty:   z.number().int(),
    action:      InventoryAction,
    description: z.string().trim().max(255).optional(),
});
export type AdjustStockDto = z.infer<typeof AdjustStockSchema>;

// ─── Legacy Product Schemas (old system) ─────────────
export const LegacyCreateProductSchema = z.object({
    name:         z.string().min(2),
    code:         z.string().min(2),
    description:  z.string().optional(),
    price:        z.number().positive(),
    cost_price:   z.number().positive().optional(),
    quantity:     z.number().int().min(0).default(0),
    min_quantity: z.number().int().min(0).default(0),
    company_id:   z.number().positive(),
    branch_id:    z.number().positive().optional(),
    is_active:    z.boolean().default(true),
});
export type LegacyCreateProductDto = z.infer<typeof LegacyCreateProductSchema>;

export const LegacyUpdateProductSchema = LegacyCreateProductSchema.partial().omit({ company_id: true });
export type LegacyUpdateProductDto = z.infer<typeof LegacyUpdateProductSchema>;