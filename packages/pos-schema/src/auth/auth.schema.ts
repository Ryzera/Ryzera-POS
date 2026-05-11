import { z } from 'zod';

// ─── Login ───────────────────────────────────────────
export const LoginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// ─── Change Password ─────────────────────────────────
export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

// ─── JWT Payload ─────────────────────────────────────
export const JwtPayloadSchema = z.object({
    userId: z.number(),
    companyId: z.number(),
    branchId: z.number().nullable(),
    roles: z.array(z.string()),
    userType: z.enum(['ADMIN', 'STAFF']),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;