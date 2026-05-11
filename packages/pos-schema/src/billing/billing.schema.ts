import { z } from 'zod';

export const CreateBillItemSchema = z.object({
    product_id: z.number().positive(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
});

export const CreateBillSchema = z.object({
    branch_id: z.number().positive(),
    payment_method: z.enum(['CASH', 'CARD', 'ONLINE']).default('CASH'),
    items: z.array(CreateBillItemSchema).min(1, 'At least one item required'),
    discount: z.number().min(0).default(0),
    notes: z.string().optional(),
});

export type CreateBillDto = z.infer<typeof CreateBillSchema>;
export type CreateBillItemDto = z.infer<typeof CreateBillItemSchema>;