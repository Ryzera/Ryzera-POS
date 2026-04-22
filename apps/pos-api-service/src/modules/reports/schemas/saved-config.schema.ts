import { z } from 'zod';
import { ReportType } from '../enums/report-type.enum';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DATE_REGEX        = /^\d{4}-\d{2}-\d{2}$/;
const CONFIG_NAME_MIN   = 3;
const CONFIG_NAME_MAX   = 100;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for saving a named report-filter configuration.
 * Users can save these and reload them quickly from the Reports Hub UI.
 *
 * branchId   → Int  (auth Branch PK)
 * categoryId → UUID (inventory Category PK)
 */
export const SaveReportConfigSchema = z
    .object({
        configName: z
            .string()
            .min(CONFIG_NAME_MIN, `Config name must be at least ${CONFIG_NAME_MIN} characters`)
            .max(CONFIG_NAME_MAX, `Config name must not exceed ${CONFIG_NAME_MAX} characters`)
            .trim(),

        reportType: z.nativeEnum(ReportType, {
            error: 'Invalid report type provided',
        }),

        startDate: z
            .string()
            .regex(DATE_REGEX, 'startDate must be in YYYY-MM-DD format'),

        endDate: z
            .string()
            .regex(DATE_REGEX, 'endDate must be in YYYY-MM-DD format'),

        branchId: z
            .number()
            .int('branchId must be an integer')
            .positive('branchId must be a positive integer')
            .optional(),

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

export type SaveReportConfigDto = z.infer<typeof SaveReportConfigSchema>;