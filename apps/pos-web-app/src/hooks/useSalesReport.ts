
import { useQuery } from '@tanstack/react-query';
import {
    fetchSalesCards,
    fetchSalesChart,
    fetchPaymentMethods,
    fetchSalesTransactions,
    fetchSalesByBranch,
    fetchBranches,
    fetchCategories,
    fetchProducts,
} from '@/api/sales-report.api';
import type { SalesReportQueryParams } from '@/types/sales-report.types';

// ─── Query key factory ────────────────────────────────────────────────────────
export const salesReportKeys = {
    all:            ['salesReport'] as const,
    cards:          (p: SalesReportQueryParams) => [...salesReportKeys.all, 'cards',          p] as const,
    chart:          (p: SalesReportQueryParams) => [...salesReportKeys.all, 'chart',          p] as const,
    paymentMethods: (p: SalesReportQueryParams) => [...salesReportKeys.all, 'paymentMethods', p] as const,
    transactions:   (p: SalesReportQueryParams) => [...salesReportKeys.all, 'transactions',   p] as const,
    byBranch:       (p: SalesReportQueryParams) => [...salesReportKeys.all, 'byBranch',       p] as const,
};

const defaultQueryConfig = (enabled: boolean) => ({
    enabled,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    retry:     1,
});

// ─── Report data hooks ────────────────────────────────────────────────────────

export const useSalesCards = (p: SalesReportQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: salesReportKeys.cards(p),
        queryFn:  () => fetchSalesCards(p),
        ...defaultQueryConfig(enabled),
    });

export const useSalesChart = (p: SalesReportQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: salesReportKeys.chart(p),
        queryFn:  () => fetchSalesChart(p),
        ...defaultQueryConfig(enabled),
    });

export const usePaymentMethods = (p: SalesReportQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: salesReportKeys.paymentMethods(p),
        queryFn:  () => fetchPaymentMethods(p),
        ...defaultQueryConfig(enabled),
    });

export const useSalesTransactions = (p: SalesReportQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: salesReportKeys.transactions(p),
        queryFn:  () => fetchSalesTransactions(p),
        ...defaultQueryConfig(enabled),
    });

export const useSalesByBranch = (p: SalesReportQueryParams, enabled: boolean) =>
    useQuery({
        queryKey: salesReportKeys.byBranch(p),
        queryFn:  () => fetchSalesByBranch(p),
        ...defaultQueryConfig(enabled),
    });

// ─── Reference data hooks (longer cache) ─────────────────────────────────────

export const useBranches = () =>
    useQuery({
        queryKey: ['branches'],
        queryFn:  fetchBranches,
        staleTime: 1000 * 60 * 10,  // 10 minutes
    });

export const useCategories = () =>
    useQuery({
        queryKey: ['categories'],
        queryFn:  fetchCategories,
        staleTime: 1000 * 60 * 10,
    });

export const useProducts = (categoryId?: string) =>
    useQuery({
        queryKey: ['products', categoryId],
        queryFn:  () => fetchProducts(categoryId),
        staleTime: 1000 * 60 * 10,
    });