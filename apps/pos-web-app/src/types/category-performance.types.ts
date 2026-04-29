// ============================================================
// Category Performance — Type Definitions
// File: pos-web-app/src/types/category-performance.types.ts
//
// Mirrors the backend response shapes from:
//   GET /category-performance/kpi
//   GET /category-performance/bar-chart
//   GET /category-performance/pie-chart
//   GET /category-performance/table
//   GET /category-performance/by-branch
// ============================================================

// ─── Query Params sent to the backend ────────────────────────────────────────
// branchId is a number because the backend Zod schema coerces it via z.coerce.number()
export interface CategoryPerformanceQueryParams {
    dateFrom?: string;   // 'YYYY-MM-DD'
    dateTo?:   string;   // 'YYYY-MM-DD'
    branchId?: number;   // numeric — omit for All Branches
}

// ─── KPI — Top Categories by Revenue ─────────────────────────────────────────
export interface TopCategoryItem {
    rank:     number;
    category: string;
    revenue:  number;
}
export interface CategoryKpiResponse {
    topCategories: TopCategoryItem[];
}

// ─── Bar Chart — Revenue per Category ────────────────────────────────────────
export interface RevenueBarItem {
    category: string;
    revenue:  number;
}
export interface RevenueBarResponse {
    data: RevenueBarItem[];
}

// ─── Pie Chart — Profit per Category ─────────────────────────────────────────
export interface ProfitPieItem {
    category:   string;
    profit:     number;
    percentage: number;
}
export interface ProfitPieResponse {
    data: ProfitPieItem[];
}

// ─── Detail Table — Full Metrics per Category ─────────────────────────────────
export interface CategoryTableRow {
    category:      string;
    totalProducts: number;
    totalSold:     number;
    revenue:       number;
    cost:          number;
    profit:        number;
    transactions:  number;
    margin:        number; // percentage, e.g. 46.6
}
export interface CategoryTableResponse {
    data: CategoryTableRow[];
}

// ─── Per Branch Response ──────────────────────────────────────────────────────
export interface CategoryBranchEntry {
    branch: {
        id:   number;
        name: string;
    };
    data: CategoryTableRow[];
}
export interface CategoryByBranchResponse {
    branches: CategoryBranchEntry[];
}

// ─── UI-level filter state ────────────────────────────────────────────────────
// This is what the filter component emits on Generate click
export interface CategoryPerformanceFilters {
    dateFrom: string;
    dateTo:   string;
}