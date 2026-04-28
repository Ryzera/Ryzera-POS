"use client";

import { useEffect, useState } from "react";
import { inventoryApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface Alert {
    id: string; productName: string; branchName: string;
    quantity: number; minStock: number; type: "low_stock" | "out_of_stock";
    seenAt?: string; resolvedAt?: string; createdAt: string;
    status?: string;
    product?: { name: string };
    branch?: { name: string };
    stockQty?: number;
}

function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(h / 24);
    if (days > 0) return `${days}d ago`;
    if (h > 0) return `${h}h ago`;
    return "just now";
}

export default function AlertsPage() {
    const { isAdmin, branchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : branchId);

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const load = () => {
        scoped.getAlerts()
            .then(r => {
                const data = extractArray<Alert>(r.data);
                const normalized = data.map(a => ({
                    ...a,
                    productName: a.productName ?? a.product?.name ?? "—",
                    branchName: a.branchName ?? a.branch?.name ?? "—",
                    quantity: a.quantity ?? a.stockQty ?? 0,
                    type: a.type ?? (a.status === "PENDING" ? "low_stock" : a.status?.toLowerCase() as "low_stock" | "out_of_stock"),
                }));
                setAlerts(normalized);
            })
            .catch(() => toast.error("Failed to load"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const markSeen = async (id: string) => {
        try { await inventoryApi.markAlertSeen(id); load(); } catch { toast.error("Failed"); }
    };

    const resolve = async (id: string) => {
        try { await inventoryApi.resolveAlert(id); toast.success("Alert resolved"); load(); } catch { toast.error("Failed"); }
    };

    const filtered = alerts.filter(a => !filter || a.type === filter);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-5 h-5 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Stock Alerts</h1>
                <select value={filter} onChange={e => setFilter(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="low_stock">Low Stock</option>
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-50">
                {filtered.length === 0 && (
                    <p className="text-center text-gray-400 py-10 text-sm">No alerts</p>
                )}
                {filtered.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                a.quantity === 0 || a.type === "out_of_stock" ? "bg-red-500" : "bg-orange-400"
                            }`} />
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {a.productName} — {a.quantity === 0 || a.type === "out_of_stock"
                                    ? "Out of stock"
                                    : `${a.quantity} units (min: ${a.minStock})`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {a.branchName} · {timeAgo(a.createdAt)}{a.seenAt ? " · Seen" : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {!a.seenAt && !a.resolvedAt && (
                                <button onClick={() => markSeen(a.id)} className="text-sm text-gray-500 hover:text-gray-700">Mark seen</button>
                            )}
                            {!a.resolvedAt && (
                                <button onClick={() => resolve(a.id)} className="text-sm text-green-600 hover:underline font-medium">Resolve</button>
                            )}
                            {a.resolvedAt && <span className="text-xs text-gray-300">Resolved</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}