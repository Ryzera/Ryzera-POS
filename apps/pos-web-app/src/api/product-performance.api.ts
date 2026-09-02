import api from '@/lib/api';
import type {
    ProductKpiCards,
    TopProductsResponse,
    ProductPaymentMethodResponse,
    PerBranchResponse,
    ProductTableResponse,
    ProductPerformanceQueryParams,
} from '@/types/product-performance.types';

// ─── Param mapper ──────────────────────────────────────────────────────────────
// Only include defined params — avoids sending empty strings to backend
function toBackendParams(
    p: ProductPerformanceQueryParams,
): Record<string, string> {
    const result: Record<string, string> = {};
    if (p.dateFrom)  result.dateFrom  = p.dateFrom;
    if (p.dateTo)    result.dateTo    = p.dateTo;
    if (p.category)  result.category  = p.category;
    if (p.branchId)  result.branchId  = p.branchId;
    if (p.page)      result.page      = p.page;
    if (p.limit)     result.limit     = p.limit;
    return result;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
export const fetchProductKpiCards = async (params: ProductPerformanceQueryParams): Promise<ProductKpiCards> => {
  const res = await api.get('/product-performance/cards', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Top Products (Bar Chart) ─────────────────────────────────────────────────
export const fetchTopProducts = async (params: ProductPerformanceQueryParams): Promise<TopProductsResponse> => {
  const res = await api.get('/product-performance/top-products', { params: toBackendParams(params) });
  return res.data.data;
};


// ─── Payment Methods (Pie Chart) ──────────────────────────────────────────────
export const fetchProductPaymentMethods = async (params: ProductPerformanceQueryParams): Promise<ProductPaymentMethodResponse> => {
  const res = await api.get('/product-performance/payment-methods', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Per-Branch Summary (SUPER_ADMIN only) ────────────────────────────────────
export const fetchPerBranchSummary = async (params: ProductPerformanceQueryParams): Promise<PerBranchResponse> => {
  const res = await api.get('/product-performance/per-branch', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Product Table ────────────────────────────────────────────────────────────
export const fetchProductTable = async (params: ProductPerformanceQueryParams): Promise<ProductTableResponse> => {
  const res = await api.get('/product-performance/table', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Export CSV ───────────────────────────────────────────────────────────────
export const exportProductPerformanceCsv = async (
    params: ProductPerformanceQueryParams,
): Promise<Blob> => {
    const { data } = await api.get<Blob>(
        '/product-performance/export/csv',
        { params: toBackendParams(params), responseType: 'blob' },
    );
    return data;
};

// ─── Export PDF ───────────────────────────────────────────────────────────────
export const exportProductPerformancePdf = async (
    params: ProductPerformanceQueryParams,
): Promise<Blob> => {
    const { data } = await api.get<Blob>(
        '/product-performance/export/pdf',
        { params: toBackendParams(params), responseType: 'blob' },
    );
    return data;
};

// ─── Download helper (re-exported from sales-report.api.ts for convenience) ───
export { downloadBlob } from './sales-report.api';