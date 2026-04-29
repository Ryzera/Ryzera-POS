
import apiClient from '@/lib/axios';
import type {
    CategoryPerformanceQueryParams,
    CategoryKpiResponse,
    RevenueBarResponse,
    ProfitPieResponse,
    CategoryTableResponse,
    CategoryByBranchResponse,
} from '@/types/category-performance.types';
import type { Branch } from '@/types/sales-report.types';

// ─── Param Mapper ─────────────────────────────────────────────────────────────
// Converts the internal query params to backend-safe query string values.
// branchId is omitted entirely when undefined — backend reads absence as "all branches".
function toBackendParams(
    p: CategoryPerformanceQueryParams,
): Record<string, string | number> {
    const result: Record<string, string | number> = {};
    if (p.dateFrom)            result.dateFrom  = p.dateFrom;
    if (p.dateTo)              result.dateTo    = p.dateTo;
    if (p.branchId !== undefined) result.branchId = p.branchId; // numeric — Zod coerces on backend
    return result;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
export const fetchCategoryKpi = async (
    params: CategoryPerformanceQueryParams,
): Promise<CategoryKpiResponse> => {
    const { data } = await apiClient.get<CategoryKpiResponse>(
        '/category-performance/kpi',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Bar Chart — Revenue by Category ─────────────────────────────────────────
export const fetchRevenueByCategory = async (
    params: CategoryPerformanceQueryParams,
): Promise<RevenueBarResponse> => {
    const { data } = await apiClient.get<RevenueBarResponse>(
        '/category-performance/bar-chart',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Pie Chart — Profit by Category ──────────────────────────────────────────
export const fetchProfitByCategory = async (
    params: CategoryPerformanceQueryParams,
): Promise<ProfitPieResponse> => {
    const { data } = await apiClient.get<ProfitPieResponse>(
        '/category-performance/pie-chart',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Detail Table ─────────────────────────────────────────────────────────────
export const fetchCategoryTable = async (
    params: CategoryPerformanceQueryParams,
): Promise<CategoryTableResponse> => {
    const { data } = await apiClient.get<CategoryTableResponse>(
        '/category-performance/table',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Per Branch (SUPER_ADMIN only) ───────────────────────────────────────────
export const fetchCategoryByBranch = async (
    params: CategoryPerformanceQueryParams,
): Promise<CategoryByBranchResponse> => {
    const { data } = await apiClient.get<CategoryByBranchResponse>(
        '/category-performance/by-branch',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Branch List — reuse sales endpoint (same ryzera_pos_branch table) ────────
export const fetchCategoryBranches = async (): Promise<Branch[]> => {
    const { data } = await apiClient.get<Branch[]>('/reports/sales/branches');
    return Array.isArray(data) ? data : [];
};

// ─── Export CSV ───────────────────────────────────────────────────────────────
export const exportCategoryCSV = async (
    params: CategoryPerformanceQueryParams,
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(
        '/category-performance/export/csv',
        { params: toBackendParams(params), responseType: 'blob' },
    );
    return data;
};

// ─── Export PDF ───────────────────────────────────────────────────────────────
export const exportCategoryPDF = async (
    params: CategoryPerformanceQueryParams,
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(
        '/category-performance/export/pdf',
        { params: toBackendParams(params), responseType: 'blob' },
    );
    return data;
};

// ─── Download Helper (reuse pattern from sales-report.api.ts) ─────────────────
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