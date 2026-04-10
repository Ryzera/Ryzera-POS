import { z } from 'zod';

export const CreateProductSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(1),
    barcode: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive(),
    costPrice: z.number().positive().optional(),
    minStock: z.number().int().min(0).default(5),
    unit: z.enum(['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR']).default('PCS'),
    categoryId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
    status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;