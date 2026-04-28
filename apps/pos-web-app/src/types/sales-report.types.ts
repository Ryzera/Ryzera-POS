// ============================================================
// Sales Report — Type Definitions
// File: pos-web-app/src/types/sales-report.types.ts
// ============================================================

// ─── Filter shape used internally in the UI ──────────────────────────────────
// categoryId / productId hold the display NAME (not UUID) because the backend
// accepts partial name matches, not UUIDs.
export interface SalesReportFilters {
    dateFrom:   string;         // 'YYYY-MM-DD'
    dateTo:     string;         // 'YYYY-MM-DD'
    categoryId?: string;        // category NAME sent to backend
    productId?:  string;        // product NAME sent to backend
    branchId?:   string;        // numeric branchId as string
}

// ─── Query params sent to the backend ────────────────────────────────────────
export interface SalesReportQueryParams {
    dateFrom?:  string;
    dateTo?:    string;
    branchId?:  string;         // numeric branchId as string
    category?:  string;         // category NAME (partial match)
    product?:   string;         // product NAME  (partial match)
    status?:    'Completed' | 'Pending' | 'Cancelled';
    search?:    string;
    page?:      string;
    limit?:     string;
}

// ─── KPI Cards ───────────────────────────────────────────────────────────────
export interface SalesCardsData {
    totalRevenue:      number;
    totalTransactions: number;
    totalItems:        number;
    averageSales:      number;
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
export interface SalesChartPoint {
    date:         string;
    amount:       number;
    transactions: number;
    netProfit:    number;
    returns:      number;
}
export interface SalesChartResponse {
    count: number;
    data:  SalesChartPoint[];
}

// ─── Payment Methods Pie ──────────────────────────────────────────────────────
export interface PaymentMethodItem {
    paymentMethod: string;      // 'Cash' | 'Card' | 'Split'
    count:         number;
    totalAmount:   number;
    percentage:    number;
}
export interface PaymentMethodResponse {
    totalTransactions: number;
    data:              PaymentMethodItem[];
}

// ─── Transactions Table ───────────────────────────────────────────────────────
// NOTE: The backend does NOT return customerName — it is intentionally absent.
export interface SalesTransaction {
    invoiceNumber:  string;
    saleDate:       string;     // 'YYYY-MM-DD'
    paymentMethod:  string;     // 'Cash' | 'Card' | 'Split' | 'N/A'
    subtotal:       number;
    discountAmount: number;
    taxAmount:      number;
    totalAmount:    number;
    saleStatus:     string;     // 'Completed' | 'Pending' | 'Cancelled'
    paymentStatus:  string;     // 'Paid' | 'Pending' | 'Failed' | 'Refunded'
}
export interface SalesPagination {
    currentPage:  number;
    totalPages:   number;
    totalRecords: number;
    limit:        number;
    hasNextPage:  boolean;
    hasPrevPage:  boolean;
}
export interface SalesTransactionsResponse {
    data:       SalesTransaction[];
    pagination: SalesPagination;
}

// ─── Branch ──────────────────────────────────────────────────────────────────
// ryzera_pos_branch uses Int PK (branchId)
export interface Branch {
    branchId:   number;
    name:       string;
    city?:      string | null;
    code?:      string;
    is_active?: boolean;
}

// ─── Per-Branch entry returned by GET /reports/sales/by-branch ───────────────
export interface BranchReportEntry {
    branch: {
        id:   number;
        name: string;
        city: string | null;
    };
    kpi: SalesCardsData;
}
export interface ByBranchResponse {
    branches: BranchReportEntry[];
}

// ─── Lookup ──────────────────────────────────────────────────────────────────
export interface Category {
    id:   string;
    name: string;
}
export interface Product {
    id:          string;
    name:        string;
    categoryId?: string | null;
}