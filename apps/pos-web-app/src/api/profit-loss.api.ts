import api from '@/lib/api';
import type {
    ProfitLossCards,
    ProfitLossChartResponse,
    ProfitLossTableResponse,
    ProfitLossByBranchResponse,
    ProfitLossQueryParams,
} from '@/types/profit-loss.types';

// ─── Param mapper ─────────────────────────────────────────────────────────────
// Strips undefined keys so they are not sent as empty query strings
function toBackendParams(p: ProfitLossQueryParams): Record<string, string> {
    const result: Record<string, string> = {};
    if (p.dateFrom)  result.dateFrom  = p.dateFrom;
    if (p.dateTo)    result.dateTo    = p.dateTo;
    if (p.branchId)  result.branchId  = String(p.branchId);
    return result;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
export const fetchProfitLossCards = async (params: ProfitLossQueryParams): Promise<ProfitLossCards> => {
  const res = await api.get('/profit-loss/cards', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Chart ────────────────────────────────────────────────────────────────────
export const fetchProfitLossChart = async (params: ProfitLossQueryParams): Promise<ProfitLossChartResponse> => {
  const res = await api.get('/profit-loss/chart', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Table ────────────────────────────────────────────────────────────────────
export const fetchProfitLossTable = async (params: ProfitLossQueryParams): Promise<ProfitLossTableResponse> => {
  const res = await api.get('/profit-loss/table', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Per-Branch ───────────────────────────────────────────────────────────────
export const fetchProfitLossByBranch = async (params: ProfitLossQueryParams): Promise<ProfitLossByBranchResponse> => {
  const res = await api.get('/profit-loss/by-branch', { params: toBackendParams(params) });
  return res.data.data;
};

// ─── Export CSV ───────────────────────────────────────────────────────────────
export const exportProfitLossCSV = async (
    params: ProfitLossQueryParams,
): Promise<Blob> => {
    const { data } = await api.get<Blob>('/profit-loss/export/csv', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Export PDF ───────────────────────────────────────────────────────────────
export const exportProfitLossPDF = async (
    params: ProfitLossQueryParams,
): Promise<Blob> => {
    const { data } = await api.get<Blob>('/profit-loss/export/pdf', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Download helper ──────────────────────────────────────────────────────────
// Reuse from sales-report.api.ts OR copy here to keep modules self-contained
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