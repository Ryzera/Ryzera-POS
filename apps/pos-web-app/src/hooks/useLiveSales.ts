
import { useEffect, useState, useCallback } from 'react';
import { fetchLiveSales }                   from '@/api/dashboard.api';
import type { LiveSalesData }               from '@/types/dashboard.types';

const POLL_INTERVAL_MS = 30_000;

export function useLiveSales(branchId?: number) {
    const [data,        setData]        = useState<LiveSalesData | null>(null);
    const [isLoading,   setIsLoading]   = useState(true);
    const [error,       setError]       = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false); // flashes true on each poll

    const load = useCallback(async (isInitial: boolean) => {
        if (!isInitial) setIsRefreshing(true);
        try {
            const res = await fetchLiveSales(branchId);
            setData(res);
            setError(null);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load live sales');
        } finally {
            setIsLoading(false);
            // Brief flash — reset after 600ms so the animation is visible
            if (!isInitial) setTimeout(() => setIsRefreshing(false), 600);
        }
    }, [branchId]);

    useEffect(() => {
        setIsLoading(true);
        load(true);
        const timer = setInterval(() => load(false), POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [load]);

    return { data, isLoading, error, isRefreshing };
}