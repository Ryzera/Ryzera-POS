import { z } from 'zod';

// Validation constants
const MAX_DISCOUNT_PERCENT = 100;
const MAX_TAX_PERCENT = 100;
const MIN_QUANTITY = 0.01;

export const CreateSaleItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  quantity: z.number().min(MIN_QUANTITY),
  unit: z.string().min(1),
  unit_price: z.number().positive(),
  cost_price: z.number().positive(),
  discount_percent: z.number().min(0).max(MAX_DISCOUNT_PERCENT).optional(),
  tax_percent: z.number().min(0).max(MAX_TAX_PERCENT).optional(),
});

export const CreateSaleSchema = z.object({
  branch_id: z.string().uuid(),
  user_id: z.string().uuid(),
  items: z.array(CreateSaleItemSchema).min(1),
  discount_type: z.enum(['item', 'bill']).optional(),
  bill_discount_percent: z.number().min(0).max(MAX_DISCOUNT_PERCENT).optional(),
});

export type CreateSaleDto = z.infer<typeof CreateSaleSchema>;
export type CreateSaleItemDto = z.infer<typeof CreateSaleItemSchema>;
