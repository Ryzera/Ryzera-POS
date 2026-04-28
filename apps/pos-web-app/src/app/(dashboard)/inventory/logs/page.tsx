"use client";

import { useEffect, useState } from "react";
import { branchesApi, productsApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Log {
    id: string; productName: string; branchName: string;
    action: string; quantityChange: number; changeQty?: number;
    stockAfter: number; userName: string; note?: string;
    description?: string; createdAt: string;
    product?: { name: string }; branch?: { name: string }; user?: { name: string };
}

const ACTION_COLORS: Record<string, string> = {
    adjustment: "bg-orange-50 text-orange-600 border-orange-200",
    transfer: "bg-blue-50 text-blue-600 border-blue-200",
    restock: "bg-green-50 text-green-700 border-green-200",
    sale: "bg-red-50 text-red-600 border-red-200",
    create: "bg-purple-50 text-purple-600 border-purple-200",
    update: "bg-gray-50 text-gray-600 border-gray-200",
    stock_take: "bg-blue-50 text-blue-600 border-blue-200",
};

export default function LogsPage() {
    const { isAdmin, branchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : branchId);

    const [logs, setLogs] = useState<Log[]>([]);
    const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
    const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
    const [search, setSearch] = useState("");
    const [filterAction, setFilterAction] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterProduct, setFilterProduct] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            scoped.getLogs(),
            // managers/staff only see their branch — no need for all branches list in filter
            isAdmin ? branchesApi.getAll() : Promise.resolve({ data: [] }),
            productsApi.getAll(),
        ])
            .then(([l, b, p]) => {
                const rawLogs = extractArray<Log>(l.data);
                const normalized = rawLogs.map(log => ({
                    ...log,
                    productName: log.productName ?? log.product?.name ?? "—",
                    branchName: log.branchName ?? log.branch?.name ?? "—",
                    userName: log.userName ?? log.user?.name ?? "—",
                    quantityChange: log.quantityChange ?? log.changeQty ?? 0,
                    note: log.note ?? log.description,
                    action: log.action?.toLowerCase() ?? "—",
                }));
                setLogs(normalized);
                setBranches(extractArray(b.data));
                setProducts(extractArray(p.data));
            })
            .catch(() => toast.error("Failed to load logs"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = logs.filter(l =>
        (!search || l.productName?.toLowerCase().includes(search.toLowerCase()) || l.branchName?.toLowerCase().includes(search.toLowerCase())) &&
        (!filterAction || l.action === filterAction) &&
        (!filterBranch || l.branchName === filterBranch) &&
        (!filterProduct || l.productName === filterProduct)
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-5 h-5 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Inventory Logs</h1>
                <button className="text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50">Export</button>
            </div>

            <div className="flex gap-3 mb-5">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…"
                       className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#1e2a4a]" />
                <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Actions</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="transfer">Transfer</option>
                    <option value="restock">Restock</option>
                    <option value="sale">Sale</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                </select>
                {/* Branch filter only shown to admins */}
                {isAdmin && (
                    <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                )}
                <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Products</option>
                    {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Timestamp</th>
                        <th className="px-5 py-3 text-left font-medium">Product</th>
                        <th className="px-5 py-3 text-left font-medium">Branch</th>
                        <th className="px-5 py-3 text-left font-medium">Action</th>
                        <th className="px-5 py-3 text-left font-medium">Change</th>
                        <th className="px-5 py-3 text-left font-medium">Stock After</th>
                        <th className="px-5 py-3 text-left font-medium">User</th>
                        <th className="px-5 py-3 text-left font-medium">Note</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No logs found</td></tr>
                    )}
                    {filtered.map(log => {
                        const colorClass = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-500 border-gray-200";
                        const isPositive = log.quantityChange > 0;
                        return (
                            <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                                    {log.createdAt ? format(new Date(log.createdAt), "d MMM · HH:mm") : "—"}
                                </td>
                                <td className="px-5 py-3 text-gray-800 font-medium">{log.productName}</td>
                                <td className="px-5 py-3 text-gray-600">{log.branchName}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${colorClass}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-5 py-3 font-medium">
                                    <span className={isPositive ? "text-green-600" : "text-red-500"}>
                                        {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-gray-600">{log.stockAfter ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{log.userName}</td>
                                <td className="px-5 py-3 text-gray-400">{log.note ?? "—"}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}