import { z } from 'zod';

// ─── Create Role ──────────────────────────────────────
export const CreateRoleSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().optional(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

// ─── Update Role ──────────────────────────────────────
export const UpdateRoleSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().optional(),
});

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;

// ─── Create Authority ─────────────────────────────────
export const CreateAuthoritySchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
});

export type CreateAuthorityDto = z.infer<typeof CreateAuthoritySchema>;

// ─── Assign Authority to Role ─────────────────────────
export const AssignAuthoritySchema = z.object({
    authorityId: z.number().positive(),
});

export type AssignAuthorityDto = z.infer<typeof AssignAuthoritySchema>;