"use client";

import { useEffect, useState } from "react";
import { categoriesApi, extractArray } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface Category {
    id: string;
    name: string;
    _count?: { products: number };
    productCount?: number;
}

export default function CategoriesPage() {
    const { isAdmin, isManager } = useAuth();
    const canEdit = isAdmin || isManager;

    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const load = () => categoriesApi.getAll()
        .then(r => setCategories(extractArray<Category>(r.data)))
        .catch(() => toast.error("Failed to load"));
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setName(""); setShowForm(true); };
    const openEdit = (c: Category) => { setEditing(c); setName(c.name); setShowForm(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await categoriesApi.update(editing.id, { name });
            else await categoriesApi.create({ name });
            toast.success(editing ? "Category updated" : "Category created");
            setShowForm(false); load();
        } catch { toast.error("Failed to save"); } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try { await categoriesApi.delete(id); toast.success("Deleted"); load(); }
        catch { toast.error("Cannot delete — category has products"); }
    };

    const getCount = (c: Category) => c._count?.products ?? c.productCount ?? 0;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
                {canEdit && (
                    <button onClick={openAdd} className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">+ Add Category</button>
                )}
            </div>

            <div className="flex gap-6">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">All Categories</p>
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="px-5 py-3 text-left font-medium">Name</th>
                                <th className="px-5 py-3 text-left font-medium">Products</th>
                                {canEdit && <th className="px-5 py-3 text-left font-medium"></th>}
                            </tr>
                            </thead>
                            <tbody>
                            {categories.length === 0 && (
                                <tr><td colSpan={canEdit ? 3 : 2} className="px-5 py-10 text-center text-gray-400">No categories yet</td></tr>
                            )}
                            {categories.map(c => {
                                const count = getCount(c);
                                return (
                                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${count > 0 ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                                                {count} {count === 1 ? "product" : "products"}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td className="px-5 py-3 flex items-center gap-3">
                                                <button onClick={() => openEdit(c)} className="text-[#4A8FD4] hover:underline text-sm">Edit</button>
                                                {count === 0 && (
                                                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showForm && canEdit && (
                    <div className="w-80 shrink-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add / Edit Category</p>
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Category name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Beverages" required
                                           className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                                </div>
                                <p className="text-xs text-gray-400">Note: Categories with active products cannot be deleted.</p>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                                    <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                                        {saving ? "Saving…" : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}