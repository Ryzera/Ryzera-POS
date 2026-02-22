import { z } from 'zod';

// Push Data Validation
export const PushSchema = z.object({
  entity: z.enum(['product', 'sale', 'user', 'inventory']),
  payload: z.record(z.any()).optional(),
});

// Retry Validation
export const RetrySchema = z.object({
  id: z.string().uuid(),
});

// Settings Validation
export const SettingSchema = z.object({
  value: z.string().min(1),
  description: z.string().optional(),
});

// Export types
export type PushDto = z.infer<typeof PushSchema>;
export type RetryDto = z.infer<typeof RetrySchema>;
export type SettingDto = z.infer<typeof SettingSchema>;