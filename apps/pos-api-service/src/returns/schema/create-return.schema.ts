import { z } from 'zod';

export const CreateReturnSchema = z.object({
    sale_id: z.number().positive(),
    reason: z.string().min(5),
    refund_method: z.enum(['Cash', 'Card', 'Wallet']),
    items: z.array(z.object({
        sale_item_id: z.number().positive(),
        quantity_returned: z.number().min(0.1),
        item_condition: z.string().min(1),
    })).min(1),
});

export type CreateReturnDto = z.infer<typeof CreateReturnSchema>;