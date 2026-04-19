import { z } from 'zod';

import { BranchStatus } from '@ryzera/pos-database';

export const BranchListQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100, 'limit must be <= 100')),

  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1, 'page must be >= 1')),

  search: z.string().trim().min(1).max(100).optional(),

  status: z.nativeEnum(BranchStatus).optional(),
});

export type BranchListQueryDto = z.infer<typeof BranchListQuerySchema>;
