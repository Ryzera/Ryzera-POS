"use client";

import { useEffect, useState } from "react";
import { branchesApi, extractArray } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Branch {
    id: string; name: string; address?: string; phone?: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"; createdAt: string;
}

interface Confirm { show: boolean; title: string; message: string; onConfirm: () => void; }

const emptyForm = { name: "", phone: "", address: "" };

export default function BranchesPage() {
    const { isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin) router.replace("/");
    }, [isAdmin, router]);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Branch | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    const [confirm, setConfirm] = useState<Confirm>({ show: false, title: "", message: "", onConfirm: () => {} });

    const load = () => branchesApi.getAll()
        .then(r => setBranches(extractArray<Branch>(r.data)))
        .catch(() => toast.error("Failed to load"));

    useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

    if (!isAdmin) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-sm">Access restricted</p>
        </div>
    );

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
    const openEdit = (b: Branch) => {
        setEditing(b);
        setForm({ name: b.name, phone: b.phone ?? "", address: b.address ?? "" });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await branchesApi.update(editing.id, form);
            else await branchesApi.create(form);
            toast.success(editing ? "Branch updated" : "Branch created");
            setShowForm(false); load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to save";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    // ── Deactivate with confirmation ──
    const handleDeactivate = (b: Branch) => {
        setConfirm({
            show: true,
            title: "Deactivate Branch",
            message: `Are you sure you want to deactivate "${b.name}"? It will be hidden from transfers and purchase order destinations until reactivated. Existing stock records are preserved.`,
            onConfirm: async () => {
                setConfirm(c => ({ ...c, show: false }));
                try {
                    await branchesApi.deactivate(b.id);
                    toast.success(`"${b.name}" deactivated`);
                    load();
                } catch (err: any) {
                    const msg = err?.response?.data?.message ?? "Failed to deactivate";
                    toast.error(Array.isArray(msg) ? msg[0] : msg);
                }
            },
        });
    };

    // ── Reactivate ──
    const handleReactivate = async (b: Branch) => {
        try {
            await branchesApi.reactivate(b.id);
            toast.success(`"${b.name}" reactivated`);
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to reactivate";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const filtered = branches.filter(b =>
        !filterStatus || b.status === filterStatus
    );

    const statusColors: Record<string, string> = {
        ACTIVE:    "bg-green-50 text-green-700 border-green-200",
        INACTIVE:  "bg-gray-100 text-gray-500 border-gray-200",
        SUSPENDED: "bg-orange-50 text-orange-600 border-orange-200",
    };

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
                <h1 className="text-xl font-semibold text-gray-900">Branches</h1>
                <div className="flex items-center gap-3">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none bg-white">
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                    <button onClick={openAdd}
                            className="text-sm bg-[#1e2a4a] text-white px-4 py-2 rounded-md hover:bg-[#263559]">
                        + Add Branch
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {filtered.length === 0 && (
                    <p className="text-gray-400 text-sm col-span-2 py-10 text-center">No branches found</p>
                )}
                {filtered.map(b => (
                    <div key={b.id} className={`bg-white rounded-lg border border-gray-100 shadow-sm p-5 ${b.status !== "ACTIVE" ? "opacity-70" : ""}`}>
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">{b.name}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColors[b.status] ?? statusColors.INACTIVE}`}>
                                {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                            </span>
                        </div>
                        {b.address && <p className="text-sm text-gray-500">{b.address}</p>}
                        {b.phone && <p className="text-sm text-gray-500">{b.phone}</p>}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                            <p className="text-xs text-gray-400">
                                Created {b.createdAt ? format(new Date(b.createdAt), "d MMM yyyy") : "—"}
                            </p>
                            <div className="flex gap-3">
                                {b.status === "ACTIVE" && (
                                    <>
                                        <button onClick={() => openEdit(b)}
                                                className="text-sm text-[#4A8FD4] hover:underline">Edit</button>
                                        <button onClick={() => handleDeactivate(b)}
                                                className="text-sm text-red-500 hover:underline">Deactivate</button>
                                    </>
                                )}
                                {b.status === "INACTIVE" && (
                                    <button onClick={() => handleReactivate(b)}
                                            className="text-sm text-green-600 hover:underline font-medium">Reactivate</button>
                                )}
                                {b.status === "SUSPENDED" && (
                                    <span className="text-xs text-orange-500 italic">Suspended — contact admin</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-500 mb-5">
                        {editing ? "Edit branch" : "Add new branch"}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Branch name</label>
                                <input value={form.name}
                                       onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                       placeholder="e.g. Galle Branch" required
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                <input value={form.phone}
                                       onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                       placeholder="+94912345678"
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Address</label>
                            <input value={form.address}
                                   onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                   placeholder="123 Main St, Galle"
                                   className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-md">Cancel</button>
                            <button type="submit" disabled={saving}
                                    className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md disabled:opacity-60">
                                {saving ? "Saving…" : "Save Branch"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}