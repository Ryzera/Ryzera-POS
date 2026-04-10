import { z } from 'zod';

export const CreateBranchSchema = z.object({
    name:       z.string().min(1),
    code:       z.string().min(1),
    company_id: z.number().int().positive(),
    address:    z.string().optional(),
    city:       z.string().optional(),
    phone:      z.string().optional(),
    email:      z.string().email().optional(),
});

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;