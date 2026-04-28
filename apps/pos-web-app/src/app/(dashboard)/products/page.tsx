"use client";

import { useEffect, useState } from "react";
import { productsApi, categoriesApi, suppliersApi, extractArray } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface Product {
    id: string; name: string; sku: string; barcode?: string;
    categoryId: string; category?: { id: string; name: string };
    supplierId?: string; supplier?: { id: string; name: string };
    description?: string; price: number; costPrice: number;
    minStock: number; unit: string; status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
}
interface Category { id: string; name: string; }
interface Supplier { id: string; name: string; isActive?: boolean; status?: string; }

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        ACTIVE:       "bg-green-50 text-green-700 border-green-200",
        INACTIVE:     "bg-gray-100 text-gray-500 border-gray-200",
        DISCONTINUED: "bg-red-50 text-red-500 border-red-200",
    };
    const labels: Record<string, string> = {
        ACTIVE: "Active", INACTIVE: "Inactive", DISCONTINUED: "Discontinued",
    };
    return (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${map[status] ?? map.INACTIVE}`}>
            {labels[status] ?? status}
        </span>
    );
}

// Confirmation dialog state
interface Confirm { show: boolean; title: string; message: string; onConfirm: () => void; }

const emptyForm = {
    name: "", sku: "", barcode: "", categoryId: "", supplierId: "",
    description: "", price: "", costPrice: "", minStock: "", unit: "PCS", status: "ACTIVE",
};

export default function ProductsPage() {
    const { isAdmin, isManager } = useAuth();
    const canEdit = isAdmin || isManager;

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterSupplier, setFilterSupplier] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<typeof emptyForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [confirm, setConfirm] = useState<Confirm>({ show: false, title: "", message: "", onConfirm: () => {} });

    const load = () => {
        Promise.all([productsApi.getAll(), categoriesApi.getAll(), suppliersApi.getAll()])
            .then(([p, c, s]) => {
                setProducts(extractArray<Product>(p.data));
                setCategories(extractArray<Category>(c.data));
                setSuppliers(extractArray<Supplier>(s.data));
            })
            .catch(() => toast.error("Failed to load products"));
    };

    useEffect(() => { load(); }, []);

    // ── Active-only lists for dropdowns (cascade rule) ──
    const activeSuppliers = suppliers.filter(s => s.isActive === true || s.status === "ACTIVE" || (s.isActive === undefined && s.status === undefined));

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({
            name: p.name, sku: p.sku, barcode: p.barcode ?? "",
            categoryId: p.categoryId ?? p.category?.id ?? "",
            supplierId: p.supplierId ?? p.supplier?.id ?? "",
            description: p.description ?? "",
            price: String(p.price ?? ""), costPrice: String(p.costPrice ?? ""),
            minStock: String(p.minStock ?? ""), unit: p.unit, status: p.status,
        });
        setShowForm(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            const payload = {
                name: form.name, sku: form.sku, barcode: form.barcode || undefined,
                categoryId: form.categoryId || undefined, supplierId: form.supplierId || undefined,
                description: form.description || undefined,
                price: parseFloat(form.price), costPrice: parseFloat(form.costPrice),
                minStock: parseInt(form.minStock), unit: form.unit, status: form.status,
            };
            if (editing) await productsApi.update(editing.id, payload);
            else await productsApi.create(payload);
            toast.success(editing ? "Product updated" : "Product created");
            setShowForm(false); load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to save product";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    // ── Deactivate with confirmation ──
    const handleDeactivate = (p: Product) => {
        setConfirm({
            show: true,
            title: "Deactivate Product",
            message: `Are you sure you want to deactivate "${p.name}"? It will be hidden from stock levels, purchase orders, and transfers until reactivated.`,
            onConfirm: async () => {
                setConfirm(c => ({ ...c, show: false }));
                try {
                    await productsApi.update(p.id, { status: "INACTIVE" });
                    toast.success(`"${p.name}" deactivated`);
                    load();
                } catch (err: any) {
                    const msg = err?.response?.data?.message ?? "Failed to deactivate";
                    toast.error(Array.isArray(msg) ? msg[0] : msg);
                }
            },
        });
    };

    // ── Reactivate ──
    const handleReactivate = async (p: Product) => {
        try {
            await productsApi.update(p.id, { status: "ACTIVE" });
            toast.success(`"${p.name}" reactivated`);
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to reactivate";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        return (
            (!search || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q)) &&
            (!filterCat || (p.categoryId ?? p.category?.id) === filterCat) &&
            (!filterStatus || p.status === filterStatus) &&
            (!filterSupplier || (p.supplierId ?? p.supplier?.id) === filterSupplier)
        );
    });

    // ── Edit / Add Form ──
    if (showForm && canEdit) return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-gray-900">{editing ? "Edit Product" : "Add Product"}</h1>
                <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-4">Basic information</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Product name</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Coca Cola 330ml" required
                                   className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">SKU</label>
                                <input name="sku" value={form.sku} onChange={handleChange} placeholder="CC-330"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Barcode</label>
                                <input name="barcode" value={form.barcode} onChange={handleChange} placeholder="5449000000996"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Category</label>
                                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                                        className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Supplier</label>
                                <select name="supplierId" value={form.supplierId} onChange={handleChange}
                                        className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                                    <option value="">Select supplier</option>
                                    {/* Only active suppliers in dropdown */}
                                    {activeSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange}
                                      placeholder="Short product description..." rows={3}
                                      className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] resize-none" />
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-4">Pricing & stock</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Selling price (Rs.)</label>
                            <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="250.00"
                                   className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Cost price (Rs.)</label>
                            <input name="costPrice" value={form.costPrice} onChange={handleChange} type="number" placeholder="180.00"
                                   className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Min stock level</label>
                            <input name="minStock" value={form.minStock} onChange={handleChange} type="number" placeholder="5"
                                   className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Unit of measure</label>
                            <select name="unit" value={form.unit} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                                {["PCS","KG","PACK","LTR","BOX","MTR"].map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Status</label>
                            <select name="status" value={form.status} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={saving}
                            className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md hover:bg-[#263559] disabled:opacity-60">
                        {saving ? "Saving…" : "Save Product"}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="p-6">
            {/* Confirmation dialog */}
            {confirm.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="font-semibold text-gray-900 mb-2">{confirm.title}</h2>
                        <p className="text-sm text-gray-500 mb-6">{confirm.message}</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirm(c => ({ ...c, show: false }))}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
                            <button onClick={confirm.onConfirm}
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                <div className="flex items-center gap-3">
                    <button className="text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50">Export CSV</button>
                    {canEdit && (
                        <button onClick={openAdd} className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">+ Add Product</button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, SKU, barcode…"
                       className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#1e2a4a]" />
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DISCONTINUED">Discontinued</option>
                </select>
                <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All Suppliers</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Product</th>
                        <th className="px-5 py-3 text-left font-medium">Category</th>
                        <th className="px-5 py-3 text-left font-medium">Unit</th>
                        <th className="px-5 py-3 text-left font-medium">Price</th>
                        <th className="px-5 py-3 text-left font-medium">Cost</th>
                        <th className="px-5 py-3 text-left font-medium">Min Stock</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        {canEdit && <th className="px-5 py-3 text-left font-medium"></th>}
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr><td colSpan={canEdit ? 8 : 7} className="px-5 py-10 text-center text-gray-400">No products found</td></tr>
                    )}
                    {filtered.map(p => (
                        <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${p.status !== "ACTIVE" ? "opacity-60" : ""}`}>
                            <td className="px-5 py-3">
                                <p className="font-medium text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-400">{p.sku}{p.barcode ? ` · ${p.barcode}` : ""}</p>
                            </td>
                            <td className="px-5 py-3 text-gray-600">{p.category?.name ?? "—"}</td>
                            <td className="px-5 py-3 text-gray-600">{p.unit}</td>
                            <td className="px-5 py-3 text-gray-600">Rs. {Number(p.price).toLocaleString()}</td>
                            <td className="px-5 py-3 text-gray-600">Rs. {Number(p.costPrice).toLocaleString()}</td>
                            <td className="px-5 py-3 text-gray-600">{p.minStock}</td>
                            <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                            {canEdit && (
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        {p.status === "ACTIVE" && (
                                            <>
                                                <button onClick={() => openEdit(p)}
                                                        className="text-[#4A8FD4] hover:underline text-sm">Edit</button>
                                                <button onClick={() => handleDeactivate(p)}
                                                        className="text-red-500 hover:underline text-sm">Deactivate</button>
                                            </>
                                        )}
                                        {p.status === "INACTIVE" && (
                                            <>
                                                <button onClick={() => openEdit(p)}
                                                        className="text-[#4A8FD4] hover:underline text-sm">Edit</button>
                                                <button onClick={() => handleReactivate(p)}
                                                        className="text-green-600 hover:underline text-sm">Reactivate</button>
                                            </>
                                        )}
                                        {p.status === "DISCONTINUED" && (
                                            <span className="text-xs text-gray-400 italic">Discontinued</span>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}