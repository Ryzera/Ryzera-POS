import { z } from 'zod';

export const CreateSupplierSchema = z.object({
    name:         z.string().trim().min(1, 'Name is required').max(150),
    contactName:  z.string().trim().max(100).optional(),
    email:        z.string().trim().email('Invalid email').optional(),
    phone:        z.string().trim().max(20).optional(),
    address:      z.string().trim().max(255).optional(),
    leadTimeDays: z.number().int().min(0).default(0),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>;