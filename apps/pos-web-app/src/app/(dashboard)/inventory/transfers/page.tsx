"use client";

import { useEffect, useState } from "react";
import { transfersApi, branchesApi, productsApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Transfer {
    id: number; status: string; notes?: string; createdAt: string;
    sourceBranch?: { id: number; name: string };
    destinationBranch?: { id: number; name: string };
    createdBy?: { name: string };
    items?: TransferItem[];
}
interface TransferItem { id: number; quantity: number; product?: { name: string; sku: string; unit: string }; }

// CASCADE: include status so we can filter active-only in dropdowns
interface Branch  { id: number; name: string; status?: string; }
interface Product { id: number; name: string; sku: string; unit: string; status?: string; }
interface StockItem { productId: number; productName: string; branchId: number; quantity: number; unit?: string; }

const STATUS_STEPS = ["PENDING", "SHIPPED", "RECEIVED", "CANCELLED"];

function StatusBar({ status }: { status: string }) {
    const idx = STATUS_STEPS.indexOf(status);
    return (
        <div className="grid grid-cols-4 gap-1 mb-8">
            {STATUS_STEPS.map((s, i) => (
                <div key={s} className={`py-3 text-center text-sm font-medium rounded ${
                    s === status ? "bg-[#1e2a4a] text-white" : i < idx ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                }`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        s === status ? "bg-green-400" : i < idx ? "bg-green-400" : "bg-gray-300"
                    }`} />
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                </div>
            ))}
        </div>
    );
}

// FIX: ids are now numbers (Int), format for display instead of slicing a UUID string
function formatTransferCode(id: number) {
    return `TXN-${String(id).padStart(6, "0")}`;
}

export default function TransfersPage() {
    const { isAdmin, branchId: userBranchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : userBranchId != null ? String(userBranchId) : null);

    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [view, setView] = useState<"list" | "detail" | "create">("list");
    const [selected, setSelected] = useState<Transfer | null>(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [saving, setSaving] = useState(false);

    const [createForm, setCreateForm] = useState({ sourceBranchId: "", destinationBranchId: "", notes: "" });
    const [items, setItems] = useState([{ productId: "", quantity: "" }]);

    const load = () => Promise.all([
        scoped.getTransfers(),
        branchesApi.getAll(),
        productsApi.getAll(),
        scoped.getStock(),
    ]).then(([t, b, p, s]) => {
        setTransfers(extractArray<Transfer>(t.data));
        setBranches(extractArray<Branch>(b.data));
        setProducts(extractArray<Product>(p.data));
        const rawStock = extractArray<StockItem>(s.data);
        setStockItems(rawStock.map(item => ({
            ...item,
            productName: item.productName ?? (item as any).product?.name ?? "—",
        })));
    }).catch(() => toast.error("Failed to load"));

    useEffect(() => { load(); }, []);

    // ── CASCADE: active-only lists for dropdowns ──────────────────────────────
    const activeBranches = branches.filter(b => b.status === "ACTIVE" || b.status === undefined);
    const activeProducts  = products.filter(p => p.status === "ACTIVE" || p.status === undefined);

    const openDetail = async (t: Transfer) => {
        try {
            const res = await transfersApi.getById(t.id);
            setSelected(res.data.data);   // ← was res.data
            setView("detail");
        } catch { toast.error("Failed to load transfer"); }
    };

    const getAvailableStock = (productId: string, branchId: string) => {
        const item = stockItems.find(s => String(s.productId) === productId && String(s.branchId) === branchId);
        return item ? `${item.quantity} ${item.unit ?? "PCS"}` : "—";
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            const resolvedSourceId = createForm.sourceBranchId || userBranchId;
            const payload = {
                // FIX: backend expects numeric IDs, HTML <select> values are always strings
                sourceBranchId:      Number(resolvedSourceId),
                destinationBranchId: Number(createForm.destinationBranchId),
                notes: createForm.notes || undefined,
                items: items
                    .filter(i => i.productId && i.quantity)
                    .map(i => ({ productId: Number(i.productId), quantity: parseInt(i.quantity) })),
            };
            if (!payload.items.length) {
                toast.error("Add at least one product to transfer");
                setSaving(false);
                return;
            }
            await transfersApi.create(payload);
            toast.success("Transfer created");
            setView("list"); load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to create";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await transfersApi.updateStatus(id, status);
            toast.success(`Transfer marked as ${status.toLowerCase()}`);
            const res = await transfersApi.getById(id);
            setSelected(res.data.data);   // ← was res.data
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to update";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const filtered = transfers.filter(t => !filterStatus || t.status === filterStatus);

    // ── CREATE VIEW ──────────────────────────────────────────────────────────
    if (view === "create") return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-gray-900">New Transfer</h1>
                <button onClick={() => setView("list")} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
                <p className="text-sm font-medium text-gray-500">Transfer details</p>
                <div className="grid grid-cols-2 gap-4">
                    {/* From branch: admin picks active branches only, manager/staff locked */}
                    {isAdmin ? (
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From branch</label>
                            <select value={createForm.sourceBranchId}
                                    onChange={e => setCreateForm(p => ({ ...p, sourceBranchId: e.target.value }))}
                                    required
                                    className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none bg-white">
                                <option value="">Select branch</option>
                                {/* CASCADE: only active branches */}
                                {activeBranches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded px-3 py-2.5 text-sm text-gray-600 flex items-center">
                            From: <span className="font-medium ml-1">Your branch</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To branch</label>
                        <select value={createForm.destinationBranchId}
                                onChange={e => setCreateForm(p => ({ ...p, destinationBranchId: e.target.value }))}
                                required
                                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none bg-white">
                            <option value="">Select branch</option>
                            {/* CASCADE: only active branches, exclude source */}
                            {activeBranches
                                .filter(b => String(b.id) !== (createForm.sourceBranchId || String(userBranchId ?? "")))
                                .map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                        </select>
                        {activeBranches.filter(b => String(b.id) !== (createForm.sourceBranchId || String(userBranchId ?? ""))).length === 0 && (
                            <p className="text-xs text-orange-500 mt-1">No other active branches available to transfer to.</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                    <input value={createForm.notes}
                           onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                           placeholder="e.g. Weekly stock redistribution"
                           className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Items to transfer</p>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                            <th className="py-2 text-left font-medium">Product</th>
                            <th className="py-2 text-left font-medium">Available Stock</th>
                            <th className="py-2 text-left font-medium">Transfer Qty</th>
                            <th className="py-2"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-50">
                                <td className="py-2 pr-4">
                                    <select value={item.productId}
                                            onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: e.target.value } : it))}
                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none bg-white">
                                        <option value="">Select product</option>
                                        {/* CASCADE: only active products */}
                                        {activeProducts.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="py-2 pr-4 text-gray-500 text-sm">
                                    {item.productId && (createForm.sourceBranchId || userBranchId)
                                        ? getAvailableStock(item.productId, createForm.sourceBranchId || String(userBranchId!))
                                        : "—"}
                                </td>
                                <td className="py-2 pr-4">
                                    <input type="number" min="1"
                                           value={item.quantity}
                                           onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))}
                                           placeholder="0"
                                           className="w-24 border border-gray-200 rounded px-3 py-2 text-sm outline-none" />
                                </td>
                                <td className="py-2">
                                    {items.length > 1 && (
                                        <button type="button"
                                                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-gray-400 hover:text-red-500">×</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button type="button"
                            onClick={() => setItems(p => [...p, { productId: "", quantity: "" }])}
                            className="mt-3 text-sm text-[#4A8FD4] hover:underline">+ Add item</button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setView("list")}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={saving}
                            className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                        {saving ? "Creating…" : "Create Transfer"}
                    </button>
                </div>
            </form>
        </div>
    );

    // ── DETAIL VIEW ──────────────────────────────────────────────────────────
    if (view === "detail" && selected) return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-sm text-[#4A8FD4] mb-1 cursor-pointer hover:underline"
                       onClick={() => setView("list")}>
                        Transfers / {formatTransferCode(selected.id)}
                    </p>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Transfer #{formatTransferCode(selected.id)}
                    </h1>
                </div>
                <div className="flex gap-3">
                    {selected.status === "PENDING" && (
                        <>
                            <button onClick={() => handleStatusUpdate(selected.id, "CANCELLED")}
                                    className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Cancel</button>
                            <button onClick={() => handleStatusUpdate(selected.id, "SHIPPED")}
                                    className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">Mark as Shipped</button>
                        </>
                    )}
                    {selected.status === "SHIPPED" && (
                        <button onClick={() => handleStatusUpdate(selected.id, "RECEIVED")}
                                className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">Mark as Received</button>
                    )}
                </div>
            </div>

            <StatusBar status={selected.status} />

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-3 gap-8 mb-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">From Branch</p>
                        <p className="font-semibold text-gray-800">{selected.sourceBranch?.name ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">To Branch</p>
                        <p className="font-semibold text-gray-800">{selected.destinationBranch?.name ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Created By</p>
                        <p className="font-semibold text-gray-800">{selected.createdBy?.name ?? "—"}</p>
                        <p className="text-sm text-gray-500">
                            {selected.createdAt ? format(new Date(selected.createdAt), "d MMM yyyy") : "—"}
                        </p>
                    </div>
                </div>

                {selected.notes && (
                    <p className="text-sm text-gray-600 mb-6">Notes: {selected.notes}</p>
                )}

                <p className="text-sm font-medium text-gray-700 mb-3">Transfer items</p>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-2 text-left font-medium">Product</th>
                        <th className="py-2 text-left font-medium">SKU</th>
                        <th className="py-2 text-left font-medium">Unit</th>
                        <th className="py-2 text-left font-medium">Quantity</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(selected.items ?? []).map(item => (
                        <tr key={item.id} className="border-b border-gray-50">
                            <td className="py-3 text-gray-800">{item.product?.name ?? "—"}</td>
                            <td className="py-3 text-gray-500">{item.product?.sku ?? "—"}</td>
                            <td className="py-3 text-gray-500">{item.product?.unit ?? "—"}</td>
                            <td className="py-3 text-gray-600">{item.quantity}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ── LIST VIEW ────────────────────────────────────────────────────────────
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Transfers</h1>
                <button onClick={() => {
                    setCreateForm({ sourceBranchId: "", destinationBranchId: "", notes: "" });
                    setItems([{ productId: "", quantity: "" }]);
                    setView("create");
                }} className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">
                    + New Transfer
                </button>
            </div>

            <div className="flex gap-3 mb-5">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Status</option>
                    {["PENDING", "SHIPPED", "RECEIVED", "CANCELLED"].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Transfer</th>
                        <th className="px-5 py-3 text-left font-medium">From</th>
                        <th className="px-5 py-3 text-left font-medium">To</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        <th className="px-5 py-3 text-left font-medium">Date</th>
                        <th className="px-5 py-3 text-left font-medium"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No transfers</td></tr>
                    )}
                    {filtered.map(t => {
                        const statusColors: Record<string, string> = {
                            PENDING:   "bg-orange-50 text-orange-600 border-orange-200",
                            SHIPPED:   "bg-blue-50 text-blue-600 border-blue-200",
                            RECEIVED:  "bg-green-50 text-green-700 border-green-200",
                            CANCELLED: "bg-red-50 text-red-600 border-red-200",
                        };
                        return (
                            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="px-5 py-3 font-medium text-gray-800">
                                    #{formatTransferCode(t.id)}
                                </td>
                                <td className="px-5 py-3 text-gray-600">{t.sourceBranch?.name ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{t.destinationBranch?.name ?? "—"}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColors[t.status] ?? ""}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                    {t.createdAt ? format(new Date(t.createdAt), "d MMM yyyy") : "—"}
                                </td>
                                <td className="px-5 py-3">
                                    <button onClick={() => openDetail(t)}
                                            className="text-[#4A8FD4] hover:underline text-sm">View</button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}