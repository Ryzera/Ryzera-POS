import api from "@/lib/api";
import type {
  DashboardKpiData,
  LiveSalesData,
  SalesTrendData,
  LowStockData,
} from "@/types/dashboard.types";

// Shared param builder (keeps fetch calls clean)
function buildBranchParam(branchId?: number): Record<string, string> {
  return branchId ? { branchId: String(branchId) } : {};
}

export const fetchKpiCards = async (
  branchId?: number,
): Promise<DashboardKpiData> => {
  const res = await api.get("/dashboard/kpi", {
    params: buildBranchParam(branchId),
  });
  return res.data.data;
};

export const fetchLiveSales = async (
  branchId?: number,
): Promise<LiveSalesData> => {
  const res = await api.get("/dashboard/live-sales", {
    params: buildBranchParam(branchId),
  });
  return res.data.data;
};

export const fetchLowStockAlerts = async (
  branchId?: number,
): Promise<LowStockData> => {
  const res = await api.get("/dashboard/low-stock-alerts", {
    params: buildBranchParam(branchId),
  });
  return res.data.data;
};
export const fetchSalesTrend = async (
  branchId?: number,
): Promise<SalesTrendData> => {
  const res = await api.get("/dashboard/sales-trend", {
    params: buildBranchParam(branchId),
  });
  return res.data.data;
};