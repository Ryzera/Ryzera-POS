import { z } from 'zod';

export const CategoryListQuerySchema = z.object({
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

  search: z.string().trim().min(1).max(100).optional(),
});

export type CategoryListQueryDto = z.infer<typeof CategoryListQuerySchema>;
