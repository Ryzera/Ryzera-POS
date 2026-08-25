import { z } from 'zod';

const InventoryAction = z.enum([
  'CREATE',
  'UPDATE',
  'SALE',
  'RESTOCK',
  'DELETE',
  'TRANSFER',
  'ADJUSTMENT',
  'STOCK_TAKE',
  'RETURN_FROM_CUSTOMER',
  'RETURN_TO_SUPPLIER',
  'WASTE_DAMAGED',
]);

const AlertStatus = z.enum(['PENDING', 'SEEN', 'RESOLVED']);

export const BranchProductQuerySchema = z.object({
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
  branchId: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive().optional(),
  lowStock: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const InventoryLogQuerySchema = z.object({
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
  branchId: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive().optional(),
  action: InventoryAction.optional(),
});

export const StockAlertQuerySchema = z.object({
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
  branchId: z.coerce.number().int().positive().optional(),
  status: AlertStatus.optional(),
});

export type BranchProductQueryDto = z.infer<typeof BranchProductQuerySchema>;
export type InventoryLogQueryDto = z.infer<typeof InventoryLogQuerySchema>;
export type StockAlertQueryDto = z.infer<typeof StockAlertQuerySchema>;
