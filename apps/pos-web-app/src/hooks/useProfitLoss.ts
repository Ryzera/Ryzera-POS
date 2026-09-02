
import { useQuery } from '@tanstack/react-query';
import {
    fetchProfitLossCards,
    fetchProfitLossChart,
    fetchProfitLossTable,
    fetchProfitLossByBranch,
} from '@/api/profit-loss.api';
import type { ProfitLossQueryParams } from '@/types/profit-loss.types';

// ─── Stable query key factory ─────────────────────────────────────────────────
// Centralise key creation to prevent typos and make cache invalidation reliable.
// Pattern mirrors the existing sales-report hooks.
const plKeys = {
    cards:    (p: ProfitLossQueryParams) => ['profit-loss', 'cards',    p] as const,
    chart:    (p: ProfitLossQueryParams) => ['profit-loss', 'chart',    p] as const,
    table:    (p: ProfitLossQueryParams) => ['profit-loss', 'table',    p] as const,
    byBranch: (p: ProfitLossQueryParams) => ['profit-loss', 'byBranch', p] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** KPI Cards — totalSales, COGS, grossProfit, netProfit, margin, tax, discounts, returns */
export function useProfitLossCards(params: ProfitLossQueryParams, enabled: boolean) {
    return useQuery({
        queryKey: plKeys.cards(params),
        queryFn:  () => fetchProfitLossCards(params),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/** Daily bar chart — Revenue / Cost / Profit per day */
export function useProfitLossChart(params: ProfitLossQueryParams, enabled: boolean) {
    return useQuery({
        queryKey: plKeys.chart(params),
        queryFn:  () => fetchProfitLossChart(params),
        enabled,
        staleTime: 1000 * 60 * 5,
    });
}

/** Day-by-day P&L statement table */
export function useProfitLossTable(params: ProfitLossQueryParams, enabled: boolean) {
    return useQuery({
        queryKey: plKeys.table(params),
        queryFn:  () => fetchProfitLossTable(params),
        enabled,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Per-branch breakdown (All Branches tab).
 * Only enabled for SUPER_ADMIN and only when "All Branches" is selected.
 */
export function useProfitLossByBranch(params: ProfitLossQueryParams, enabled: boolean) {
    return useQuery({
        queryKey: plKeys.byBranch(params),
        queryFn:  () => fetchProfitLossByBranch(params),
        enabled,
        staleTime: 1000 * 60 * 5,
    });
}