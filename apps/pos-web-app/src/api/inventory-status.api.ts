// ============================================================
// Inventory Status — API Functions
// File: pos-web-app/src/api/inventory-status.api.ts
// ============================================================

import apiClient from '@/lib/axios';
import type {
    InventoryStatusQueryParams,
    InventoryStatusResponse,
    InventoryByBranchResponse,
} from '@/types/inventory-status.types';

// ─── Param mappers ────────────────────────────────────────────

/** Maps shared inventory query params to the backend query string. */
function toBackendParams(p: InventoryStatusQueryParams): Record<string, string> {
    const result: Record<string, string> = {};
    if (p.category)    result.category    = p.category;
    if (p.stockStatus) result.stockStatus = p.stockStatus;
    if (p.branchId)    result.branchId    = p.branchId;
    return result;
}

/**
 * Maps per-branch export params to the backend query string.
 * Includes `invBranchId` (the InvBranch UUID from the by-branch API response)
 * in addition to the shared filter params.
 */
function toBranchExportParams(
    p: InventoryStatusQueryParams & { invBranchId: string },
): Record<string, string> {
    return {
        ...toBackendParams(p),
        invBranchId: p.invBranchId,
    };
}

// ─── KPI Cards + Inventory Detail Table ───────────────────────

export const fetchInventoryStatus = async (
    params: InventoryStatusQueryParams,
): Promise<InventoryStatusResponse> => {
    const { data } = await apiClient.get<InventoryStatusResponse>(
        '/inventory-status/cards',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Per-Branch View ──────────────────────────────────────────

export const fetchInventoryByBranch = async (
    params: InventoryStatusQueryParams,
): Promise<InventoryByBranchResponse> => {
    const { data } = await apiClient.get<InventoryByBranchResponse>(
        '/inventory-status/by-branch',
        { params: toBackendParams(params) },
    );
    return data;
};

// ─── Export CSV (all-branches or single-branch view) ──────────

export const exportInventoryCSV = async (
    params: InventoryStatusQueryParams,
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/inventory-status/export/csv', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Export PDF (all-branches or single-branch view) ──────────

export const exportInventoryPDF = async (
    params: InventoryStatusQueryParams,
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/inventory-status/export/pdf', {
        params:       toBackendParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Export CSV (one specific branch — per-branch tab) ────────
//
// Calls /export/branch/csv with the InvBranch UUID so the backend uses
// classifyByBranch (non-aggregated) and returns exactly what that
// branch's table shows — correct per-branch stock levels and statuses.

export const exportInventoryBranchCSV = async (
    params: InventoryStatusQueryParams & { invBranchId: string },
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/inventory-status/export/branch/csv', {
        params:       toBranchExportParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Export PDF (one specific branch — per-branch tab) ────────
//
// Calls /export/branch/pdf with the InvBranch UUID so the backend uses
// classifyByBranch (non-aggregated) and returns exactly what that
// branch's table shows — correct per-branch stock levels and statuses.

export const exportInventoryBranchPDF = async (
    params: InventoryStatusQueryParams & { invBranchId: string },
): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/inventory-status/export/branch/pdf', {
        params:       toBranchExportParams(params),
        responseType: 'blob',
    });
    return data;
};

// ─── Download helper ──────────────────────────────────────────
// Re-exported from sales-report.api to avoid duplication.

export { downloadBlob } from './sales-report.api';