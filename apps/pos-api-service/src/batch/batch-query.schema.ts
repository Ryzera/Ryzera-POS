import { z } from 'zod';

export const BatchQuerySchema = z.object({
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
  productId: z.string().optional(),
  // expiring within N days
  expiringInDays: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(1).optional()),
  // only expired batches
  expired: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export type BatchQueryDto = z.infer<typeof BatchQuerySchema>;
