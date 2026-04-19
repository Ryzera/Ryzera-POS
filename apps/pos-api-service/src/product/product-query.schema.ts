import { z } from 'zod';

// Use string enums directly — pos-database enums used only in repository layer
const ProductStatus = z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']);
const UnitOfMeasure = z.enum(['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR']);

export const ProductListQuerySchema = z.object({
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
  status: ProductStatus.optional(),
  unit: UnitOfMeasure.optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
});

export type ProductListQueryDto = z.infer<typeof ProductListQuerySchema>;
