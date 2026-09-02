"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-6 h-6 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        /* Change min-h-screen -> h-screen overflow-hidden */
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            {/* Add h-full and overflow-y-auto to main */}
            <main className="flex-1 min-w-0 h-full overflow-y-auto">
                {children}
            </main>
            <Toaster position="top-right" />
        </div>
    );
}