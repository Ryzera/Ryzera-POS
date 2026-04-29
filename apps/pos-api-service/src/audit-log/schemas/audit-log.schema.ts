import { z } from 'zod';

// ─── Audit Action Enum ────────────────────────────────────────────────────────
// Matches exactly what the UI dropdown shows.
export const AuditAction = {
    GENERATED:    'Generated',
    EXPORTED_PDF: 'Exported PDF',
    EXPORTED_CSV: 'Exported CSV',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

// ─── Schema: Record an audit event (used internally by other services) ────────
// This is NOT exposed as a REST endpoint body — it is called from service code.
export const RecordAuditSchema = z.object({
    userId:      z.number().int().positive(),
    username:    z.string().min(1).max(100),
    role:        z.string().min(1).max(50),
    action:      z.enum(['Generated', 'Exported PDF', 'Exported CSV']),
    reportType:  z.string().min(1).max(50),
    filtersUsed: z.string().max(200).default(''),
    branchName:  z.string().max(100).default('All'),
});

export type RecordAuditDto = z.infer<typeof RecordAuditSchema>;

// ─── Schema: Query / filter the audit log (GET endpoint) ─────────────────────
export const QueryAuditLogSchema = z.object({
    /** Free-text search against username */
    username: z.string().trim().min(1).optional(),

    /** Filter to a specific calendar day — ISO date YYYY-MM-DD */
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
        .optional(),

    /** Filter by action type */
    action: z
        .enum(['Generated', 'Exported PDF', 'Exported CSV'])
        .optional(),

    /** Filter by report type label */
    reportType: z.string().trim().min(1).optional(),

    /** Pagination */
    page: z
        .string()
        .regex(/^\d+$/, 'page must be a positive integer')
        .default('1')
        .transform(Number),

    limit: z
        .string()
        .regex(/^\d+$/, 'limit must be a positive integer')
        .default('50')
        .transform(Number),
});

export type QueryAuditLogDto = z.infer<typeof QueryAuditLogSchema>;

// ─── Schema: Export format query param ───────────────────────────────────────
export const ExportAuditLogSchema = z.object({
    format: z.enum(['csv', 'pdf'], {
        error: 'format must be "csv" or "pdf"',
    }),

    // Same filters as the query schema — admin exports the currently filtered view
    username:   z.string().trim().min(1).optional(),
    date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    action:     z.enum(['Generated', 'Exported PDF', 'Exported CSV']).optional(),
    reportType: z.string().trim().min(1).optional(),
});

export type ExportAuditLogDto = z.infer<typeof ExportAuditLogSchema>;