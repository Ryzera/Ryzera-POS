import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    branchId: z.string().uuid().optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;