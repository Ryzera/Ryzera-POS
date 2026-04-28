import { z } from 'zod';

export const RegisterSchema = z.object({
    name:     z.string().trim().min(1, 'Name is required').max(100),
    email:    z.string().trim().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role:     z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
    branchId: z.string().uuid('Invalid branch ID').optional(),
});

export const LoginSchema = z.object({
    email:    z.string().trim().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto    = z.infer<typeof LoginSchema>;