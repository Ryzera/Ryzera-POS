"use client";

import { useEffect, useState } from "react";
import { branchesApi, extractArray } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Modal, ModalHeader } from "@/components/ui/modal";

interface Branch {
    id: string;
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    createdAt: string;
}

interface RawBranch {
    id: number | string;
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

function normalizeBranch(raw: RawBranch): Branch {
    return {
        id: String(raw.id),
        name: raw.name,
        code: raw.code,
        address: raw.address,
        phone: raw.phone,
        status: raw.is_active === false ? "INACTIVE" : "ACTIVE",
        createdAt: raw.created_at ?? "",
    };
}

interface Confirm {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

const emptyForm = { name: "", code: "", phone: "", address: "" };

export default function BranchesPage() {
    const { isAdmin, user } = useAuth();
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

    const load = () =>
        branchesApi
            .getAll()
            .then((r) => {
                const raw = extractArray<RawBranch>(r.data);
                setBranches(raw.map(normalizeBranch));
            })
            .catch(() => toast.error("Failed to load branches"));

    useEffect(() => {
        if (isAdmin) load();
    }, [isAdmin]);

    if (!isAdmin)
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-sm">Access restricted</p>
            </div>
        );

    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (b: Branch) => {
        setEditing(b);
        setForm({
            name: b.name,
            code: b.code ?? "",
            phone: b.phone ?? "",
            address: b.address ?? "",
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim(),
                phone: form.phone.trim() || undefined,
                address: form.address.trim() || undefined,
                company_id: user?.company_id ? Number(user.company_id) : undefined,
            };

            if (editing) await branchesApi.update(editing.id, payload);
            else await branchesApi.create(payload);

            toast.success(editing ? "Branch updated" : "Branch created");
            setShowForm(false);
            load();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to save branch";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = (b: Branch) => {
        setConfirm({
            show: true,
            title: "Deactivate Branch",
            message: `Are you sure you want to deactivate "${b.name}"? It will be hidden from transfers and purchase order destinations until reactivated. Existing stock records are preserved.`,
            onConfirm: async () => {
                setConfirm((c) => ({ ...c, show: false }));
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

    const filtered = branches.filter((b) => !filterStatus || b.status === filterStatus);

    const statusVariant: Record<string, "success" | "secondary" | "warning"> = {
        ACTIVE: "success",
        INACTIVE: "secondary",
        SUSPENDED: "warning",
    };

    return (
        <div className="p-6">
            {/* Confirmation dialog */}
            <Modal open={confirm.show} onClose={() => setConfirm((c) => ({ ...c, show: false }))} className="max-w-md">
                <div className="p-6">
                    <h2 className="font-semibold text-gray-900 mb-2">{confirm.title}</h2>
                    <p className="text-sm text-gray-500 mb-6">{confirm.message}</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setConfirm((c) => ({ ...c, show: false }))}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirm.onConfirm}>
                            Deactivate
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Branches</h1>
                <div className="flex items-center gap-3">
                    <NativeSelect
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-40"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </NativeSelect>
                    <Button onClick={openAdd}>+ Add Branch</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {filtered.length === 0 && (
                    <p className="text-gray-400 text-sm col-span-2 py-10 text-center">
                        No branches found
                    </p>
                )}
                {filtered.map((b) => (
                    <Card
                        key={b.id}
                        className={`p-5 ${b.status !== "ACTIVE" ? "opacity-70" : ""}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-800">{b.name}</h3>
                                {b.code && <p className="text-xs text-gray-400">Code: {b.code}</p>}
                            </div>
                            <Badge variant={statusVariant[b.status] ?? "secondary"}>
                                {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                            </Badge>
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
                                        <Button variant="link" size="sm" className="p-0 h-auto text-[#4A8FD4]" onClick={() => openEdit(b)}>
                                            Edit
                                        </Button>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-red-500" onClick={() => handleDeactivate(b)}>
                                            Deactivate
                                        </Button>
                                    </>
                                )}
                                {b.status === "INACTIVE" && (
                                    <Button variant="link" size="sm" className="p-0 h-auto text-green-600 font-medium" onClick={() => handleReactivate(b)}>
                                        Reactivate
                                    </Button>
                                )}
                                {b.status === "SUSPENDED" && (
                                    <span className="text-xs text-orange-500 italic">
                                        Suspended — contact admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)}>
                <ModalHeader title={editing ? "Edit branch" : "Add new branch"} onClose={() => setShowForm(false)} />
                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Branch name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Galle Branch"
                                required
                            />
                        </div>
                        <div>
                            <Label>Branch code</Label>
                            <Input
                                value={form.code}
                                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                                placeholder="e.g. GAL01"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={form.phone}
                                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="+94912345678"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Address</Label>
                        <Input
                            value={form.address}
                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                            placeholder="123 Main St, Galle"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving…" : "Save Branch"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
