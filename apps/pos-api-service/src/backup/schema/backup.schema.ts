import { z } from 'zod';

/**
 * Validates backup creation requests.
 * companyId is optional - if not provided, creates backup for all companies.
 */
export const CreateBackupSchema = z.object({
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type CreateBackupDto = z.infer<typeof CreateBackupSchema>;