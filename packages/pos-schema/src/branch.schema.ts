import { z } from 'zod';

export const CreateBranchSchema = z.object({
    name: z.string().min(2, 'Branch name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    phone: z
        .string()
        .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
        .optional(),
});

export const UpdateBranchSchema = z.object({
    name: z.string().min(2, 'Branch name must be at least 2 characters').optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    phone: z
        .string()
        .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
        .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type CreateBranchDto = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchDto = z.infer<typeof UpdateBranchSchema>;