"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, branchesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Branch { id: string; name: string; }

export default function RegisterPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: "", email: "", password: "", role: "ADMIN", branchId: "",
    });

    useEffect(() => {
        branchesApi.getAll().then((res) => {
            const data = res.data;
            setBranches(Array.isArray(data) ? data : data?.data ?? []);
        }).catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.register({
                name: form.fullName,
                email: form.email,
                password: form.password,
                role: form.role,
                branchId: form.branchId || undefined,
            });
            toast.success("Account created! Please sign in.");
            router.push("/login");
        } catch {
            toast.error("Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="w-[420px] bg-[#1e2a4a] flex flex-col justify-between p-10 shrink-0">
                <div>
                    <h1 className="text-white text-2xl font-bold">Ryzera POS</h1>
                    <p className="text-white/50 text-sm mt-1">Inventory Management</p>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                    Only administrators can create new staff accounts.
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center bg-white px-10">
                <div className="w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
                    <p className="text-sm text-gray-500 mb-8">Add a new team member</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange}
                                   placeholder="John Perera" required
                                   className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] focus:ring-1 focus:ring-[#1e2a4a]" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                   placeholder="john@ryzera.com" required
                                   className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] focus:ring-1 focus:ring-[#1e2a4a]" />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <input name="password" type="password" value={form.password} onChange={handleChange}
                                       placeholder="••••••••" required
                                       className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] focus:ring-1 focus:ring-[#1e2a4a]" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                <select name="role" value={form.role} onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="MANAGER">MANAGER</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign branch (optional)</label>
                            <select name="branchId" value={form.branchId} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] bg-white">
                                <option value="">— No branch —</option>
                                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <button type="submit" disabled={loading}
                                className="w-full bg-[#1e2a4a] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#263559] disabled:opacity-60">
                            {loading ? "Creating…" : "Create account"}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <Link href="/login" className="text-xs text-[#4A8FD4] hover:underline">
                            ← Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}