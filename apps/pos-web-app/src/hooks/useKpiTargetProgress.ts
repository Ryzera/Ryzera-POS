import { useEffect, useState } from 'react';
import { fetchKpiTargetProgress, type KpiTargetProgress } from '@/api/kpi-settings.api';

export function useKpiTargetProgress(branchId?: number) {
    const [data,      setData]      = useState<KpiTargetProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error,     setError]     = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        fetchKpiTargetProgress(branchId)
            .then(res  => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err?.message ?? 'Failed to load target progress'); })
            .finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, [branchId]);

    return { data, isLoading, error };
}
