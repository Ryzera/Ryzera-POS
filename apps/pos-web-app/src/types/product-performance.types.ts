
// ─── Filter shapes ────────────────────────────────────────────────────────────

/** Internal UI filter state — what the filter bar holds */
export interface ProductPerformanceFilters {
    dateFrom:   string;          // 'YYYY-MM-DD'
    dateTo:     string;          // 'YYYY-MM-DD'
    categoryId?: string;         // category NAME (sent to backend as ?category=)
}

/** Query params sent to the backend API */
export interface ProductPerformanceQueryParams {
    dateFrom?:  string;
    dateTo?:    string;
    category?:  string;          // partial match on category name
    branchId?:  string;          // numeric branchId as string (SUPER_ADMIN only)
    page?:      string;
    limit?:     string;
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

export interface ProductKpiCards {
    totalProductsSold:  number;
    topSellingCategory: string;  // Backend returns topSellingCategory
    totalRevenue:       number;
    totalProfit:        number;
}

// ─── Top Products (Bar Chart) ─────────────────────────────────────────────────

export interface TopProductItem {
    productName:        string;
    totalQuantitySold:  number;
}

export interface TopProductsResponse {
    message: string;
    count:   number;
    data:    TopProductItem[];
}

// ─── Payment Methods (Pie Chart) ──────────────────────────────────────────────

export interface ProductPaymentMethodItem {
    paymentMethod: string;
    count:         number;
    totalAmount:   number;
    percentage:    number;
}

export interface ProductPaymentMethodResponse {
    totalTransactions: number;
    data:              ProductPaymentMethodItem[];
}

// ─── Per-Branch Summary ───────────────────────────────────────────────────────

export interface BranchTopProduct {
    rank:        number;
    productName: string;
    unitsSold:   number;
    revenue:     number;
}

export interface BranchPaymentMethod {
    paymentMethod: string;
    count:         number;
    totalAmount:   number;
    percentage:    number;
}

export interface PerBranchEntry {
    branchId:       number;
    branchName:     string;
    topProducts:    BranchTopProduct[];
    paymentMethods: BranchPaymentMethod[];
}

export interface PerBranchResponse {
    message:  string;
    branches: PerBranchEntry[];
}

// ─── Product Table ────────────────────────────────────────────────────────────

export interface ProductTableRow {
    productName:  string;
    category:     string;
    productType:  string;        // Same as category in current backend
    unitsSold:    number;
    revenue:      number;
    cost:         number;
    profit:       number;
    profitMargin: number;        // percentage, e.g. 26.5
}

export interface ProductTablePagination {
    currentPage:  number;
    totalPages:   number;
    totalRecords: number;
    limit:        number;
    hasNextPage:  boolean;
    hasPrevPage:  boolean;
}

export interface ProductTableResponse {
    data:       ProductTableRow[];
    pagination: ProductTablePagination;
}