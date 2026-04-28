"use client";

import { useEffect, useState } from "react";
import { suppliersApi, extractArray } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface Supplier {
    id: string; name: string; contactName?: string; contactPerson?: string;
    email?: string; phone?: string; address?: string;
    leadTimeDays?: number; isActive?: boolean; status?: "ACTIVE" | "INACTIVE";
}

interface Confirm { show: boolean; title: string; message: string; onConfirm: () => void; }

const emptyForm = { name: "", contactPerson: "", email: "", phone: "", address: "", leadTimeDays: "" };

export default function SuppliersPage() {
    const { isAdmin, isManager } = useAuth();
    const canEdit = isAdmin || isManager;

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [confirm, setConfirm] = useState<Confirm>({ show: false, title: "", message: "", onConfirm: () => {} });

    const load = () => suppliersApi.getAll()
        .then(r => setSuppliers(extractArray<Supplier>(r.data)))
        .catch(() => toast.error("Failed to load"));

    useEffect(() => { load(); }, []);

    const isSupplierActive = (s: Supplier) => s.isActive === true || s.status === "ACTIVE" || (s.isActive === undefined && s.status === undefined);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
    const openEdit = (s: Supplier) => {
        setEditing(s);
        setForm({
            name: s.name,
            contactPerson: s.contactPerson ?? s.contactName ?? "",
            email: s.email ?? "", phone: s.phone ?? "", address: s.address ?? "",
            leadTimeDays: String(s.leadTimeDays ?? ""),
        });
        setShowForm(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            const payload = {
                name: form.name,
                contactName: form.contactPerson || undefined,
                email: form.email || undefined,
                phone: form.phone || undefined,
                address: form.address || undefined,
                leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
            };
            if (editing) await suppliersApi.update(editing.id, payload);
            else await suppliersApi.create(payload);
            toast.success(editing ? "Supplier updated" : "Supplier created");
            setShowForm(false); load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to save";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    // ── Deactivate with confirmation ──
    const handleDeactivate = (s: Supplier) => {
        setConfirm({
            show: true,
            title: "Deactivate Supplier",
            message: `Are you sure you want to deactivate "${s.name}"? They will be hidden from new purchase orders until reactivated. Existing orders are not affected.`,
            onConfirm: async () => {
                setConfirm(c => ({ ...c, show: false }));
                try {
                    await suppliersApi.deactivate(s.id);
                    toast.success(`"${s.name}" deactivated`);
                    load();
                } catch (err: any) {
                    const msg = err?.response?.data?.message ?? "Failed to deactivate";
                    toast.error(Array.isArray(msg) ? msg[0] : msg);
                }
            },
        });
    };

    // ── Reactivate — supplier uses PUT with isActive: true ──
    const handleReactivate = async (s: Supplier) => {
        try {
            await suppliersApi.update(s.id, { isActive: true });
            toast.success(`"${s.name}" reactivated`);
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to reactivate";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const filtered = suppliers.filter(s => {
        const active = isSupplierActive(s);
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus ||
            (filterStatus === "active" && active) ||
            (filterStatus === "inactive" && !active);
        return matchSearch && matchStatus;
    });

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
                <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
                {canEdit && (
                    <button onClick={openAdd}
                            className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">
                        + Add Supplier
                    </button>
                )}
            </div>

            <div className="flex gap-3 mb-5">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…"
                       className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#1e2a4a]" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-5 py-3 text-left font-medium">Name</th>
                        <th className="px-5 py-3 text-left font-medium">Contact</th>
                        <th className="px-5 py-3 text-left font-medium">Email</th>
                        <th className="px-5 py-3 text-left font-medium">Phone</th>
                        <th className="px-5 py-3 text-left font-medium">Lead Time</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        {canEdit && <th className="px-5 py-3 text-left font-medium"></th>}
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr><td colSpan={canEdit ? 7 : 6} className="px-5 py-10 text-center text-gray-400">No suppliers</td></tr>
                    )}
                    {filtered.map(s => {
                        const active = isSupplierActive(s);
                        return (
                            <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${!active ? "opacity-60" : ""}`}>
                                <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                                <td className="px-5 py-3 text-gray-600">{s.contactPerson ?? s.contactName ?? "—"}</td>
                                <td className="px-5 py-3 text-[#4A8FD4]">{s.email ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{s.phone ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{s.leadTimeDays ? `${s.leadTimeDays} days` : "—"}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                                        active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                                    }`}>
                                        {active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                {canEdit && (
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {active ? (
                                                <>
                                                    <button onClick={() => openEdit(s)}
                                                            className="text-[#4A8FD4] hover:underline text-sm">Edit</button>
                                                    <button onClick={() => handleDeactivate(s)}
                                                            className="text-red-500 hover:underline text-sm">Deactivate</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => openEdit(s)}
                                                            className="text-[#4A8FD4] hover:underline text-sm">Edit</button>
                                                    <button onClick={() => handleReactivate(s)}
                                                            className="text-green-600 hover:underline text-sm font-medium">Reactivate</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {showForm && canEdit && (
                <div className="mt-6 bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-500 mb-5">
                        {editing ? "Edit supplier" : "Add new supplier"}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Supplier name</label>
                                <input name="name" value={form.name} onChange={handleChange}
                                       placeholder="Ceylon Beverages Ltd" required
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Contact person</label>
                                <input name="contactPerson" value={form.contactPerson} onChange={handleChange}
                                       placeholder="Kamal Perera"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange}
                                       placeholder="kamal@ceylonbev.lk"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                <input name="phone" value={form.phone} onChange={handleChange}
                                       placeholder="+94112345678"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Lead time (days)</label>
                                <input name="leadTimeDays" type="number" value={form.leadTimeDays} onChange={handleChange}
                                       placeholder="3"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Address</label>
                                <input name="address" value={form.address} onChange={handleChange}
                                       placeholder="45 Industrial Zone, Colombo"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                            <button type="submit" disabled={saving}
                                    className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                                {saving ? "Saving…" : "Save Supplier"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}