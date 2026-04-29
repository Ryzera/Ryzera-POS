// ============================================================
// Category Performance — React Query Hooks
// File: pos-web-app/src/hooks/useCategoryPerformance.ts
//
// Root cause of the "same values on branch switch" bug — TWO compounding issues:
//
// ISSUE 1 — Query key collapse (previously fixed):
//   { branchId: undefined } serialises to {} via JSON.stringify, identical to
//   { branchId: 2 } → {} — React Query thought the key never changed.
//   Fix: explicit primitives in key, p.branchId ?? 'all' so undefined is 'all'.
//
// ISSUE 2 — placeholderData + staleTime (THIS is why it still showed old data):
//   TanStack Query v5 default: when a key changes to one with no cached entry,
//   the hook KEEPS returning the previous `data` value as a placeholder while
//   the new fetch runs silently in the background. This is "keepPreviousData"
//   behaviour that is ON by default in v5. Combined with staleTime: 5 min,
//   if the new key happens to have cached data too (same dates, first branch
//   then all-branches), it serves that immediately with no fetch at all.
//
//   Fix A: placeholderData: undefined  — clears `data` the moment the key
//           changes, showing skeletons while the new branch data loads.
//   Fix B: staleTime: 0  — treats every key as immediately stale so a fresh
//           network request always fires when the branch changes.
// ============================================================

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