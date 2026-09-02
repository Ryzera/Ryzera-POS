
// ─── Query params sent to the backend ────────────────────────────────────────
export interface ProfitLossQueryParams {
  dateFrom?: string; // 'YYYY-MM-DD'
  dateTo?: string; // 'YYYY-MM-DD'
  branchId?: number | string; // Support both number and string
}

// ─── KPI Cards ───────────────────────────────────────────────────────────────
// Maps to ProfitLossService.getKpiCards() return shape
export interface ProfitLossCards {
    totalSales:      number;
    costOfGoodsSold: number;
    grossProfit:     number;
    netProfit:       number;
    profitMargin:    number;   // percentage, e.g. 34.0
    totalTax:        number;
    totalDiscounts:  number;
    totalReturns:    number;
    netRevenue:      number;
}

// ─── Chart ───────────────────────────────────────────────────────────────────
// Maps to ProfitLossService.getChartData() return shape
export interface ProfitLossChartPoint {
    date:    string;   // 'YYYY-MM-DD'
    revenue: number;
    cost:    number;
    profit:  number;
}
export interface ProfitLossChartResponse {
    data: ProfitLossChartPoint[];
}

// ─── Table ───────────────────────────────────────────────────────────────────
// Maps to ProfitLossService.getProfitLossTable() return shape
export interface ProfitLossTableRow {
    date:        string;   // 'YYYY-MM-DD'
    revenue:     number;
    cogs:        number;
    grossProfit: number;
    tax:         number;
    returns:     number;
    netProfit:   number;
    margin:      number;   // percentage
}
export interface ProfitLossTableResponse {
    data: ProfitLossTableRow[];
}

// ─── Per-Branch ───────────────────────────────────────────────────────────────
// Maps to ProfitLossService.getByBranch() return shape.
// NOTE: branch.name is NOT in the backend response — resolve from useBranches().
export interface ProfitLossBranchEntry {
    branch: {
        id: number | null;
    };
    kpi:   ProfitLossCards;
    chart: ProfitLossChartResponse;
    table: ProfitLossTableResponse;
}
export interface ProfitLossByBranchResponse {
    branches: ProfitLossBranchEntry[];
}