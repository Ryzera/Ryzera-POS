'use client';

import { useState, useMemo } from 'react';
import {
    DollarSign, ShoppingCart, Package,
    TriangleAlert, ChevronDown,
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useBranches }       from '@/hooks/useSalesReport';

import { KpiCard }              from './components/KpiCard';
import { SalesTargetBar }       from './components/SalesTargetBar';
import { LiveSalesCounter }     from './components/LiveSalesCounter';
import { SalesTrendChart }      from './components/SalesTrendChart';
import { LowStockAlerts }       from './components/LowStockAlerts';
import { NotificationsDropdown } from './components/NotificationsDropdown';

import { useDashboardKpi }   from '@/hooks/useDashboardKpi';
import { useLiveSales }      from '@/hooks/useLiveSales';
import { useSalesTrend }     from '@/hooks/useSalesTrend';
import { useLowStockAlerts } from '@/hooks/useLowStockAlerts';
import { formatCurrency }    from '@/lib/formatters';
import { useKpiTargetProgress } from '@/hooks/useKpiTargetProgress';

export function DashboardView() {
    const { user, isAdmin } = useAuth();

    const { data: branchesRaw = [] } = useBranches();

    const [selectedBranchId, setSelectedBranchId] = useState<string>('');

    // ── Header branch label for BRANCH_MANAGER pill ──────────────────────────
    const headerBranchLabel = useMemo(() => {
        if (isAdmin) return null;
        if (user?.branch_id) {
            const found = branchesRaw.find(
                b => String(b.branchId) === String(user.branch_id)
            );
            return found?.name ?? `Branch ${user.branch_id}`;
        }
        return null;
    }, [isAdmin, user?.branch_id, branchesRaw]);

    // ── Effective branchId for all API calls ─────────────────────────────────
    // SUPER_ADMIN:     dropdown selection (undefined = all branches)
    // BRANCH_MANAGER:  always their own branchId from JWT
    const effectiveBranchId = useMemo((): number | undefined => {
        if (!isAdmin) return user?.branch_id ?? undefined;
        return selectedBranchId ? Number(selectedBranchId) : undefined;
    }, [isAdmin, user?.branch_id, selectedBranchId]);

    // ── Data hooks ───────────────────────────────────────────────────────────
    const kpi       = useDashboardKpi(effectiveBranchId);
    const liveSales = useLiveSales(effectiveBranchId);
    const trend     = useSalesTrend(effectiveBranchId);
    const lowStock  = useLowStockAlerts(effectiveBranchId);
    const target    = useKpiTargetProgress(effectiveBranchId);

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30
                            shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
                            Dashboard
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                            Welcome back! Here's your business overview
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">

                        {/* SUPER_ADMIN — branch dropdown */}
                        {isAdmin && (
                            <div className="relative">
                                <select
                                    value={selectedBranchId}
                                    onChange={e => setSelectedBranchId(e.target.value)}
                                    className="appearance-none bg-blue-600 text-white text-[13px]
                                               font-semibold pl-4 pr-9 py-2.5 rounded-xl
                                               cursor-pointer border-0 focus:outline-none
                                               focus:ring-2 focus:ring-blue-400
                                               hover:bg-blue-700 transition-colors min-w-[160px]"
                                >
                                    <option value="">All Branches</option>
                                    {branchesRaw.map(b => (
                                        <option key={b.branchId} value={String(b.branchId)}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2
                                                        h-4 w-4 text-white pointer-events-none" />
                            </div>
                        )}

                        {/* BRANCH_MANAGER — static branch name pill */}
                        {!isAdmin && headerBranchLabel && (
                            <div className="bg-blue-600 text-white text-[13px] font-semibold
                                            px-5 py-2.5 rounded-xl whitespace-nowrap">
                                {headerBranchLabel}
                            </div>
                        )}

                        <NotificationsDropdown branchId={effectiveBranchId} />
                    </div>
                </div>
            </div>

            {/* ── Page Body ────────────────────────────────────────────────── */}
            <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {kpi.isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-2xl" />
                        ))
                    ) : (
                        <>
                            <KpiCard
                                label="Total Sales"
                                value={`Rs ${formatCurrency(kpi.data?.todaySales ?? 0)}`}
                                icon={DollarSign}
                                iconBg="bg-emerald-50"
                                iconColor="text-emerald-500"
                            />
                            <KpiCard
                                label="Total Transactions"
                                value={String(kpi.data?.totalTransactions ?? 0)}
                                icon={ShoppingCart}
                                iconBg="bg-blue-50"
                                iconColor="text-blue-500"
                            />
                            <KpiCard
                                label="Inventory Value"
                                value={`Rs ${formatCurrency(kpi.data?.inventoryValue ?? 0)}`}
                                icon={Package}
                                iconBg="bg-violet-50"
                                iconColor="text-violet-500"
                            />
                            <KpiCard
                                label="Low Stock Count"
                                value={String(kpi.data?.lowStockCount ?? 0)}
                                icon={TriangleAlert}
                                iconBg="bg-red-50"
                                iconColor="text-red-500"
                            />
                        </>
                    )}
                </div>

                {/* Sales Target Bar */}
                {!target.isLoading && (
                    <SalesTargetBar
                        currentRevenue={target.data?.current ?? 0}
                        target={target.data?.targetAmount ?? 0}
                    />
                )}

                {/* Live Counter + Trend Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <LiveSalesCounter
                        totalSalesThisMonth={liveSales.data?.totalSalesThisMonth ?? 0}
                        isLoading={liveSales.isLoading}
                        isRefreshing={liveSales.isRefreshing}
                    />
                    {trend.isLoading ? (
                        <Skeleton className="h-64 rounded-2xl" />
                    ) : (
                        <SalesTrendChart data={trend.data?.data ?? []} />
                    )}
                </div>

                {/* Low Stock Alerts */}
                <LowStockAlerts
                    items={lowStock.data?.data ?? []}
                    isLoading={lowStock.isLoading}
                />
            </div>
        </div>
    );
}