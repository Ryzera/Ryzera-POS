import { z } from 'zod';

export const ProcessPaymentSchema = z.object({
    sale_id: z.number().positive(),
    payment_method: z.enum(['Cash', 'Card', 'Split']),
    amount_paid: z.number().positive(),
    transaction_reference: z.string().optional(),
});

export type ProcessPaymentDto = z.infer<typeof ProcessPaymentSchema>;