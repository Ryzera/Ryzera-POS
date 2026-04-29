// ============================================================
// Daily Summary — Zod Validation Schema
// File: apps/pos-api-service/src/daily-summary/schemas/daily-summary.schema.ts
//
// Validates and transforms query params from the HTTP request.
// date     → YYYY-MM-DD string (optional — controller returns message if missing)
// branchId → coerced to positive integer (SUPER_ADMIN only; others locked by controller)
// ============================================================

import { z } from 'zod';

export const QueryDailySummarySchema = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
        .optional(),

    branchId: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive({ message: 'branchId must be a positive integer' }))
        .optional(),
});

export type QueryDailySummaryInput = z.infer<typeof QueryDailySummarySchema>;