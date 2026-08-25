import { z } from 'zod';

export const CreateProductSchema = z.object({
    name:         z.string().trim().min(1, 'Name is required'),
    code:         z.string().trim().min(1, 'Code is required'),
    sku:          z.string().trim().optional(),
    barcode:      z.string().trim().optional(),
    description:  z.string().trim().optional(),
    price:        z.number().positive('Price must be positive'),
    cost_price:   z.number().positive().optional(),
    quantity:     z.number().int().min(0).default(0),
    min_quantity: z.number().int().min(0).default(0),
    unit:         z.enum(['PCS', 'KG', 'PACK', 'LTR', 'BOX', 'MTR']).default('PCS'),
    status:       z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),
    company_id:   z.number().positive(),
    branch_id:    z.number().positive().optional(),
    category_id:  z.number().positive().optional(),
    supplier_id:  z.number().positive().optional(),
});

export const UpdateProductSchema = CreateProductSchema.omit({ company_id: true }).partial();

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;