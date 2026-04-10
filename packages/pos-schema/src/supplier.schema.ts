import { z } from 'zod';

export const CreateSupplierSchema = z.object({
    name: z.string().min(2),
    contactName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    leadTimeDays: z.number().int().min(0).default(0),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>;