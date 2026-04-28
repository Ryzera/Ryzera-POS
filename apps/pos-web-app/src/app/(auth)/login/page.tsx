"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-6 h-6 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(email, password);
            router.replace("/");
        } catch {
            toast.error("Invalid email or password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="w-[420px] bg-[#1e2a4a] flex flex-col justify-between p-10 shrink-0">
                <div>
                    <h1 className="text-white text-2xl font-bold">Ryzera POS</h1>
                    <p className="text-white/50 text-sm mt-1">Inventory Management</p>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                    Manage stock, branches, suppliers and orders — all in one place.
                </p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center bg-white px-10">
                <div className="w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                    <p className="text-sm text-gray-500 mb-8">Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ryzera.com"
                                required
                                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] focus:ring-1 focus:ring-[#1e2a4a] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-[#1e2a4a] focus:ring-1 focus:ring-[#1e2a4a] transition-colors"
                            />
                            <div className="flex justify-end mt-2">
                                <button type="button" className="text-xs text-[#4A8FD4] hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#1e2a4a] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#263559] transition-colors disabled:opacity-60"
                        >
                            {submitting ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    {/* Temporary admin setup link — remove after first admin is created */}
                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 mb-1">First time setup?</p>
                        <Link href="/register" className="text-xs text-[#4A8FD4] hover:underline font-medium">
                            Create admin account →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}