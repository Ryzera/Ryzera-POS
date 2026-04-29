// ============================================================
// Inventory Status — React Query Hooks
// File: pos-web-app/src/hooks/useInventoryStatus.ts
// ============================================================

import { useQuery } from '@tanstack/react-query';
import {
    fetchInventoryStatus,
    fetchInventoryByBranch,
} from '@/api/inventory-status.api';
import type { InventoryStatusQueryParams } from '@/types/inventory-status.types';

// ─── Query key factory ────────────────────────────────────────
export const inventoryStatusKeys = {
    all:       ['inventoryStatus'] as const,
    cards:     (p: InventoryStatusQueryParams) =>
        [...inventoryStatusKeys.all, 'cards',     p] as const,
    byBranch:  (p: InventoryStatusQueryParams) =>
        [...inventoryStatusKeys.all, 'byBranch',  p] as const,
};

const defaultQueryConfig = (enabled: boolean) => ({
    enabled,
    staleTime: 1000 * 60 * 5,   // 5 minutes — same as sales report
    retry:     1,
});

// ─── Main inventory cards + table hook ────────────────────────
export const useInventoryStatus = (
    p: InventoryStatusQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: inventoryStatusKeys.cards(p),
        queryFn:  () => fetchInventoryStatus(p),
        ...defaultQueryConfig(enabled),
    });

// ─── Per-branch hook ──────────────────────────────────────────
export const useInventoryByBranch = (
    p: InventoryStatusQueryParams,
    enabled: boolean,
) =>
    useQuery({
        queryKey: inventoryStatusKeys.byBranch(p),
        queryFn:  () => fetchInventoryByBranch(p),
        ...defaultQueryConfig(enabled),
    });

// ─── Re-export shared hooks (categories, branches) ────────────
// These already exist in useSalesReport.ts — import from there,
// don't duplicate. Use them in the view directly:
// import { useCategories, useBranches } from '@/hooks/useSalesReport';