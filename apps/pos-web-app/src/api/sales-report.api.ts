import api from '@/lib/api';
import type {
    SalesCardsData,
    SalesChartResponse,
    PaymentMethodResponse,
    SalesTransactionsResponse,
    SalesReportQueryParams,
    ByBranchResponse,
    Branch,
    Category,
    Product,
} from '@/types/sales-report.types';

// ─── Param mapper ─────────────────────────────────────────────────────────────
function toBackendParams(p: SalesReportQueryParams): Record<string, string> {
    const result: Record<string, string> = {};
    if (p.dateFrom)  result.dateFrom  = p.dateFrom;
    if (p.dateTo)    result.dateTo    = p.dateTo;
    if (p.branchId)  result.branchId  = String(p.branchId);
    if (p.category)  result.category  = p.category;
    if (p.product)   result.product   = p.product;
    if (p.status)    result.status    = p.status;
    if (p.search)    result.search    = p.search;
    if (p.page)      result.page      = p.page;
    if (p.limit)     result.limit     = p.limit;
    return result;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
export const fetchSalesCards = async (params: SalesReportQueryParams): Promise<SalesCardsData> => {
  const res = await api.get('/reports/sales/cards', {
    params: toBackendParams(params),
  });
  return res.data.data;
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────
export const fetchSalesChart = async (
  params: SalesReportQueryParams,
): Promise<SalesChartResponse> => {
  const res = await api.get<SalesChartResponse>('/reports/sales/chart', {
    params: toBackendParams(params),
  });
  return (res.data as any)?.data ?? res.data;
};

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const fetchPaymentMethods = async (params: SalesReportQueryParams): Promise<PaymentMethodResponse> => {
  const res = await api.get('/reports/sales/payment-methods', {
    params: toBackendParams(params),
  });
  return res.data.data;
};


// ─── Transactions ─────────────────────────────────────────────────────────────
export const fetchSalesTransactions = async (params: SalesReportQueryParams): Promise<SalesTransactionsResponse> => {
  const res = await api.get('/reports/sales/transactions', {
    params: toBackendParams(params),
  });
  return res.data.data;
};

// ─── Per-Branch ───────────────────────────────────────────────────────────────
export const fetchSalesByBranch = async (params: SalesReportQueryParams): Promise<ByBranchResponse> => {
  const res = await api.get('/reports/sales/by-branch', {
    params: toBackendParams(params),
  });
  return res.data.data;
};

// ─── Export CSV ───────────────────────────────────────────────────────────────
export const exportSalesCSV = async (
    params: SalesReportQueryParams,
): Promise<Blob> => {
    const { data } = await api.get<Blob>('/reports/sales/export/csv', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Export PDF ───────────────────────────────────────────────────────────────
export const exportSalesPDF = async (
    params: SalesReportQueryParams,
): Promise<Blob> => {
    const { data } = await api.get<Blob>('/reports/sales/export/pdf', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Branches ─────────────────────────────────────────────────────────────────
// Uses /reports/sales/branches which reads from ryzera_pos_branch (integer branchId).
// Do NOT use /branches — that endpoint reads from public.branch (UUID id),
// which is a completely different table with no relation to sales data.
export const fetchBranches = async (): Promise<Branch[]> => {
  const res = await api.get('/reports/sales/branches');
  const list = res.data.data;
  return Array.isArray(list) ? list : [];
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get('/lookup/categories');
  return res.data.data;
};
// ─── Products ────────────────────────────────────────────────────────────────
export const fetchProducts = async (categoryId?: string): Promise<Product[]> => {
  const res = await api.get('/lookup/products', {
    params: categoryId ? { categoryId } : undefined,
  });
  return res.data.data;
};

// ─── Download helper ──────────────────────────────────────────────────────────
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