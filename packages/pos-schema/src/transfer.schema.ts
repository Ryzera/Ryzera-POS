import { z } from 'zod';
export const CreateTransferItemSchema = z.object({
    productId: z.number().int().positive('Invalid product ID'),
    quantity:  z.number().int().min(1, 'Quantity must be at least 1'),
});
export const CreateTransferSchema = z.object({
    sourceBranchId:      z.number().int().positive('Invalid source branch ID'),
    destinationBranchId: z.number().int().positive('Invalid destination branch ID'),
    notes:               z.string().trim().max(500).optional(),
    items:               z.array(CreateTransferItemSchema).min(1, 'At least one item required'),
}).refine(
    (data) => data.sourceBranchId !== data.destinationBranchId,
    { message: 'Source and destination branches must be different' },
);
export const UpdateTransferStatusSchema = z.object({
    status: z.enum(['SHIPPED', 'RECEIVED', 'CANCELLED']),
    userId: z.number().int().positive('Invalid user ID'),
});
export type CreateTransferDto       = z.infer<typeof CreateTransferSchema>;
export type CreateTransferItemDto   = z.infer<typeof CreateTransferItemSchema>;
export type UpdateTransferStatusDto = z.infer<typeof UpdateTransferStatusSchema>;