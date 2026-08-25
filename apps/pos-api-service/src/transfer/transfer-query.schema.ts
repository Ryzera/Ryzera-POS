import { z } from 'zod';

const TransferStatus = z.enum(['PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED']);

export const TransferQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  sourceBranchId: z.coerce.number().int().positive().optional(),
  destinationBranchId: z.coerce.number().int().positive().optional(),
  status: TransferStatus.optional(),
});

export type TransferQueryDto = z.infer<typeof TransferQuerySchema>;
