import { z } from 'zod';

export const createCashierSchema = z.object({
    username:     z.string().min(3, 'Username min 3 characters').max(50),
    password:     z.string().min(6, 'Password min 6 characters'),
    first_name:   z.string().min(1),
    last_name:    z.string().min(1),
    email:        z.string().email().optional(),
    phone_number: z.string().optional(),
    address:      z.string().optional(),
    branch_id:    z.number().int().positive(),
    user_type:    z.enum(['ADMIN', 'STAFF']).default('STAFF'),
});

export type CreateCashierDto = z.infer<typeof createCashierSchema>;