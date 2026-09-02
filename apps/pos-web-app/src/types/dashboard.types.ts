
export interface DashboardKpiData {
    todaySales:        number;
    totalTransactions: number;
    inventoryValue:    number;
    lowStockCount:     number;
}

export interface LiveSalesData {
    totalSalesThisMonth: number;
    asOf:                string; // ISO string
}

export interface SalesTrendPoint {
    date:    string; // 'YYYY-MM-DD'
    revenue: number;
}

export interface SalesTrendData {
    data: SalesTrendPoint[];
}

export interface LowStockItem {
    productName:  string;
    category:     string | null;
    stockAmount:  string;
}

export interface LowStockData {
    count: number;
    data:  LowStockItem[];
}

// Optional: for the KPI Settings page
export interface SalesTarget {
    branchId?: number; // undefined = global
    target:    number;
    month:     string; // 'YYYY-MM'
}