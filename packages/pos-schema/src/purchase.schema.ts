import { z } from 'zod';

export const PurchaseOrderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitCost: z.number().positive(),
});

export const CreatePurchaseOrderSchema = z.object({
    supplierId: z.string().uuid(),
    branchId: z.string().uuid(),
    notes: z.string().optional(),
    stockAlertId: z.string().uuid().optional(),
    items: z.array(PurchaseOrderItemSchema).min(1),
});

export const UpdatePurchaseOrderStatusSchema = z.object({
    status: z.enum(['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED']),
});

export const CreateInvoiceSchema = z.object({
    purchaseOrderId: z.string().uuid(),
    invoiceNo: z.string().min(1),
    totalAmount: z.number().positive(),
    dueDate: z.string().datetime().optional(),
    notes: z.string().optional(),
});

export const UpdateInvoiceStatusSchema = z.object({
    status: z.enum(['UNPAID', 'PAID', 'CANCELLED']),
});

export type CreatePurchaseOrderDto = z.infer<typeof CreatePurchaseOrderSchema>;
export type UpdatePurchaseOrderStatusDto = z.infer<typeof UpdatePurchaseOrderStatusSchema>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceStatusDto = z.infer<typeof UpdateInvoiceStatusSchema>;