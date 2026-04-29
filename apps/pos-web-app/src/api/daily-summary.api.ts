

import apiClient from '@/lib/axios';
import type {
    DailySummaryQueryParams,
    DailySummaryCardsResponse,
    HourlySalesResponse,
    PaymentMethodResponse,
    DailySummaryDetailsResponse,
    AllBranchesSummaryResponse,
} from '@/types/daily-summary.types';

function toBackendParams(p: DailySummaryQueryParams): Record<string, string> {
    const result: Record<string, string> = {};
    if (p.date)     result.date     = p.date;
    if (p.branchId) result.branchId = p.branchId;
    return result;
}

export const fetchDailySummaryCards = async (
    params: DailySummaryQueryParams,
): Promise<DailySummaryCardsResponse> => {
    const { data } = await apiClient.get<DailySummaryCardsResponse>(
        '/daily-summary/cards',
        { params: toBackendParams(params) },
    );
    return data;
};

export const fetchHourlySales = async (
    params: DailySummaryQueryParams,
): Promise<HourlySalesResponse> => {
    const { data } = await apiClient.get<HourlySalesResponse>(
        '/daily-summary/hourly-chart',
        { params: toBackendParams(params) },
    );
    return data;
};

export const fetchDailyPaymentMethods = async (
    params: DailySummaryQueryParams,
): Promise<PaymentMethodResponse> => {
    const { data } = await apiClient.get<PaymentMethodResponse>(
        '/daily-summary/payment-methods',
        { params: toBackendParams(params) },
    );
    return data;
};

export const fetchDailySummaryDetails = async (
    params: DailySummaryQueryParams,
): Promise<DailySummaryDetailsResponse> => {
    const { data } = await apiClient.get<DailySummaryDetailsResponse>(
        '/daily-summary/details',
        { params: toBackendParams(params) },
    );
    return data;
};

export const fetchAllBranchesSummary = async (
    params: DailySummaryQueryParams,
): Promise<AllBranchesSummaryResponse> => {
    const { data } = await apiClient.get<AllBranchesSummaryResponse>(
        '/daily-summary/all-branches',
        { params: toBackendParams(params) },
    );
    return data;
};

export const exportDailySummaryCSV = async (
    params: DailySummaryQueryParams,
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/daily-summary/export/csv', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

export const exportDailySummaryPDF = async (
    params: DailySummaryQueryParams,
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/daily-summary/export/pdf', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}