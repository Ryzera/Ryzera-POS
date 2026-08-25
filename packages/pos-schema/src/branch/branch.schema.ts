import { z } from 'zod';

export const CreateBranchSchema = z.object({
    name:        z.string().trim().min(1, 'Name is required').max(100),
    code:        z.string().trim().min(2).max(20).optional(),
    address:     z.string().trim().max(255).optional(),
    phone:       z.string().trim().max(20).optional(),
    email:       z.string().trim().email().optional(),
    city:        z.string().trim().max(100).optional(),
    managerName: z.string().trim().max(100).optional(),
    status:      z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

export const UpdateBranchSchema = CreateBranchSchema.partial();

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;