import { z } from 'zod';

/**
 * Ensures that every incoming sync request contains valid, complete data.
 * Invalid requests are rejected early, preventing corrupt or incomplete records
 * from entering the sync queue.
 */
export const PushSyncSchema = z.object({
  companyId: z.string().uuid().optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  entity: z.string().min(1, 'Entity is required'),
  payload: z.record(z.string(), z.any()).refine(val => Object.keys(val).length > 0, {
    message: 'Payload cannot be empty',
  }),
});

export type PushSyncDto = z.infer<typeof PushSyncSchema>;