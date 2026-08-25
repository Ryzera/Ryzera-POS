import { z } from 'zod';

export const CreateBranchSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    address: z.string().trim().max(255).optional(),
    phone: z.string().trim().max(20).optional(),
});

export const UpdateBranchSchema = CreateBranchSchema.partial();

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;