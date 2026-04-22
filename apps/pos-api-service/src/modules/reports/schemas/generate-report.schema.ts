import { z } from 'zod';
import { ReportType } from '../enums/report-type.enum';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** ISO date string pattern (YYYY-MM-DD). */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for on-demand report generation requests.
 *
 * branchId   → Int  (matches auth Branch PK — not a UUID)
 * categoryId → UUID (matches inventory Category PK)
 */
export const GenerateReportSchema = z
    .object({
        reportType: z.nativeEnum(ReportType, {
            error: 'Invalid report type provided',
        }),

        startDate: z
            .string()
            .regex(DATE_REGEX, 'startDate must be in YYYY-MM-DD format'),

        endDate: z
            .string()
            .regex(DATE_REGEX, 'endDate must be in YYYY-MM-DD format'),

        /** Optional filter — null / omitted means "All Branches" */
        branchId: z
            .number()
            .int('branchId must be an integer')
            .positive('branchId must be a positive integer')
            .optional(),

        /** Optional filter — null / omitted means "All Categories" */
        categoryId: z
            .string()
            .min(1, 'categoryId must not be empty')
            .optional(),
    })
    .refine(
        (data) => new Date(data.startDate) <= new Date(data.endDate),
        {
            message: 'startDate must be before or equal to endDate',
            path:    ['startDate'],
        },
    );

export type GenerateReportDto = z.infer<typeof GenerateReportSchema>;