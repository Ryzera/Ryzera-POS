export type AuditAction = 'Generated' | 'Exported PDF' | 'Exported CSV';

// ─── One row exactly as returned by AuditLogService.getAuditLogs() ──────────
export interface AuditLogEntry {
    id:          number;
    username:    string;
    role:        string;
    action:      AuditAction;
    reportType:  string | null;
    filtersUsed: string | null;
    branchName:  string | null;
    created_at:  string;
    time:        string;    // pre-formatted e.g. "09:14 AM"
    createdAt:   string;    // full ISO string
}

export interface AuditLogPagination {
    currentPage:  number;
    totalPages:   number;
    totalRecords: number;
    limit:        number;
    hasNextPage:  boolean;
    hasPrevPage:  boolean;
}

export interface AuditLogResponse {
    data:       AuditLogEntry[];
    pagination: AuditLogPagination;
}

export interface AuditLogQueryParams {
    username?:   string;
    date?:       string;
    action?:     AuditAction;
    reportType?: string;
    page?:       number;
    limit?:      number;
}

export type AuditLogExportFormat = 'csv' | 'pdf';