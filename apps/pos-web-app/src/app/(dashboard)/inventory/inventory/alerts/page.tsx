"use client";

import { useEffect, useState } from "react";
import { inventoryApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

interface Alert {
    id: string;
    productName: string;
    branchName: string;
    quantity: number;
    minStock: number;
    type: "low_stock" | "out_of_stock";
    seenAt?: string;
    resolvedAt?: string;
    createdAt: string;
    status?: string;
    product?: { name: string };
    branch?: { name: string };
    stockQty?: number;
    derived?: boolean;
}

function timeAgo(d: string) {
    if (!d) return "—";
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3_600_000);
    const days = Math.floor(h / 24);
    if (days > 0) return `${days}d ago`;
    if (h > 0) return `${h}h ago`;
    return "just now";
}

export default function AlertsPage() {
    const { isAdmin, branchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : branchId != null ? String(branchId) : null);

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        Promise.all([scoped.getAlerts(), scoped.getStock()])
            .then(([alertsRes, stockRes]) => {
                // ── 1. Normalize persisted alerts from the API ─────────────
                const rawAlerts = extractArray<any>(alertsRes.data);
                const fromApi = rawAlerts.map((a: any) => {
                    const qty = Number(a.quantity ?? a.stockQty ?? a.stock_qty ?? 0);
                    const min = Number(
                        a.minStock ?? a.min_stock ?? a.product?.min_quantity ?? a.product?.minStock ?? 0
                    );
                    const type: "low_stock" | "out_of_stock" =
                        a.type === "out_of_stock" ||
                        a.type === "OUT_OF_STOCK" ||
                        a.status === "OUT_OF_STOCK" ||
                        qty === 0
                            ? "out_of_stock"
                            : "low_stock";

                    return {
                        id: String(a.id ?? `${a.product_id ?? a.productId}-${a.branch_id ?? a.branchId}`),
                        productId: String(a.product_id ?? a.productId ?? a.product?.id ?? ""),
                        branchIdKey: String(a.branch_id ?? a.branchId ?? a.branch?.id ?? ""),
                        productName:
                            a.productName ?? a.product_name ?? a.product?.name ?? "—",
                        branchName:
                            a.branchName ?? a.branch_name ?? a.branch?.name ?? "—",
                        quantity: qty,
                        minStock: min,
                        type,
                        seenAt: a.seenAt ?? a.seen_at,
                        resolvedAt: a.resolvedAt ?? a.resolved_at,
                        createdAt: a.createdAt ?? a.created_at ?? new Date().toISOString(),
                        status: a.status,
                        derived: false,
                    } as Alert & { productId: string; branchIdKey: string };
                });

                const openFromApi = fromApi.filter((a) => !a.resolvedAt);
                const openKeys = new Set(
                    openFromApi.map((a) => `${a.productId}-${a.branchIdKey}`)
                );

                // ── 2. Cross-check live stock for products missing a real alert ──
                const rawStock = extractArray<any>(stockRes.data);
                const liveDerived: Alert[] = rawStock
                    .map((item: any) => {
                        const qty = Number(
                            item.quantity ?? item.stockQty ?? item.stock_qty ?? 0
                        );
                        const min = Number(
                            item.minStock ??
                            item.min_stock ??
                            item.product?.min_quantity ??
                            item.product?.min_stock ??
                            item.product?.minStock ??
                            item.product?.minQuantity ??
                            0
                        );
                        const productId = String(
                            item.productId ?? item.product_id ?? item.product?.id ?? ""
                        );
                        const branchIdVal = String(
                            item.branchId ?? item.branch_id ?? item.branch?.id ?? ""
                        );

                        let type: "low_stock" | "out_of_stock" | null = null;
                        if (qty === 0) {
                            type = "out_of_stock";
                        } else if (min > 0 && qty <= min) {
                            type = "low_stock";
                        }

                        if (!type) return null;
                        if (openKeys.has(`${productId}-${branchIdVal}`)) return null;

                        return {
                            id: `derived-${productId}-${branchIdVal}`,
                            productName:
                                item.productName ??
                                item.product_name ??
                                item.product?.name ??
                                "—",
                            branchName:
                                item.branchName ??
                                item.branch_name ??
                                item.branch?.name ??
                                "—",
                            quantity: qty,
                            minStock: min,
                            type,
                            createdAt: new Date().toISOString(),
                            derived: true,
                        } as Alert;
                    })
                    .filter(Boolean) as Alert[];

                setAlerts([...openFromApi, ...liveDerived]);
            })
            .catch(() => toast.error("Failed to load alerts"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const markSeen = async (id: string) => {
        if (id.startsWith("derived-")) {
            toast("This alert is live from current stock — restock product to clear.");
            return;
        }
        try {
            await inventoryApi.markAlertSeen(id);
            load();
        } catch {
            toast.error("Failed to mark seen");
        }
    };

    const resolve = async (id: string) => {
        if (id.startsWith("derived-")) {
            toast("This alert is live from current stock. Restock the product to clear it.");
            return;
        }
        try {
            await inventoryApi.resolveAlert(id);
            toast.success("Alert resolved");
            load();
        } catch {
            toast.error("Failed to resolve alert");
        }
    };

    const filtered = alerts.filter((a) => !filter || a.type === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-5 h-5 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Stock Alerts</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white"
                >
                    <option value="">All</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="low_stock">Low Stock</option>
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-50">
                {filtered.length === 0 && (
                    <p className="text-center text-gray-400 py-10 text-sm">No alerts</p>
                )}
                {filtered.map((a) => (
                    <div
                        key={a.id}
                        className="flex items-center justify-between px-5 py-4"
                    >
                        <div className="flex items-center gap-4">
                            <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    a.quantity === 0 || a.type === "out_of_stock"
                                        ? "bg-red-500"
                                        : "bg-orange-400"
                                }`}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {a.productName} —{" "}
                                    {a.quantity === 0 || a.type === "out_of_stock"
                                        ? "Out of stock"
                                        : `${a.quantity} units (min: ${a.minStock})`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {a.branchName} · {timeAgo(a.createdAt)}
                                    {a.seenAt ? " · Seen" : ""}
                                    {a.derived ? " · Live from stock" : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {!a.derived && !a.seenAt && !a.resolvedAt && (
                                <button
                                    onClick={() => markSeen(a.id)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Mark seen
                                </button>
                            )}
                            {!a.derived && !a.resolvedAt && (
                                <button
                                    onClick={() => resolve(a.id)}
                                    className="text-sm text-green-600 hover:underline font-medium"
                                >
                                    Resolve
                                </button>
                            )}
                            {a.derived && (
                                <span className="text-xs text-gray-400">
                                    Restock to clear
                                </span>
                            )}
                            {a.resolvedAt && (
                                <span className="text-xs text-gray-300">Resolved</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}