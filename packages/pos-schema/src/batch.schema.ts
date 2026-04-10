import { z } from 'zod';

export const CreateBatchSchema = z.object({
    batchNumber: z.string().min(1),
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    manufactureDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional(),
});

export const UpdateBatchSchema = CreateBatchSchema.partial();

export type CreateBatchDto = z.infer<typeof CreateBatchSchema>;
export type UpdateBatchDto = z.infer<typeof UpdateBatchSchema>;