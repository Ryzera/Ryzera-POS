import { z } from 'zod';

const InventoryAction = z.enum([
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

// Assign product to a branch
export const AssignProductToBranchSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    branchId:  z.string().uuid('Invalid branch ID'),
    stockQty:  z.number().int().min(0).default(0),
});

// Manual stock adjustment
export const AdjustStockSchema = z.object({
    changeQty:   z.number().int(),
    action:      InventoryAction,
    description: z.string().trim().max(255).optional(),
});

export type AssignProductToBranchDto = z.infer<typeof AssignProductToBranchSchema>;
export type AdjustStockDto = z.infer<typeof AdjustStockSchema>;