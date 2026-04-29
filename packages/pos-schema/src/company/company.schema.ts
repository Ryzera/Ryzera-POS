import { z } from 'zod';

export const CreateCompanySchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(20),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;

export const UpdateCompanySchema = CreateCompanySchema.partial().extend({
    is_active: z.boolean().optional(),
});

export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;