'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReportsSidebar } from '@/components/layout/reports-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from 'react-hot-toast';

export default function ReportsLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
            <ReportsSidebar />
            <main className="flex-1 min-w-0 h-screen overflow-y-auto">
                {children}
            </main>
            <Toaster position="top-right" />
        </div>
    );
}