// ============================================================
// Sales Trend Hook
// File: src/hooks/useSalesTrend.ts
// ============================================================

import { useEffect, useState }  from 'react';
import { fetchSalesTrend }      from '@/api/dashboard.api';
import type { SalesTrendData }  from '@/types/dashboard.types';

export function useSalesTrend(branchId?: number) {
    const [data,      setData]      = useState<SalesTrendData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error,     setError]     = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetchSalesTrend(branchId)
            .then(res  => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err?.message ?? 'Failed to load sales trend'); })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, [branchId]);

    return { data, isLoading, error };
}