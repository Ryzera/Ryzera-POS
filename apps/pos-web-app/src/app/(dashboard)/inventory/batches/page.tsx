"use client";

import { useEffect, useState } from "react";
import { productsApi, extractArray, makeScopedApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Modal, ModalHeader } from "@/components/ui/modal";

interface Batch {
    id: string; batchNumber: string; quantity: number;
    manufactureDate?: string; expiryDate?: string;
    productId: string; product?: { id: string; name: string; sku: string };
    createdAt: string;
}
interface Product { id: string; name: string; sku: string; }

const emptyForm = { productId: "", batchNumber: "", quantity: "", manufactureDate: "", expiryDate: "" };

// Convert a plain date input value ("2026-08-18") to full ISO datetime.
// Returns undefined for empty strings so optional dates stay optional.
function toIsoDateTime(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    return new Date(dateStr).toISOString();
}

export default function BatchesPage() {
    const { isAdmin, branchId } = useAuth();
    const scoped = makeScopedApi(isAdmin ? null : branchId?.toString() ?? null);

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
                product_id: form.productId ? Number(form.productId) : undefined,
                batchNumber: form.batchNumber,
                quantity: parseInt(form.quantity),
                manufactureDate: toIsoDateTime(form.manufactureDate),
                expiryDate: toIsoDateTime(form.expiryDate),
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
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to save";
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        } finally { setSaving(false); }
    };

    const isExpiringSoon = (date?: string) => {
        if (!date) return false;
        const diff = new Date(date).getTime() - Date.now();
        return diff > 0 && diff < 7 * 24 * 3600000;
    };
    const isExpired = (date?: string) => date ? new Date(date) < new Date() : false;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Batches</h1>
                <Button onClick={openAdd}>+ Add Batch</Button>
            </div>

            <Card>
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
                                        <Badge variant="destructive">Expired</Badge>
                                    ) : expiring ? (
                                        <Badge variant="warning">Expiring Soon</Badge>
                                    ) : (
                                        <Badge variant="success">Active</Badge>
                                    )}
                                </td>
                                <td className="px-5 py-3">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 h-auto text-[#4A8FD4]"
                                        onClick={() => openEdit(b)}
                                    >
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </Card>

            <Modal open={showForm} onClose={() => setShowForm(false)}>
                <ModalHeader title={editing ? "Edit Batch" : "Add Batch"} onClose={() => setShowForm(false)} />
                <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <Label>Product</Label>
                            <Select name="productId" value={form.productId} onChange={handleChange} required>
                                <option value="">Select product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label>Batch number</Label>
                            <Input name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="BATCH-001" required />
                        </div>
                        <div>
                            <Label>Quantity</Label>
                            <Input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="100" required />
                        </div>
                        <div>
                            <Label>Manufacture date</Label>
                            <Input name="manufactureDate" type="date" value={form.manufactureDate} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Expiry date</Label>
                            <Input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
                        </div>
                    </div>
                    {dateError && (
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-md">{dateError}</div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving…" : "Save Batch"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}