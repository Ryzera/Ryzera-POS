// ============================================================
// Low Stock Alerts Hook
// File: src/hooks/useLowStockAlerts.ts
// ============================================================

import { useEffect, useState }    from 'react';
import { fetchLowStockAlerts }    from '@/api/dashboard.api';
import type { LowStockData }      from '@/types/dashboard.types';

export function useLowStockAlerts(branchId?: number) {
    const [data,      setData]      = useState<LowStockData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error,     setError]     = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetchLowStockAlerts(branchId)
            .then(res  => { if (!cancelled) setData(res); })
            .catch(err => { if (!cancelled) setError(err?.message ?? 'Failed to load low stock alerts'); })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, [branchId]);

    return { data, isLoading, error };
}