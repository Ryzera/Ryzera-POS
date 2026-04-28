"use client";

import { useEffect, useState } from "react";
import { Search, Download, Plus, TrendingUp } from "lucide-react";
import { inventoryApi, productsApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface StockItem {
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    branchName: string;
    branchId: string;
    quantity: number;
    minStock: number;
    unitPrice: number;
    status: "active" | "low_stock" | "out_of_stock";
    // raw backend fields
    product?: { name: string; sku: string; minStock: number; category?: { name: string }; price?: number; costPrice?: number };
    branch?: { id: string; name: string };
    stockQty?: number;
    reservedQty?: number;
}

interface Alert {
    id: string;
    productName: string;
    branchName: string;
    quantity: number;
    minStock: number;
    type: "low_stock" | "out_of_stock";
    createdAt: string;
    product?: { name: string };
    branch?: { name: string };
    stockQty?: number;
    status?: string;
}

interface Log {
    id: string;
    action: string;
    details: string;
    description?: string;
    userName: string;
    createdAt: string;
    user?: { name: string };
}

function StatCard({
                      label, value, sub, subColor, borderColor,
                  }: {
    label: string; value: string | number; sub: string; subColor: string; borderColor: string;
}) {
    return (
        <div className={`bg-white border-l-4 ${borderColor} rounded-lg p-5 shadow-sm flex-1`}>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
        </div>
    );
}

function StockBar({ qty, min }: { qty: number; min: number }) {
    const max = Math.max(min * 3, qty, 1);
    const pct = Math.min((qty / max) * 100, 100);
    const color = qty === 0 ? "bg-red-400" : qty <= min ? "bg-orange-400" : "bg-green-500";
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-gray-700">{qty}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: "bg-green-50 text-green-700 border border-green-200",
        low_stock: "bg-orange-50 text-orange-700 border border-orange-200",
        out_of_stock: "bg-red-50 text-red-700 border border-red-200",
    };
    const labels: Record<string, string> = {
        active: "Active",
        low_stock: "Low Stock",
        out_of_stock: "Out of Stock",
    };
    return (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${map[status] ?? ""}`}>
            {labels[status] ?? status}
        </span>
    );
}

function deriveStatus(qty: number, min: number): "active" | "low_stock" | "out_of_stock" {
    if (qty === 0) return "out_of_stock";
    if (qty <= min) return "low_stock";
    return "active";
}

function formatValue(v: number) {
    if (v >= 1_000_000) return `Rs. ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `Rs. ${(v / 1_000).toFixed(0)}K`;
    return `Rs. ${v}`;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return "just now";
}

export default function DashboardPage() {
    const router = useRouter();
    const { isAdmin, branchId: userBranchId, user } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : userBranchId);

    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [activeTab, setActiveTab] = useState<"alerts" | "expiring">("alerts");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            scoped.getStock(),
            scoped.getAlerts(),
            scoped.getLogs(),
            productsApi.getAll(),
        ])
            .then(([stockRes, alertsRes, logsRes, productsRes]) => {

                // ── Stock normalization (Fix 3) ──────────────────────────
                const rawStock = extractArray<StockItem>(stockRes.data);
                const normalizedStock = rawStock.map(item => {
                    const qty   = item.quantity   ?? item.stockQty              ?? 0;
                    const min   = item.minStock   ?? item.product?.minStock     ?? 0;
                    const price = item.unitPrice  ?? item.product?.price        ?? item.product?.costPrice ?? 0;
                    return {
                        ...item,
                        productName:  item.productName  ?? item.product?.name               ?? "—",
                        sku:          item.sku          ?? item.product?.sku                ?? "—",
                        categoryName: item.categoryName ?? item.product?.category?.name    ?? "—",
                        branchName:   item.branchName   ?? item.branch?.name               ?? "—",
                        branchId:     item.branchId     ?? item.branch?.id                 ?? "",
                        quantity: qty,
                        minStock: min,
                        unitPrice: price,
                        status: deriveStatus(qty, min),
                    };
                });
                setStockItems(normalizedStock);

                // ── Alerts normalization ─────────────────────────────────
                const rawAlerts = extractArray<Alert>(alertsRes.data);
                const normalizedAlerts = rawAlerts.map(a => ({
                    ...a,
                    productName: a.productName ?? a.product?.name ?? "—",
                    branchName:  a.branchName  ?? a.branch?.name  ?? "—",
                    quantity:    a.quantity    ?? a.stockQty      ?? 0,
                    type: a.type ?? (
                        a.status === "OUT_OF_STOCK" ? "out_of_stock" : "low_stock"
                    ) as "low_stock" | "out_of_stock",
                }));
                setAlerts(normalizedAlerts);

                // ── Logs normalization ───────────────────────────────────
                const rawLogs = extractArray<Log>(logsRes.data);
                const normalizedLogs = rawLogs.slice(0, 5).map(log => ({
                    ...log,
                    details:  log.details  ?? log.description ?? log.action ?? "—",
                    userName: log.userName ?? log.user?.name  ?? "—",
                }));
                setLogs(normalizedLogs);

                // ── Products count ───────────────────────────────────────
                const prodData = productsRes.data;
                setTotalProducts(
                    Array.isArray(prodData)
                        ? prodData.length
                        : prodData?.data?.length ?? prodData?.total ?? prodData?.items?.length ?? 0
                );
            })
            .catch(() => toast.error("Failed to load dashboard data"))
            .finally(() => setLoading(false));
    }, []);

    // ── Derived filter options ───────────────────────────────────────────────
    const categories = [...new Set(stockItems.map(i => i.categoryName).filter(Boolean))];
    // Branch filter only useful for admin (manager/staff only see their own branch anyway)
    const branches = isAdmin
        ? [...new Set(stockItems.map(i => i.branchName).filter(Boolean))]
        : [];

    const filtered = stockItems.filter(item => {
        const matchSearch =
            !search ||
            item.productName.toLowerCase().includes(search.toLowerCase()) ||
            item.sku.toLowerCase().includes(search.toLowerCase());
        const matchCat    = !filterCategory || item.categoryName === filterCategory;
        const matchBranch = !filterBranch   || item.branchName   === filterBranch;
        const matchStatus = !filterStatus   || item.status       === filterStatus;
        return matchSearch && matchCat && matchBranch && matchStatus;
    });

    const totalValue = stockItems.reduce((sum, i) => sum + i.quantity * (i.unitPrice ?? 0), 0);
    const lowCount   = alerts.filter(a => a.type === "low_stock").length;
    const outCount   = alerts.filter(a => a.type === "out_of_stock").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <div className="w-6 h-6 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
                    {/* Show branch context for manager/staff */}
                    {!isAdmin && user?.branch && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            Viewing: <span className="font-medium text-[#4A8FD4]">{user.branch.name}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-[#1e2a4a] w-56"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50">
                        <Download size={14} />
                        Export
                    </button>
                    {/* Only admin/manager can add products */}
                    {(isAdmin || user?.role === "MANAGER") && (
                        <button
                            onClick={() => router.push("/products")}
                            className="flex items-center gap-2 text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]"
                        >
                            <Plus size={14} />
                            Add Product
                        </button>
                    )}
                </div>
            </div>

            {/* Stat cards */}
            <div className="flex gap-4">
                <StatCard
                    label="Total Products"
                    value={totalProducts}
                    sub={`${stockItems.length} stock records`}
                    subColor="text-blue-600"
                    borderColor="border-blue-500"
                />
                <StatCard
                    label="In Stock Value"
                    value={formatValue(totalValue)}
                    sub="Based on unit price"
                    subColor="text-green-600"
                    borderColor="border-green-500"
                />
                <StatCard
                    label="Low Stock Alerts"
                    value={lowCount}
                    sub={lowCount > 0 ? "Needs attention" : "All good"}
                    subColor={lowCount > 0 ? "text-orange-500" : "text-green-600"}
                    borderColor="border-orange-400"
                />
                <StatCard
                    label="Out of Stock"
                    value={outCount}
                    sub={outCount > 0 ? "Action required" : "All good"}
                    subColor={outCount > 0 ? "text-red-500" : "text-green-600"}
                    borderColor="border-red-500"
                />
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Product Inventory</h2>
                    <div className="flex gap-2">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none bg-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {/* Branch filter only for admin */}
                        {isAdmin && (
                            <select
                                value={filterBranch}
                                onChange={e => setFilterBranch(e.target.value)}
                                className="text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none bg-white"
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        )}

                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Product</th>
                        <th className="px-5 py-3 text-left font-medium">Category</th>
                        {isAdmin && <th className="px-5 py-3 text-left font-medium">Branch</th>}
                        <th className="px-5 py-3 text-left font-medium">Stock Level</th>
                        <th className="px-5 py-3 text-left font-medium">Unit Price</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        <th className="px-5 py-3 text-left font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 7 : 6} className="px-5 py-8 text-center text-gray-400">
                                No items found
                            </td>
                        </tr>
                    )}
                    {filtered.map(item => (
                        <tr
                            key={`${item.productId}-${item.branchName}`}
                            className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                            <td className="px-5 py-3">
                                <p className="font-medium text-gray-800">{item.productName}</p>
                                <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                            </td>
                            <td className="px-5 py-3 text-gray-600">{item.categoryName || "—"}</td>
                            {isAdmin && <td className="px-5 py-3 text-gray-600">{item.branchName}</td>}
                            <td className="px-5 py-3">
                                <StockBar qty={item.quantity} min={item.minStock} />
                            </td>
                            <td className="px-5 py-3 text-gray-600">
                                {item.unitPrice ? `Rs. ${item.unitPrice.toLocaleString()}` : "—"}
                            </td>
                            <td className="px-5 py-3">
                                <StatusBadge status={item.status} />
                            </td>
                            <td className="px-5 py-3">
                                <button
                                    onClick={() => router.push("/products")}
                                    className="text-[#4A8FD4] hover:underline text-sm"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-2 gap-6">
                {/* Alerts / Expiring tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <div className="flex gap-4 border-b border-gray-100 mb-4">
                        <button
                            onClick={() => setActiveTab("alerts")}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "alerts"
                                    ? "border-[#1e2a4a] text-[#1e2a4a]"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Low Stock Alerts {lowCount > 0 && (
                            <span className="ml-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {lowCount + outCount}
                                </span>
                        )}
                        </button>
                        <button
                            onClick={() => setActiveTab("expiring")}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "expiring"
                                    ? "border-[#1e2a4a] text-[#1e2a4a]"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Expiring Soon
                        </button>
                    </div>

                    {activeTab === "alerts" && (
                        <div className="space-y-3">
                            {alerts.slice(0, 5).map(alert => (
                                <div key={alert.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                                            alert.type === "out_of_stock" ? "bg-red-500" : "bg-orange-400"
                                        }`} />
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                {alert.productName} —{" "}
                                                {alert.type === "out_of_stock"
                                                    ? "Out of stock"
                                                    : `${alert.quantity} units left`}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {alert.branchName} · min: {alert.minStock}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{timeAgo(alert.createdAt)}</span>
                                </div>
                            ))}
                            {alerts.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No alerts</p>
                            )}
                            {alerts.length > 5 && (
                                <button
                                    onClick={() => router.push("/inventory/alerts")}
                                    className="text-xs text-[#4A8FD4] hover:underline w-full text-center pt-1"
                                >
                                    View all {alerts.length} alerts →
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === "expiring" && (
                        <div className="text-sm text-gray-400 text-center py-6">
                            Check the{" "}
                            <button onClick={() => router.push("/batches")} className="text-[#4A8FD4] hover:underline">
                                Batches
                            </button>{" "}
                            page for expiry tracking
                        </div>
                    )}
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                        <button
                            onClick={() => router.push("/inventory/logs")}
                            className="text-xs text-[#4A8FD4] hover:underline"
                        >
                            View all →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {logs.map(log => (
                            <div key={log.id} className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <TrendingUp size={12} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 truncate">{log.details}</p>
                                    <p className="text-xs text-gray-400">
                                        {log.userName} · {timeAgo(log.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}