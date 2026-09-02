
export interface DailySummaryFilters {
    date:      string;
    branchId?: string;
}

export interface DailySummaryQueryParams {
    date?:     string;
    branchId?: string;
}

export interface DailySummaryKpi {
    totalSales:     number;
    transactions:   number;
    itemsSold:      number;
    totalCustomers: number;
    grossProfit:    number;
    netProfit:      number;
}

export interface DailySummaryCardsResponse {
    kpi:      DailySummaryKpi | null;
    message?: string;
}

export interface HourlySalesPoint {
    hour:   string;
    amount: number;
}

export interface HourlySalesResponse {
    data:     HourlySalesPoint[];
    message?: string;
}

export interface PaymentMethodItem {
    paymentMethod: string;
    totalAmount:   number;
    percentage:    number;
}

export interface PaymentMethodResponse {
    totalTransactions: number;
    data:              PaymentMethodItem[];
    message?:          string;
}

export interface DailySummaryTableRow {
    date:         string;
    totalSales:   number;
    transactions: number;
    itemsSold:    number;
    discounts:    number;
    tax:          number;
    returns:      number;
    netProfit:    number;
}

export interface PlBreakdown {
    totalSales:      number;
    costOfGoodsSold: number;
    grossProfit:     number;
    discounts:       number;
    returns:         number;
    taxCollected:    number;
    netProfit:       number;
    profitMargin:    number;
}

export interface DailySummaryDetailsResponse {
    table:       DailySummaryTableRow | null;
    plBreakdown: PlBreakdown | null;
    message?:    string;
}

// ── UPDATED: added hasData field ──────────────────────────────────────────────
export interface BranchDailySummary {
    branchId:   number | null;
    branchName: string;
    branchCity: string | null;
    hasData:    boolean;          // ← NEW: false when no DailySummary exists for date
    kpi:        DailySummaryKpi;  // always present; zeros when hasData === false
}

export interface AllBranchesSummaryResponse {
    date:     string;
    branches: BranchDailySummary[];
    message?: string;
}