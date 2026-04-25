import { z } from 'zod';

/**
 * Validates setting creation requests.
 * companyId and branchId are optional to allow global settings.
 */
export const CreateSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'BRANCH']).default('GLOBAL'),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
});

/**
 * Validates setting update requests.
 */
export const UpdateSettingSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
});

export type CreateSettingDto = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingDto = z.infer<typeof UpdateSettingSchema>;