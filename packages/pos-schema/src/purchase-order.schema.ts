import { z } from 'zod';

const PurchaseOrderStatus = z.enum(['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED']);

export const CreatePurchaseOrderItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity:  z.number().int().min(1, 'Quantity must be at least 1'),
    unitCost:  z.number().positive('Unit cost must be positive'),
});

export const CreatePurchaseOrderSchema = z.object({
    supplierId:   z.number().int().positive(),
    branchId:     z.number().int().positive(),
    notes:        z.string().trim().max(500).optional(),
    stockAlertId: z.number().int().positive().optional(),
    items:        z.array(CreatePurchaseOrderItemSchema).min(1, 'At least one item required'),
});

export const UpdatePurchaseOrderStatusSchema = z.object({
    status: PurchaseOrderStatus,
    userId: z.number().int().positive(),
});

export const CreateInvoiceSchema = z.object({
    invoiceNo:   z.string().trim().min(1, 'Invoice number is required').max(50),
    totalAmount: z.number().positive('Total amount must be positive'),
    dueDate:     z.string().datetime().optional(),
    notes:       z.string().trim().max(500).optional(),
});

export type CreatePurchaseOrderDto      = z.infer<typeof CreatePurchaseOrderSchema>;
export type CreatePurchaseOrderItemDto  = z.infer<typeof CreatePurchaseOrderItemSchema>;
export type UpdatePurchaseOrderStatusDto = z.infer<typeof UpdatePurchaseOrderStatusSchema>;
export type CreateInvoiceDto            = z.infer<typeof CreateInvoiceSchema>;