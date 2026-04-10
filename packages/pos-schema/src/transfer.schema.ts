import { z } from 'zod';

export const TransferItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
});

export const CreateTransferSchema = z.object({
    sourceBranchId: z.string().uuid(),
    destinationBranchId: z.string().uuid(),
    notes: z.string().optional(),
    items: z.array(TransferItemSchema).min(1),
});

export const UpdateTransferStatusSchema = z.object({
    status: z.enum(['PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED']),
});

export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;
export type UpdateTransferStatusDto = z.infer<typeof UpdateTransferStatusSchema>;