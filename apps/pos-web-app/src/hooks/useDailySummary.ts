// ============================================================
// Daily Summary — React Query Hooks
// File: pos-web-app/src/hooks/useDailySummary.ts
// ============================================================

import { useQuery } from '@tanstack/react-query';
import {
    fetchDailySummaryCards,
    fetchHourlySales,
    fetchDailyPaymentMethods,
    fetchDailySummaryDetails,
    fetchAllBranchesSummary,
} from '@/api/daily-summary.api';
import type { DailySummaryQueryParams } from '@/types/daily-summary.types';

export const dailySummaryKeys = {
    all:            ['dailySummary'] as const,
    cards:          (p: DailySummaryQueryParams) => [...dailySummaryKeys.all, 'cards',          p] as const,
    hourlyChart:    (p: DailySummaryQueryParams) => [...dailySummaryKeys.all, 'hourlyChart',    p] as const,
    paymentMethods: (p: DailySummaryQueryParams) => [...dailySummaryKeys.all, 'paymentMethods', p] as const,
    details:        (p: DailySummaryQueryParams) => [...dailySummaryKeys.all, 'details',        p] as const,
    allBranches:    (p: DailySummaryQueryParams) => [...dailySummaryKeys.all, 'allBranches',    p] as const,
};

const defaultQueryConfig = (enabled: boolean) => ({
    enabled,
    staleTime: 1000 * 60 * 5,
    retry:     1,
});

export const useDailySummaryCards = (p: DailySummaryQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: dailySummaryKeys.cards(p),
        queryFn:  () => fetchDailySummaryCards(p),
        ...defaultQueryConfig(enabled),
    });

export const useHourlySales = (p: DailySummaryQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: dailySummaryKeys.hourlyChart(p),
        queryFn:  () => fetchHourlySales(p),
        ...defaultQueryConfig(enabled),
    });

export const useDailyPaymentMethods = (p: DailySummaryQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: dailySummaryKeys.paymentMethods(p),
        queryFn:  () => fetchDailyPaymentMethods(p),
        ...defaultQueryConfig(enabled),
    });

export const useDailySummaryDetails = (p: DailySummaryQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: dailySummaryKeys.details(p),
        queryFn:  () => fetchDailySummaryDetails(p),
        ...defaultQueryConfig(enabled),
    });

export const useAllBranchesSummary = (p: DailySummaryQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: dailySummaryKeys.allBranches(p),
        queryFn:  () => fetchAllBranchesSummary(p),
        ...defaultQueryConfig(enabled),
    });