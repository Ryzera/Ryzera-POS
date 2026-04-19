import { z } from 'zod';

const PurchaseOrderStatus = z.enum(['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED']);

export const PurchaseOrderQuerySchema = z.object({
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
  supplierId: z.string().optional(),
  branchId: z.string().optional(),
  status: PurchaseOrderStatus.optional(),
});

export type PurchaseOrderQueryDto = z.infer<typeof PurchaseOrderQuerySchema>;
