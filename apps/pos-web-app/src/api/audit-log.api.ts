import api from '@/lib/api';
import type {
    AuditLogExportFormat,
    AuditLogQueryParams,
    AuditLogResponse,
} from '@/types/audit-log.types';

function toBackendParams(p: AuditLogQueryParams): Record<string, string> {
    const result: Record<string, string> = {};
    if (p.username)   result.username   = p.username;
    if (p.date)       result.date       = p.date;
    if (p.action)     result.action     = p.action;
    if (p.reportType) result.reportType = p.reportType;
    return result;
}

// ─── GET /audit-log ───────────────────────────────────────────────────────────
export const fetchAuditLogs = async (params: AuditLogQueryParams): Promise<AuditLogResponse> => {
  const res = await api.get('/audit-log', {
    params: {
      ...toBackendParams(params),
      page:  String(params.page ?? 1),
      limit: String(params.limit ?? 50),
    },
  });
  return res.data.data;
};

// ─── GET /audit-log/export?format=csv|pdf ────────────────────────────────────
export const exportAuditLog = async (
    format: AuditLogExportFormat,
    filters: Omit<AuditLogQueryParams, 'page' | 'limit'>,
): Promise<Blob> => {
    const { data } = await api.get<Blob>('/audit-log/export', {
        params:       { ...toBackendParams(filters), format },
        responseType: 'blob',
    });
    return data;
};

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}