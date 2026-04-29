import { z } from 'zod';

export const CreateProductSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    cost_price: z.number().positive().optional(),
    quantity: z.number().int().min(0).default(0),
    min_quantity: z.number().int().min(0).default(0),
    company_id: z.number().positive(),
    branch_id: z.number().positive().optional(),
    is_active: z.boolean().default(true),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial().omit({
    company_id: true,
});

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;