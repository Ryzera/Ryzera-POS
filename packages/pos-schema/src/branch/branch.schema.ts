import { z } from 'zod';

export const CreateBranchSchema = z.object({
    company_id: z.number().positive(),
    name: z.string().min(2),
    code: z.string().min(2).max(20),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    city: z.string().optional(),
    manager_name: z.string().optional(),
});

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;

export const UpdateBranchSchema = CreateBranchSchema.omit({
    company_id: true,
}).partial().extend({
    is_active: z.boolean().optional(),
});

export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;