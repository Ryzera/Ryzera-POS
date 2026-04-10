import { z } from 'zod';

export const AdjustStockSchema = z.object({
    branchId: z.string().uuid(),
    productId: z.string().uuid(),
    changeQty: z.number().int(),
    action: z.enum([
        'RESTOCK',
        'ADJUSTMENT',
        'STOCK_TAKE',
        'WASTE_DAMAGED',
        'RETURN_FROM_CUSTOMER',
        'RETURN_TO_SUPPLIER',
        'TRANSFER',
    ]),
    description: z.string().optional(),
});

export const ResolveAlertSchema = z.object({
    status: z.enum(['SEEN', 'RESOLVED']),
});

export type AdjustStockDto = z.infer<typeof AdjustStockSchema>;
export type ResolveAlertDto = z.infer<typeof ResolveAlertSchema>;