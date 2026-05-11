import { z } from 'zod';

// ─── Create User ──────────────────────────────────────
export const CreateUserSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6),
    company_id: z.number().positive(),
    branch_id: z.number().positive().optional(),
    user_type: z.enum(['ADMIN', 'STAFF']).default('STAFF'),

    // UserInfo
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    profile_picture: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

// ─── Update User ──────────────────────────────────────
export const UpdateUserSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    branch_id: z.number().positive().optional().nullable(),
    user_type: z.enum(['ADMIN', 'STAFF']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),

    // UserInfo
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    profile_picture: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

// ─── Assign Role ──────────────────────────────────────
export const AssignRoleSchema = z.object({
    roleId: z.number().positive(),
});

export type AssignRoleDto = z.infer<typeof AssignRoleSchema>;

// ─── User Filter (query params) ───────────────────────
export const UserFilterSchema = z.object({
    company_id: z.coerce.number().positive().optional(),
    branch_id: z.coerce.number().positive().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    user_type: z.enum(['ADMIN', 'STAFF']).optional(),
    search: z.string().optional(),
});

export type UserFilterDto = z.infer<typeof UserFilterSchema>;