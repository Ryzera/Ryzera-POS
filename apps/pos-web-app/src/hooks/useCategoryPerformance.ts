
import { useQuery } from '@tanstack/react-query';
import {
    fetchCategoryKpi,
    fetchRevenueByCategory,
    fetchProfitByCategory,
    fetchCategoryTable,
    fetchCategoryByBranch,
    fetchCategoryBranches,
} from '@/api/category-performance.api';
import type { CategoryPerformanceQueryParams } from '@/types/category-performance.types';

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Explicit primitives — undefined branchId becomes 'all' so it never collapses
// with a numeric branchId during JSON.stringify comparison.
//
// Key shape: ['categoryPerformance', '<type>', dateFrom, dateTo, branchId|'all']
export const categoryPerfKeys = {
    all: ['categoryPerformance'] as const,

    kpi: (p: CategoryPerformanceQueryParams) =>
        [
            'categoryPerformance',
            'kpi',
            p.dateFrom ?? '',
            p.dateTo   ?? '',
            p.branchId ?? 'all',
        ] as const,

    barChart: (p: CategoryPerformanceQueryParams) =>
        [
            'categoryPerformance',
            'barChart',
            p.dateFrom ?? '',
            p.dateTo   ?? '',
            p.branchId ?? 'all',
        ] as const,

    pieChart: (p: CategoryPerformanceQueryParams) =>
        [
            'categoryPerformance',
            'pieChart',
            p.dateFrom ?? '',
            p.dateTo   ?? '',
            p.branchId ?? 'all',
        ] as const,

    table: (p: CategoryPerformanceQueryParams) =>
        [
            'categoryPerformance',
            'table',
            p.dateFrom ?? '',
            p.dateTo   ?? '',
            p.branchId ?? 'all',
        ] as const,

    byBranch: (p: CategoryPerformanceQueryParams) =>
        [
            'categoryPerformance',
            'byBranch',
            p.dateFrom ?? '',
            p.dateTo   ?? '',
            'all', // by-branch always fetches every branch — no single branchId
        ] as const,
};

// ─── Query Config ─────────────────────────────────────────────────────────────
//
// staleTime: 0
//   Forces a fresh network request every time the query key changes (i.e. every
//   branch switch). With staleTime > 0, cached data for the old key was served
//   silently while the new fetch ran — making the UI look unchanged.
//
// placeholderData: undefined
//   TanStack Query v5 keeps the PREVIOUS data value when a key changes to one
//   with no cache entry. This is "keepPreviousData" on by default. It caused
//   the old branch's data to remain visible until the new fetch completed.
//   Setting undefined clears `data` immediately → loading skeletons show →
//   new branch data appears when the fetch completes. Clean, correct behaviour.
//
const queryConfig = (enabled: boolean) => ({
    enabled,
    staleTime:       0,         // always re-fetch — no silent stale serving
    placeholderData: undefined, // clear data on key change — no old-data bleed
    retry:           1,
});

// ─── Data Hooks ───────────────────────────────────────────────────────────────

export const useCategoryKpi = (
    p: CategoryPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: categoryPerfKeys.kpi(p),
        queryFn:  () => fetchCategoryKpi(p),
        ...queryConfig(enabled),
    });

export const useCategoryBarChart = (
    p: CategoryPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: categoryPerfKeys.barChart(p),
        queryFn:  () => fetchRevenueByCategory(p),
        ...queryConfig(enabled),
    });

export const useCategoryPieChart = (
    p: CategoryPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: categoryPerfKeys.pieChart(p),
        queryFn:  () => fetchProfitByCategory(p),
        ...queryConfig(enabled),
    });

export const useCategoryTable = (
    p: CategoryPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: categoryPerfKeys.table(p),
        queryFn:  () => fetchCategoryTable(p),
        ...queryConfig(enabled),
    });

export const useCategoryByBranch = (
    p: CategoryPerformanceQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: categoryPerfKeys.byBranch(p),
        queryFn:  () => fetchCategoryByBranch(p),
        ...queryConfig(enabled),
    });

// ─── Reference Data Hook (long cache — branch list rarely changes) ────────────
export const useCategoryBranches = () =>
    useQuery({
        queryKey: ['categoryBranches'],
        queryFn:  fetchCategoryBranches,
        staleTime: 1000 * 60 * 10, // 10 min — branch list is stable
    });