"use client";

import { useEffect, useState } from "react";
import { purchaseOrdersApi, suppliersApi, branchesApi, productsApi, extractArray, extractItem, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface PO {
    id: string | number; status: string; notes?: string; createdAt: string;
    supplier?: { id: string | number; name: string; email?: string };
    branch?: { id: string | number; name: string };
    createdBy?: { name: string };
    items?: POItem[];
    invoice?: Invoice;
}
interface POItem { id: string | number; quantity: number; unitCost: number; totalCost: number; product?: { name: string; sku: string; unit: string }; }
interface Invoice { id: string | number; invoiceNo: string; status: string; totalAmount: number; dueDate?: string; paidAt?: string; }

// CASCADE: include status fields so we can filter active-only in dropdowns
interface Supplier { id: string | number; name: string; isActive?: boolean; status?: string; }
interface Branch   { id: string | number; name: string; status?: string; }
interface Product  { id: string | number; name: string; sku: string; unit: string; costPrice?: number; status?: string; }

const STATUS_STEPS = ["DRAFT", "SENT", "RECEIVED", "CANCELLED"];

// Backend uses plain numeric IDs (not UUIDs), so format as a padded reference
// e.g. 1 -> "PO-000001" instead of assuming a string ID we can .slice()
function formatOrderId(id: string | number): string {
    return `PO-${String(id).padStart(6, "0")}`;
}

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

export default function PurchaseOrdersPage() {
    const { isAdmin, branchId: userBranchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : userBranchId != null ? String(userBranchId) : null);

    const [orders, setOrders] = useState<PO[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [view, setView] = useState<"list" | "detail" | "create" | "invoice">("list");
    const [selected, setSelected] = useState<PO | null>(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [saving, setSaving] = useState(false);

    const [createForm, setCreateForm] = useState({ supplierId: "", branchId: "", notes: "" });
    const [items, setItems] = useState([{ productId: "", quantity: "", unitCost: "" }]);
    const [invoiceForm, setInvoiceForm] = useState({ invoiceNo: "", totalAmount: "", dueDate: "", notes: "" });

    const load = () => Promise.all([
        scoped.getPurchaseOrders(),
        suppliersApi.getAll(),
        isAdmin ? branchesApi.getAll() : Promise.resolve({ data: [] }),
        productsApi.getAll(),
    ]).then(([o, s, b, p]) => {
        setOrders(extractArray<PO>(o.data));
        setSuppliers(extractArray<Supplier>(s.data));
        setBranches(extractArray<Branch>(b.data));
        setProducts(extractArray<Product>(p.data));
    }).catch(() => toast.error("Failed to load"));

    useEffect(() => { load(); }, []);

    // ── CASCADE: active-only lists for dropdowns ──────────────────────────────
    const activeSuppliers = suppliers.filter(s =>
        s.isActive === true || s.status === "ACTIVE" ||
        (s.isActive === undefined && s.status === undefined)
    );
    const activeBranches = branches.filter(b => b.status === "ACTIVE" || b.status === undefined);
    const activeProducts = products.filter(p => p.status === "ACTIVE" || p.status === undefined);

    const openDetail = async (po: PO) => {
        try {
            const res = await purchaseOrdersApi.getById(po.id);
            setSelected(extractItem<PO>(res.data));
            setView("detail");
        } catch { toast.error("Failed to load order"); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const branchIdValue = createForm.branchId || userBranchId;
            const payload = {
                supplierId: Number(createForm.supplierId),
                branchId:   branchIdValue ? Number(branchIdValue) : undefined,
                notes:      createForm.notes || undefined,
                items: items
                    .filter(i => i.productId && i.quantity)
                    .map(i => ({
                        productId: Number(i.productId),
                        quantity:  parseInt(i.quantity),
                        unitCost:  parseFloat(i.unitCost) || 0,
                    })),
            };
            if (!payload.items.length) {
                toast.error("Add at least one product item");
                setSaving(false);
                return;
            }
            await purchaseOrdersApi.create(payload);
            toast.success("Purchase order created");
            setView("list");
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to create";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    const handleStatusUpdate = async (id: string | number, status: string) => {
        try {
            await purchaseOrdersApi.updateStatus(id, status);
            toast.success(`Order marked as ${status.toLowerCase()}`);
            const res = await purchaseOrdersApi.getById(id);
            const updated = extractItem<PO>(res.data);
            setSelected(updated);
            if (status === "RECEIVED") {
                const total = updated.items?.reduce((s, i) => s + Number(i.totalCost ?? 0), 0) ?? 0;
                setInvoiceForm({ invoiceNo: "", totalAmount: String(total), dueDate: "", notes: "" });
                setView("invoice");
            }
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to update status";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setSaving(true);
        try {
            await purchaseOrdersApi.createInvoice(selected.id, {
                invoiceNo:   invoiceForm.invoiceNo,
                totalAmount: parseFloat(invoiceForm.totalAmount),
                dueDate: invoiceForm.dueDate
                    ? new Date(invoiceForm.dueDate).toISOString()
                    : undefined,
                notes: invoiceForm.notes || undefined,
            });
            toast.success("Invoice created");
            const res = await purchaseOrdersApi.getById(selected.id);
            setSelected(extractItem<PO>(res.data));
            setView("detail");
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to create invoice";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    const handlePayInvoice = async () => {
        if (!selected) return;
        try {
            await purchaseOrdersApi.payInvoice(selected.id);
            toast.success("Invoice marked as paid");
            const res = await purchaseOrdersApi.getById(selected.id);
            setSelected(extractItem<PO>(res.data));
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to pay invoice";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const filtered = orders.filter(o => !filterStatus || o.status === filterStatus);
    const orderTotal = (po: PO) => po.items?.reduce((s, i) => s + Number(i.totalCost ?? 0), 0) ?? 0;

    // ── CREATE VIEW ──────────────────────────────────────────────────────────
    if (view === "create") return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-gray-900">New Purchase Order</h1>
                <button onClick={() => setView("list")} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Supplier</label>
                        <select value={createForm.supplierId}
                                onChange={e => setCreateForm(p => ({ ...p, supplierId: e.target.value }))}
                                required
                                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none bg-white">
                            <option value="">Select supplier</option>
                            {/* CASCADE: only active suppliers */}
                            {activeSuppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {activeSuppliers.length === 0 && (
                            <p className="text-xs text-orange-500 mt-1">No active suppliers — reactivate a supplier first.</p>
                        )}
                    </div>

                    {isAdmin ? (
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Destination Branch</label>
                            <select value={createForm.branchId}
                                    onChange={e => setCreateForm(p => ({ ...p, branchId: e.target.value }))}
                                    required
                                    className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none bg-white">
                                <option value="">Select branch</option>
                                {/* CASCADE: only active branches */}
                                {activeBranches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            {activeBranches.length === 0 && (
                                <p className="text-xs text-orange-500 mt-1">No active branches available.</p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded px-3 py-2.5 text-sm text-gray-600 flex items-center">
                            Destination: <span className="font-medium ml-1">Your branch</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                    <input value={createForm.notes}
                           onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                           placeholder="e.g. Urgent restock"
                           className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Order Items</p>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-3 items-end">
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Product</label>
                                    <select value={item.productId}
                                            onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: e.target.value } : it))}
                                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none bg-white">
                                        <option value="">Select product</option>
                                        {/* CASCADE: only active products */}
                                        {activeProducts.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                                    <input type="number" min="1"
                                           value={item.quantity}
                                           onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))}
                                           placeholder="0"
                                           className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none" />
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>
                                        <input type="number" min="0" step="0.01"
                                               value={item.unitCost}
                                               onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, unitCost: e.target.value } : it))}
                                               placeholder="0.00"
                                               className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none" />
                                    </div>
                                    {items.length > 1 && (
                                        <button type="button"
                                                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                                                className="mb-0.5 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button"
                                onClick={() => setItems(p => [...p, { productId: "", quantity: "", unitCost: "" }])}
                                className="text-sm text-[#4A8FD4] hover:underline">+ Add item</button>
                    </div>
                </div>

                {items.some(i => i.quantity && i.unitCost) && (
                    <div className="flex justify-end text-sm text-gray-600 border-t border-gray-100 pt-3">
                        <span className="mr-6">Estimated total</span>
                        <span className="font-semibold text-gray-900">
                            Rs. {items.reduce((sum, i) => sum + (parseInt(i.quantity) || 0) * (parseFloat(i.unitCost) || 0), 0).toLocaleString()}
                        </span>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setView("list")}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={saving}
                            className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                        {saving ? "Creating…" : "Create Order"}
                    </button>
                </div>
            </form>
        </div>
    );

    // ── INVOICE VIEW ─────────────────────────────────────────────────────────
    if (view === "invoice" && selected) return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-gray-900">
                    Create Invoice — {formatOrderId(selected.id)}
                </h1>
                <button onClick={() => setView("detail")} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md mb-6">
                Order received successfully. You can now create an invoice for this purchase order.
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Invoice number</label>
                        <input value={invoiceForm.invoiceNo}
                               onChange={e => setInvoiceForm(p => ({ ...p, invoiceNo: e.target.value }))}
                               placeholder="INV-2026-001" required
                               className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Total amount (Rs.)</label>
                        <input type="number" min="0" step="0.01"
                               value={invoiceForm.totalAmount}
                               onChange={e => setInvoiceForm(p => ({ ...p, totalAmount: e.target.value }))}
                               placeholder="9000.00" required
                               className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Due date (optional)</label>
                    <input type="date"
                           value={invoiceForm.dueDate}
                           onChange={e => setInvoiceForm(p => ({ ...p, dueDate: e.target.value }))}
                           className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                    <input value={invoiceForm.notes}
                           onChange={e => setInvoiceForm(p => ({ ...p, notes: e.target.value }))}
                           placeholder="e.g. Net 30 payment terms"
                           className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setView("detail")}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={saving}
                            className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                        {saving ? "Creating…" : "Create Invoice"}
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
                        Purchase Orders / {formatOrderId(selected.id)}
                    </p>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Purchase Order #{formatOrderId(selected.id)}
                    </h1>
                </div>
                <div className="flex gap-3">
                    {selected.status === "DRAFT" && (
                        <>
                            <button onClick={() => handleStatusUpdate(selected.id, "CANCELLED")}
                                    className="text-sm border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-50">
                                Cancel Order
                            </button>
                            <button onClick={() => handleStatusUpdate(selected.id, "SENT")}
                                    className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">
                                Mark as Sent
                            </button>
                        </>
                    )}
                    {selected.status === "SENT" && (
                        <button onClick={() => handleStatusUpdate(selected.id, "RECEIVED")}
                                className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">
                            Mark as Received
                        </button>
                    )}
                </div>
            </div>

            <StatusBar status={selected.status} />

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                <div className="grid grid-cols-3 gap-8 mb-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Supplier</p>
                        <p className="font-semibold text-gray-800">{selected.supplier?.name ?? "—"}</p>
                        {selected.supplier?.email && (
                            <p className="text-sm text-gray-500">{selected.supplier.email}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Destination Branch</p>
                        <p className="font-semibold text-gray-800">{selected.branch?.name ?? "—"}</p>
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

                <p className="text-sm font-medium text-gray-700 mb-3">Order items</p>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-2 text-left font-medium">Product</th>
                        <th className="py-2 text-left font-medium">SKU</th>
                        <th className="py-2 text-left font-medium">Unit</th>
                        <th className="py-2 text-left font-medium">Qty</th>
                        <th className="py-2 text-left font-medium">Unit Cost</th>
                        <th className="py-2 text-left font-medium">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(selected.items ?? []).map(item => (
                        <tr key={item.id} className="border-b border-gray-50">
                            <td className="py-3 text-gray-800">{item.product?.name ?? "—"}</td>
                            <td className="py-3 text-gray-500">{item.product?.sku ?? "—"}</td>
                            <td className="py-3 text-gray-500">{item.product?.unit ?? "—"}</td>
                            <td className="py-3 text-gray-600">{item.quantity}</td>
                            <td className="py-3 text-gray-600">Rs. {Number(item.unitCost).toLocaleString()}</td>
                            <td className="py-3 text-gray-800 font-medium">Rs. {Number(item.totalCost).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mr-8">Order total</p>
                    <p className="font-semibold text-gray-900">Rs. {orderTotal(selected).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-medium text-gray-700 mb-4">Invoice</p>
                {!selected.invoice ? (
                    <p className="text-sm text-gray-400 italic">
                        No invoice yet — mark order as Received to create an invoice.
                    </p>
                ) : (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <p className="font-semibold text-gray-800">{selected.invoice.invoiceNo}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                selected.invoice.status === "PAID"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-orange-50 text-orange-600 border-orange-200"
                            }`}>
                                {selected.invoice.status}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Invoice No.</span>
                                <span>{selected.invoice.invoiceNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total amount</span>
                                <span>Rs. {Number(selected.invoice.totalAmount).toLocaleString()}.00</span>
                            </div>
                            {selected.invoice.dueDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Due date</span>
                                    <span>{format(new Date(selected.invoice.dueDate), "d MMM yyyy")}</span>
                                </div>
                            )}
                            {selected.invoice.paidAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Paid on</span>
                                    <span className="text-green-700">{format(new Date(selected.invoice.paidAt), "d MMM yyyy")}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span>Rs. {Number(selected.invoice.totalAmount).toLocaleString()}.00</span>
                            </div>
                        </div>
                        {selected.invoice.status !== "PAID" && (
                            <div className="flex justify-end mt-4">
                                <button onClick={handlePayInvoice}
                                        className="text-sm bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800">
                                    Mark as Paid
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // ── LIST VIEW ────────────────────────────────────────────────────────────
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Purchase Orders</h1>
                <button onClick={() => {
                    setCreateForm({ supplierId: "", branchId: "", notes: "" });
                    setItems([{ productId: "", quantity: "", unitCost: "" }]);
                    setView("create");
                }} className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">
                    + New Order
                </button>
            </div>

            <div className="flex gap-3 mb-5">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Status</option>
                    {["DRAFT", "SENT", "RECEIVED", "CANCELLED"].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Order</th>
                        <th className="px-5 py-3 text-left font-medium">Supplier</th>
                        <th className="px-5 py-3 text-left font-medium">Branch</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        <th className="px-5 py-3 text-left font-medium">Date</th>
                        <th className="px-5 py-3 text-left font-medium"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-5 py-10 text-center text-gray-400">No purchase orders</td>
                        </tr>
                    )}
                    {filtered.map(po => {
                        const statusColors: Record<string, string> = {
                            DRAFT:     "bg-gray-100 text-gray-500 border-gray-200",
                            SENT:      "bg-blue-50 text-blue-600 border-blue-200",
                            RECEIVED:  "bg-green-50 text-green-700 border-green-200",
                            CANCELLED: "bg-red-50 text-red-600 border-red-200",
                        };
                        return (
                            <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="px-5 py-3 font-medium text-gray-800">
                                    {formatOrderId(po.id)}
                                </td>
                                <td className="px-5 py-3 text-gray-600">{po.supplier?.name ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{po.branch?.name ?? "—"}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColors[po.status] ?? ""}`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                    {po.createdAt ? format(new Date(po.createdAt), "d MMM yyyy") : "—"}
                                </td>
                                <td className="px-5 py-3">
                                    <button onClick={() => openDetail(po)}
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