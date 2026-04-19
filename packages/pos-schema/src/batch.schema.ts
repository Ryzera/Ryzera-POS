import { z } from 'zod';

export const CreateBatchSchema = z.object({
    productId:       z.string().uuid('Invalid product ID'),
    batchNumber:     z.string().trim().min(1, 'Batch number is required').max(100),
    quantity:        z.number().int().min(1, 'Quantity must be at least 1'),
    manufactureDate: z.string().datetime().optional(),
    expiryDate:      z.string().datetime().optional(),
}).refine(
    (data) => {
        if (data.manufactureDate && data.expiryDate) {
            return new Date(data.expiryDate) > new Date(data.manufactureDate);
        }
        return true;
    },
    { message: 'Expiry date must be after manufacture date' },
);

export const UpdateBatchSchema = CreateBatchSchema.partial().omit({ productId: true });

export type CreateBatchDto = z.infer<typeof CreateBatchSchema>;
export type UpdateBatchDto = z.infer<typeof UpdateBatchSchema>;