import { z } from 'zod';

export const CreateBranchSchema = z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    phone: z.string().optional(),
});

export const UpdateBranchSchema = CreateBranchSchema.partial().extend({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;