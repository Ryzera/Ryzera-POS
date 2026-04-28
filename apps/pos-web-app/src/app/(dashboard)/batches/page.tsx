"use client";

import { useEffect, useState } from "react";
import { productsApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Batch {
    id: string; batchNumber: string; quantity: number;
    manufactureDate?: string; expiryDate?: string;
    productId: string; product?: { id: string; name: string; sku: string };
    createdAt: string;
}
interface Product { id: string; name: string; sku: string; }

const emptyForm = { productId: "", batchNumber: "", quantity: "", manufactureDate: "", expiryDate: "" };

export default function BatchesPage() {
    const { isAdmin, branchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : branchId);

    const [batches, setBatches] = useState<Batch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Batch | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [dateError, setDateError] = useState("");

    const load = () => Promise.all([scoped.getBatches(), scoped.getProducts()])
        .then(([b, p]) => {
            setBatches(extractArray<Batch>(b.data));
            setProducts(extractArray<Product>(p.data));
        })
        .catch(() => toast.error("Failed to load"));

    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setDateError(""); setShowForm(true); };
    const openEdit = (b: Batch) => {
        setEditing(b);
        setForm({
            productId: b.productId ?? b.product?.id ?? "",
            batchNumber: b.batchNumber,
            quantity: String(b.quantity),
            manufactureDate: b.manufactureDate ? b.manufactureDate.split("T")[0] : "",
            expiryDate: b.expiryDate ? b.expiryDate.split("T")[0] : "",
        });
        setDateError(""); setShowForm(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
        setDateError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.manufactureDate && form.expiryDate && form.expiryDate <= form.manufactureDate) {
            setDateError("Expiry date must be after manufacture date."); return;
        }
        setSaving(true);
        try {
            const payload = {
                productId: form.productId,
                batchNumber: form.batchNumber,
                quantity: parseInt(form.quantity),
                manufactureDate: form.manufactureDate || undefined,
                expiryDate: form.expiryDate || undefined,
                // auto-attach branchId for manager/staff
                ...(isAdmin ? {} : { branchId }),
            };
            if (editing) {
                const { batchesApi } = await import("@/lib/api");
                await batchesApi.update(editing.id, payload);
            } else {
                const { batchesApi } = await import("@/lib/api");
                await batchesApi.create(payload);
            }
            toast.success(editing ? "Batch updated" : "Batch created");
            setShowForm(false); load();
        } catch { toast.error("Failed to save"); } finally { setSaving(false); }
    };

    const isExpiringSoon = (date?: string) => {
        if (!date) return false;
        const diff = new Date(date).getTime() - Date.now();
        return diff > 0 && diff < 7 * 24 * 3600000;
    };
    const isExpired = (date?: string) => date ? new Date(date) < new Date() : false;

    if (showForm) return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-gray-900">{editing ? "Edit Batch" : "Add Batch"}</h1>
                <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Product</label>
                        <select name="productId" value={form.productId} onChange={handleChange} required
                                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                            <option value="">Select product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Batch number</label>
                        <input name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="BATCH-001" required
                               className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="100" required
                               className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Manufacture date</label>
                        <input name="manufactureDate" type="date" value={form.manufactureDate} onChange={handleChange}
                               className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Expiry date</label>
                        <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange}
                               className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                    </div>
                </div>
                {dateError && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-md">{dateError}</div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                        {saving ? "Saving…" : "Save Batch"}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Batches</h1>
                <button onClick={openAdd} className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">+ Add Batch</button>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Batch No.</th>
                        <th className="px-5 py-3 text-left font-medium">Product</th>
                        <th className="px-5 py-3 text-left font-medium">Quantity</th>
                        <th className="px-5 py-3 text-left font-medium">Manufacture Date</th>
                        <th className="px-5 py-3 text-left font-medium">Expiry Date</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        <th className="px-5 py-3 text-left font-medium"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {batches.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No batches found</td></tr>}
                    {batches.map(b => {
                        const expired = isExpired(b.expiryDate);
                        const expiring = isExpiringSoon(b.expiryDate);
                        return (
                            <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="px-5 py-3 font-medium text-gray-800">{b.batchNumber}</td>
                                <td className="px-5 py-3 text-gray-600">{b.product?.name ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{b.quantity}</td>
                                <td className="px-5 py-3 text-gray-600">
                                    {b.manufactureDate ? format(new Date(b.manufactureDate), "d MMM yyyy") : "—"}
                                </td>
                                <td className="px-5 py-3 text-gray-600">
                                    {b.expiryDate ? format(new Date(b.expiryDate), "d MMM yyyy") : "—"}
                                </td>
                                <td className="px-5 py-3">
                                    {expired ? (
                                        <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">Expired</span>
                                    ) : expiring ? (
                                        <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium">Expiring Soon</span>
                                    ) : (
                                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Active</span>
                                    )}
                                </td>
                                <td className="px-5 py-3">
                                    <button onClick={() => openEdit(b)} className="text-[#4A8FD4] hover:underline text-sm">Edit</button>
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