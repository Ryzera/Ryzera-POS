import { z } from 'zod';

export const updateCashierSchema = z.object({
    first_name:   z.string().min(1).optional(),
    last_name:    z.string().min(1).optional(),
    email:        z.string().email().optional(),
    phone_number: z.string().optional(),
    address:      z.string().optional(),
    branch_id:    z.number().int().positive().optional(),
    status:       z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type UpdateCashierDto = z.infer<typeof updateCashierSchema>;