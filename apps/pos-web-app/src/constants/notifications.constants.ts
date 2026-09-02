// Backend stores `type` as `<prefix>:<branchId>` (see notification-rules.service.ts,
// e.g. "low_stock_alert:5"). We only need the prefix to decide where to route.
export const NOTIFICATION_ROUTE_MAP: Record<string, string> = {
  daily_target_midday: "/reports/dashboard",
  unusual_hourly_drop: "/reports/dashboard",
  zero_sales_product: "/reports/product-performance",
  low_stock_alert: "/reports/inventory-status",
  out_of_stock_alert: "/reports/inventory-status",
  daily_summary_notification: "/reports/daily-summary",
  weekly_performance_summary: "/reports/sales",
  margin_below_target: "/reports/profit-loss",
};

export const DEFAULT_NOTIFICATION_ROUTE = "/reports/dashboard";

export function getNotificationRoute(type: string): string {
  const prefix = type.split(":")[0];
  return NOTIFICATION_ROUTE_MAP[prefix] ?? DEFAULT_NOTIFICATION_ROUTE;
}
