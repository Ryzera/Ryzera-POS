import { z } from 'zod';

export const FailSyncSchema = z.object({
  errorMessage: z.string().min(1, 'Error message is required'),
});

export type FailSyncDto = z.infer<typeof FailSyncSchema>;