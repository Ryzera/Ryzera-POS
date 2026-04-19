import { z } from 'zod';

// Mirrored from pos-database enums — keeps pos-schema dependency-free
const ProductStatus = z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']);
const UnitOfMeasure = z.enum(['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR']);

export const CreateProductSchema = z.object({
    name:        z.string().trim().min(1, 'Name is required').max(150),
    sku:         z.string().trim().min(1, 'SKU is required').max(50),
    barcode:     z.string().trim().max(100).optional(),
    description: z.string().trim().max(500).optional(),
    price:       z.number().positive('Price must be positive'),
    costPrice:   z.number().positive('Cost price must be positive').optional(),
    minStock:    z.number().int().min(0).default(5),
    unit:        UnitOfMeasure.default('PCS'),
    status:      ProductStatus.default('ACTIVE'),
    categoryId:  z.string().uuid('Invalid category ID').optional(),
    supplierId:  z.string().uuid('Invalid supplier ID').optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;