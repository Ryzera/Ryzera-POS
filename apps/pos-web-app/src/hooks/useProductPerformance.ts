
import { useQuery } from '@tanstack/react-query';
import {
    fetchProductKpiCards,
    fetchTopProducts,
    fetchProductPaymentMethods,
    fetchPerBranchSummary,
    fetchProductTable,
} from '@/api/product-performance.api';
import type { ProductPerformanceQueryParams } from '@/types/product-performance.types';

// ─── Query key factory ────────────────────────────────────────────────────────
export const productPerformanceKeys = {
    all:            ['productPerformance'] as const,
    cards:          (p: ProductPerformanceQueryParams) => [...productPerformanceKeys.all, 'cards',          p] as const,
    topProducts:    (p: ProductPerformanceQueryParams) => [...productPerformanceKeys.all, 'topProducts',    p] as const,
    paymentMethods: (p: ProductPerformanceQueryParams) => [...productPerformanceKeys.all, 'paymentMethods', p] as const,
    perBranch:      (p: ProductPerformanceQueryParams) => [...productPerformanceKeys.all, 'perBranch',      p] as const,
    table:          (p: ProductPerformanceQueryParams) => [...productPerformanceKeys.all, 'table',          p] as const,
};

/** Shared query config — 5-minute stale time, 1 retry */
const queryConfig = (enabled: boolean) => ({
    enabled,
    staleTime: 1000 * 60 * 5,
    retry:     1,
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useProductKpiCards = (
    p: ProductPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: productPerformanceKeys.cards(p),
        queryFn:  () => fetchProductKpiCards(p),
        ...queryConfig(enabled),
    });

export const useTopProducts = (
    p: ProductPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: productPerformanceKeys.topProducts(p),
        queryFn:  () => fetchTopProducts(p),
        ...queryConfig(enabled),
    });

export const useProductPaymentMethods = (
    p: ProductPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: productPerformanceKeys.paymentMethods(p),
        queryFn:  () => fetchProductPaymentMethods(p),
        ...queryConfig(enabled),
    });

export const usePerBranchSummary = (
    p: ProductPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: productPerformanceKeys.perBranch(p),
        queryFn:  () => fetchPerBranchSummary(p),
        ...queryConfig(enabled),
    });

export const useProductTable = (
    p: ProductPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: productPerformanceKeys.table(p),
        queryFn:  () => fetchProductTable(p),
        ...queryConfig(enabled),
    });