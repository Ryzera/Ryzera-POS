import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/api/audit-log.api';
import type { AuditLogQueryParams } from '@/types/audit-log.types';

export const auditLogKeys = {
    all:  ['audit-log'] as const,
    list: (p: AuditLogQueryParams) => [...auditLogKeys.all, 'list', p] as const,
};

export function useAuditLogs(params: AuditLogQueryParams, enabled: boolean) {
    return useQuery({
        queryKey:  auditLogKeys.list(params),
        queryFn:   () => fetchAuditLogs(params),
        enabled,
        staleTime: 1000 * 30,
        retry:     1,
    });
}