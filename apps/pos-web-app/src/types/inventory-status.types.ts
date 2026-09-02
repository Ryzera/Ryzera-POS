
// ─── Query params sent to the backend ────────────────────────
export interface InventoryStatusQueryParams {
    category?:    string;                          // category name (partial match)
    stockStatus?: 'InStock' | 'LowStock' | 'OutOfStock';
    branchId?:    string;                          // numeric branchId as string (SUPER_ADMIN only)
}

// ─── KPI Cards ────────────────────────────────────────────────
export interface InventoryKpi {
    totalProducts:       number;
    inStock:             number;
    lowStock:            number;
    outOfStock:          number;
    totalInventoryValue: number;
}

// ─── Inventory Detail Row ─────────────────────────────────────
export interface InventoryDetailRow {
    productName:   string;
    category:      string;
    supplier:      string;
    currentStock:  number;
    reorderLevel:  number;
    currentStatus: 'InStock' | 'LowStock' | 'OutOfStock';
    costValue:     number;
    sellingValue:  number;
    branch?:       string;   // present in "All Branches" view
}

// ─── Cards API Response ───────────────────────────────────────
export interface InventoryStatusResponse {
    kpi:              InventoryKpi | null;
    inventoryDetails: InventoryDetailRow[];
    message?:         string;   // present when validation fails
}

// ─── Per-Branch entry ─────────────────────────────────────────
export interface InventoryBranchEntry {
    branch: {
        id:   number;
        name: string;
    };
    kpi:              InventoryKpi;
    inventoryDetails: InventoryDetailRow[];
}

export interface InventoryByBranchResponse {
    branches: InventoryBranchEntry[];
    message?: string;
}

// ─── Inventory Branch (from /reports/sales/branches endpoint) ─
// Re-use Branch from sales-report.types since it's the same source
export type { Branch } from './sales-report.types';