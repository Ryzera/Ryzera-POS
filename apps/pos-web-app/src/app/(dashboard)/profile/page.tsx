"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { authApi, branchesApi, extractArray } from "@/lib/api";
import toast from "react-hot-toast";

interface Branch { id: string; name: string; }

export default function ProfilePage() {
    const { user, isAdmin } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState("STAFF");
    const [form, setForm] = useState({
        fullName: "", email: "", password: "", role: "STAFF", branchId: "",
    });

    useEffect(() => {
        if (isAdmin) {
            branchesApi.getAll().then(r => setBranches(extractArray<Branch>(r.data))).catch(() => {});
        }
    }, [isAdmin]);

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const roleLabel = () => {
        switch (user?.role) {
            case "ADMIN": return { label: "Administrator", sub: "Full system access" };
            case "MANAGER": return { label: "Manager", sub: "Branch management access" };
            default: return { label: "Staff", sub: "Limited access" };
        }
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setForm(p => ({ ...p, role, branchId: role === "ADMIN" ? "" : p.branchId }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        // Branch required for Manager and Staff
        if ((form.role === "MANAGER" || form.role === "STAFF") && !form.branchId) {
            toast.error("Please assign a branch for Manager or Staff roles");
            return;
        }
        setSaving(true);
        try {
            await authApi.register({
                name: form.fullName, email: form.email,
                password: form.password, role: form.role,
                branchId: form.branchId || undefined,
            });
            toast.success("User registered successfully");
            setForm({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" });
            setSelectedRole("STAFF");
        } catch { toast.error("Failed to register user"); } finally { setSaving(false); }
    };

    const { label, sub } = roleLabel();
    const branchRequired = form.role === "MANAGER" || form.role === "STAFF";

    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h1>

            {/* Profile card */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#4A8FD4] flex items-center justify-center text-white text-lg font-bold">
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{user?.name ?? "—"}</h2>
                        <p className="text-sm text-gray-500">{user?.email ?? "—"}</p>
                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">User ID</p>
                        <p className="text-sm text-gray-600 font-mono break-all">{user?.id ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Role</p>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Assigned Branch</p>
                        <p className="text-sm font-semibold text-gray-800">{user?.branch?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{user?.branch ? "" : "No branch restriction"}</p>
                    </div>
                </div>
            </div>

            {/* Admin register section */}
            {isAdmin && (
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <p className="text-sm font-medium text-gray-700 mb-1">Register new user</p>
                    <p className="text-sm text-gray-500 mb-5">Branch is required for Manager and Staff roles.</p>
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Full name</label>
                                <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                       placeholder="New staff member" required
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                       placeholder="staff@ryzera.com" required
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Password</label>
                                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                       placeholder="••••••••" required
                                       className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a]" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Role</label>
                                <select value={form.role} onChange={e => handleRoleChange(e.target.value)}
                                        className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none bg-white">
                                    <option value="STAFF">STAFF</option>
                                    <option value="MANAGER">MANAGER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                        </div>

                        {/* Branch field — required for MANAGER/STAFF, hidden for ADMIN */}
                        {form.role !== "ADMIN" && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    Assign branch <span className="text-red-400">*required for {form.role}</span>
                                </label>
                                <select value={form.branchId} onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))}
                                        required={branchRequired}
                                        className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none bg-white">
                                    <option value="">— Select branch —</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={saving}
                                    className="px-5 py-2 text-sm bg-[#1e2a4a] text-white rounded-md hover:bg-[#263559] disabled:opacity-60">
                                {saving ? "Registering…" : "Register User"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}