// ============================================================
// Dashboard KPI Hook
// File: src/hooks/useDashboardKpi.ts
// ============================================================

import { useEffect, useState } from 'react';
import { fetchKpiCards }       from '@/api/dashboard.api';
import type { DashboardKpiData } from '@/types/dashboard.types';

export function useDashboardKpi(branchId?: number) {
    const [data,      setData]      = useState<DashboardKpiData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error,     setError]     = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetchKpiCards(branchId)
            .then(res  => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err?.message ?? 'Failed to load KPIs'); })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, [branchId]);

    return { data, isLoading, error };
}