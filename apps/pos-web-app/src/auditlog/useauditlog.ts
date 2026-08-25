// apps/pos-web-app/src/auditlog/useAuditLogs.ts
// REPLACE existing useauditlog.ts with this file
// (rename file to useAuditLogs.ts — capital L)

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api'; // ← uses your existing axios instance (token auto-attached)

export type LogAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'DELETE_USER'
    | 'ROLE_ASSIGNED'
    | 'PASSWORD_CHANGED';

export type LogStatus = 'SUCCESS' | 'FAILED';

export interface AuditLogItem {
    id: number;
    action: LogAction;
    status: LogStatus;
    ip_address: string | null;
    user_agent: string | null;
    device_info: string | null;
    created_at: string;
    branch_name?: string | null;
}

export interface PaginatedAuditLogs {
    data: AuditLogItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AuditLogFilters {
    action?: LogAction | '';
    status?: LogStatus | '';
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

export function useAuditLogs(userId: number, filters: AuditLogFilters = {}) {
    const [result, setResult] = useState<PaginatedAuditLogs | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Build query params — skip empty values
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });

            // Uses your api.ts axios instance — token already attached via interceptor
            const res = await api.get<PaginatedAuditLogs>(
                `/users/${userId}/audit-logs?${params.toString()}`
            );
            setResult(res.data);
        } catch (err: any) {
            setError(
                err.response?.data?.message ?? err.message ?? 'Failed to load audit logs'
            );
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, JSON.stringify(filters)]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { result, loading, error, refetch: fetchLogs };
}