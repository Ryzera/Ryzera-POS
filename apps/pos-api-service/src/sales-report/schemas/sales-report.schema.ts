import { z } from 'zod';

// ─── Query Schema ─────────────────────────────────────────────────────────────
// Used by all GET endpoints for filtering sales report data
export const QuerySalesReportSchema = z.object({
    dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFrom must be YYYY-MM-DD')
        .optional(),

    dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateTo must be YYYY-MM-DD')
        .optional(),

    // sale_status values in DB: Completed | Pending | Cancelled
    status: z
        .enum(['Completed', 'Pending', 'Cancelled'])
        .optional(),

    // Free-text search against invoice number
    search: z.string().trim().min(1).optional(),

    // Filter by category name (partial match)
    category: z.string().trim().min(1).optional(),

    // Filter by product name (partial match)
    product: z.string().trim().min(1).optional(),

    // branchId: coerce string query param to number
    branchId: z
        .string()
        .regex(/^\d+$/, 'branchId must be a positive integer')
        .transform(Number)
        .optional(),

    page: z
        .string()
        .regex(/^\d+$/, 'page must be a positive integer')
        .default('1')
        .transform(Number),

    limit: z
        .string()
        .regex(/^\d+$/, 'limit must be a positive integer')
        .default('10')
        .transform(Number),
});

// ─── Create Summary Schema ────────────────────────────────────────────────────
// Used by POST /reports/sales — creates a DailySummary record manually
export const CreateSummarySchema = z.object({
    summaryDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'summaryDate must be YYYY-MM-DD'),

    totalSales:        z.number().min(0).default(0),
    totalTransactions: z.number().min(0).default(0),
    totalItemsSold:    z.number().min(0).default(0),
    totalDiscounts:    z.number().min(0).default(0),
    totalTax:          z.number().min(0).default(0),
    grossProfit:       z.number().default(0),
    totalReturns:      z.number().min(0).default(0),
    totalCost:         z.number().min(0).default(0),
    totalCustomers:    z.number().min(0).default(0),
    netProfit:         z.number().default(0),

    branchId: z.number().int().positive().optional(),
});

// ─── Inferred TypeScript Types ────────────────────────────────────────────────
export type QuerySalesReportDto = z.infer<typeof QuerySalesReportSchema>;
export type CreateSummaryDto    = z.infer<typeof CreateSummarySchema>;