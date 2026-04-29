// ============================================================
// Dashboard — API Functions
// File: src/api/dashboard.api.ts
// ============================================================

import apiClient from '@/lib/axios';
import type {
    DashboardKpiData,
    LiveSalesData,
    SalesTrendData,
    LowStockData,
} from '@/types/dashboard.types';

// Shared param builder (keeps fetch calls clean)
function buildBranchParam(branchId?: number): Record<string, string> {
    return branchId ? { branchId: String(branchId) } : {};
}

export const fetchKpiCards = async (branchId?: number): Promise<DashboardKpiData> => {
    const { data } = await apiClient.get<DashboardKpiData>('/dashboard/kpi', {
        params: buildBranchParam(branchId),
    });
    return data;
};

export const fetchLiveSales = async (branchId?: number): Promise<LiveSalesData> => {
    const { data } = await apiClient.get<LiveSalesData>('/dashboard/live-sales', {
        params: buildBranchParam(branchId),
    });
    return data;
};

export const fetchLowStockAlerts = async (branchId?: number): Promise<LowStockData> => {
    const { data } = await apiClient.get<LowStockData>('/dashboard/low-stock-alerts', {
        params: buildBranchParam(branchId),
    });
    return data;
};

export const fetchSalesTrend = async (branchId?: number): Promise<SalesTrendData> => {
    const { data } = await apiClient.get<SalesTrendData>('/dashboard/sales-trend', {
        params: buildBranchParam(branchId),
    });
    return data;
};