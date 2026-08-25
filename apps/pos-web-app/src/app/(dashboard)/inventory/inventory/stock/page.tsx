"use client";

import { useEffect, useState } from "react";
import { inventoryApi, branchesApi, productsApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

interface StockItem {
    id: string;
    branchId: string;
    productId: string;
    productName: string;
    sku: string;
    branchName: string;
    quantity: number;
    reservedQuantity: number;
    minStock: number;
    status: string;
    product?: { id: string; name: string; sku: string; minStock: number; unit: string };
    branch?: { id: string; name: string };
    stockQty?: number;
    reservedQty?: number;
}

interface Branch {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
}

// Matched exactly to backend enum
const ACTION_TYPES = [
    "ADJUSTMENT",
    "SALE",
    "RESTOCK",
    "STOCK_TAKE",
    "RETURN_FROM_CUSTOMER",
    "RETURN_TO_SUPPLIER",
    "WASTE_DAMAGED",
];

function LevelBar({ qty, min }: { qty: number; min: number }) {
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

function StatusPill({ qty, min }: { qty: number; min: number }) {
    if (qty === 0) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">Out</span>;
    if (qty <= min) return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-medium">Low</span>;
    return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Good</span>;
}

function formatActionLabel(action: string) {
    return action.charAt(0) + action.slice(1).toLowerCase().replace(/_/g, " ");
}

export default function StockLevelsPage() {
    const { isAdmin, branchId: userBranchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : userBranchId != null ? String(userBranchId) : null);

    const [items, setItems] = useState<StockItem[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showAssign, setShowAssign] = useState(false);
    const [showAdjust, setShowAdjust] = useState<StockItem | null>(null);

    const [assignForm, setAssignForm] = useState({ productId: "", branchId: "", stockQty: "" });

    const [adjustType, setAdjustType] = useState("ADJUSTMENT");
    const [adjustQty, setAdjustQty] = useState(0);
    const [adjustNote, setAdjustNote] = useState("");
    const [saving, setSaving] = useState(false);

    const load = () => {
        Promise.all([
            scoped.getStock(),
            isAdmin ? branchesApi.getAll() : Promise.resolve({ data: [] }),
            productsApi.getAll(),
        ])
            .then(([inv, br, pr]) => {
                const raw = extractArray<any>(inv.data);

                // Normalize snake_case → camelCase so IDs, names and quantities are always present
                const normalized: StockItem[] = raw.map((item: any) => {
                    const branchId = String(
                        item.branchId ?? item.branch_id ?? item.branch?.id ?? ""
                    );
                    const productId = String(
                        item.productId ?? item.product_id ?? item.product?.id ?? ""
                    );

                    return {
                        ...item,
                        id: String(
                            item.id ??
                            item.branchProductId ??
                            item.branch_product_id ??
                            `${branchId}-${productId}`
                        ),
                        branchId,
                        productId,
                        productName: item.productName ?? item.product_name ?? item.product?.name ?? "—",
                        branchName: item.branchName ?? item.branch_name ?? item.branch?.name ?? "—",
                        sku: item.sku ?? item.product?.sku ?? "",
                        quantity: Number(item.quantity ?? item.stockQty ?? item.stock_qty ?? 0),
                        reservedQuantity: Number(
                            item.reservedQuantity ?? item.reservedQty ?? item.reserved_qty ?? 0
                        ),
                        minStock: Number(
                            item.minStock ??
                            item.min_stock ??
                            item.product?.min_quantity ??
                            item.product?.minStock ??
                            item.product?.min_stock ??
                            0
                        ),
                        status: item.status ?? "",
                        product: item.product,
                        branch: item.branch,
                    };
                });

                setItems(normalized);
                setBranches(extractArray<Branch>(br.data));
                setProducts(extractArray<Product>(pr.data));
            })
            .catch(() => toast.error("Failed to load stock"));
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = items.filter(
        (i) =>
            (!search || i.productName?.toLowerCase().includes(search.toLowerCase())) &&
            (!filterBranch || i.branchId === filterBranch) &&
            (!filterStatus ||
                (filterStatus === "good" && i.quantity > i.minStock) ||
                (filterStatus === "low" && i.quantity > 0 && i.quantity <= i.minStock) ||
                (filterStatus === "out" && i.quantity === 0))
    );

    const stockAfter = showAdjust ? showAdjust.quantity + adjustQty : 0;

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await inventoryApi.assignProduct({
                productId: assignForm.productId,
                branchId: assignForm.branchId || userBranchId || "",
                stockQty: parseInt(assignForm.stockQty) || 0,
            });
            toast.success("Product assigned to branch");
            setShowAssign(false);
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to assign";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setSaving(false);
        }
    };

    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showAdjust) return;
        if (!showAdjust.branchId || !showAdjust.productId) {
            toast.error("Missing branch or product id — cannot adjust");
            return;
        }
        if (adjustQty === 0) {
            toast.error("Change quantity cannot be zero");
            return;
        }
        setSaving(true);
        try {
            await inventoryApi.adjustStock(showAdjust.branchId, showAdjust.productId, {
                changeQty: adjustQty,
                action: adjustType,
                description: adjustNote || undefined,
            });
            toast.success("Stock adjusted successfully");
            setShowAdjust(null);
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to adjust";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setSaving(false);
        }
    };

    const openAdjust = (item: StockItem) => {
        setShowAdjust(item);
        setAdjustType("ADJUSTMENT");
        setAdjustQty(0);
        setAdjustNote("");
    };

    const openAssign = () => {
        setAssignForm({ productId: "", branchId: "", stockQty: "" });
        setShowAssign(true);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Stock Levels</h1>
                <div className="flex gap-3">
                    {isAdmin && (
                        <select
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white"
                        >
                            <option value="">All Branches</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={openAssign}
                        className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]"
                    >
                        + Assign Product
                    </button>
                </div>
            </div>

            <div className="flex gap-3 mb-5">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product…"
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#1e2a4a]"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white"
                >
                    <option value="">All</option>
                    <option value="good">Good</option>
                    <option value="low">Low</option>
                    <option value="out">Out of Stock</option>
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Product</th>
                        <th className="px-5 py-3 text-left font-medium">Branch</th>
                        <th className="px-5 py-3 text-left font-medium">Stock Qty</th>
                        <th className="px-5 py-3 text-left font-medium">Reserved</th>
                        <th className="px-5 py-3 text-left font-medium">Level</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        <th className="px-5 py-3 text-left font-medium"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                                No stock records
                            </td>
                        </tr>
                    )}
                    {filtered.map((item) => (
                        <tr
                            key={`${item.branchId}-${item.productId}`}
                            className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                            <td className="px-5 py-3 font-medium text-gray-800">{item.productName}</td>
                            <td className="px-5 py-3 text-gray-600">{item.branchName}</td>
                            <td className="px-5 py-3 text-gray-600">{item.quantity}</td>
                            <td className="px-5 py-3 text-gray-600">{item.reservedQuantity ?? 0}</td>
                            <td className="px-5 py-3">
                                <LevelBar qty={item.quantity} min={item.minStock} />
                            </td>
                            <td className="px-5 py-3">
                                <StatusPill qty={item.quantity} min={item.minStock} />
                            </td>
                            <td className="px-5 py-3">
                                <button
                                    onClick={() => openAdjust(item)}
                                    className="text-[#4A8FD4] hover:underline text-sm"
                                >
                                    Adjust
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* ── Assign modal ─────────────────────────────────────── */}
            {showAssign && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="font-semibold text-gray-900 mb-5">Assign Product to Branch</h2>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Product</label>
                                <select
                                    value={assignForm.productId}
                                    onChange={(e) => setAssignForm((p) => ({ ...p, productId: e.target.value }))}
                                    required
                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none bg-white"
                                >
                                    <option value="">Select product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {isAdmin ? (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Branch</label>
                                    <select
                                        value={assignForm.branchId}
                                        onChange={(e) => setAssignForm((p) => ({ ...p, branchId: e.target.value }))}
                                        required
                                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none bg-white"
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-100 rounded px-3 py-2.5 text-sm text-gray-600">
                                    Branch: <span className="font-medium">Your assigned branch</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Initial Stock Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={assignForm.stockQty}
                                    onChange={(e) => setAssignForm((p) => ({ ...p, stockQty: e.target.value }))}
                                    required
                                    placeholder="0"
                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#1e2a4a]"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Min stock threshold is set on the product itself.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAssign(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60"
                                >
                                    {saving ? "Assigning…" : "Assign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Adjust modal ─────────────────────────────────────── */}
            {showAdjust && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-900">Adjust Stock</h2>
                            <button
                                onClick={() => setShowAdjust(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <p className="text-sm text-gray-800 font-medium">{showAdjust.productName}</p>
                        <p className="text-xs text-gray-400 mb-5">
                            {showAdjust.branchName} · Current stock: <strong>{showAdjust.quantity}</strong>
                        </p>

                        <form onSubmit={handleAdjust} className="space-y-5">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Action type</label>
                                <div className="flex flex-wrap gap-2">
                                    {ACTION_TYPES.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setAdjustType(t)}
                                            className={`px-3 py-1.5 text-xs rounded font-medium border transition-colors ${
                                                adjustType === t
                                                    ? "bg-[#1e2a4a] text-white border-[#1e2a4a]"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            {formatActionLabel(t)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-2">
                                    Change quantity
                                    <span className="ml-1 text-gray-400">(negative to reduce)</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustQty((q) => q - 1)}
                                        className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={adjustQty}
                                        onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                                        className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none text-center focus:border-[#1e2a4a]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAdjustQty((q) => q + 1)}
                                        className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
                                <input
                                    value={adjustNote}
                                    onChange={(e) => setAdjustNote(e.target.value)}
                                    placeholder="e.g. Manual correction after stock-take"
                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#1e2a4a]"
                                />
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Stock after adjustment</span>
                                <span
                                    className={`text-sm font-semibold ${
                                        stockAfter < 0 ? "text-red-500" : "text-gray-800"
                                    }`}
                                >
                  {stockAfter < 0 ? "Invalid (below 0)" : `${stockAfter} units`}
                </span>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAdjust(null)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || stockAfter < 0}
                                    className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60"
                                >
                                    {saving ? "Applying…" : "Apply Adjustment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}