import { z } from 'zod';

/**
 * Zod schema for Profit & Loss query parameters.
 * Replaces the old class-validator DTO.
 *
 * Rules:
 *  - dateFrom and dateTo are optional ISO date strings (YYYY-MM-DD)
 *  - branchId is optional; must be a positive integer when provided
 *  - If dateFrom/dateTo are both present, dateTo must not be before dateFrom
 */
export const profitLossQuerySchema = z
    .object({
        dateFrom: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFrom must be in YYYY-MM-DD format')
            .optional(),

        dateTo: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateTo must be in YYYY-MM-DD format')
            .optional(),

        branchId: z
            .string()
            .regex(/^\d+$/, 'branchId must be a positive integer')
            .transform(Number)
            .pipe(z.number().int().positive('branchId must be a positive integer'))
            .optional(),
    })
    .refine(
        (data) => {
            if (data.dateFrom && data.dateTo) {
                return new Date(data.dateTo) >= new Date(data.dateFrom);
            }
            return true;
        },
        { message: 'dateTo must be on or after dateFrom', path: ['dateTo'] },
    );

/** Inferred TypeScript type from the schema */
export type ProfitLossQuery = z.infer<typeof profitLossQuerySchema>;