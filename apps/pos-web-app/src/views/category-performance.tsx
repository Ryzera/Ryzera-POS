'use client';
// ============================================================
// Category Performance Report View
// File: pos-web-app/src/views/category-performance.tsx
//
// Role behaviour:
// SUPER_ADMIN  — branch dropdown visible, All Branches + Per Branch tabs
// BRANCH_MANAGER — branch dropdown hidden, only own branch data, no tabs
//
// Fixes in this version (v5):
// 1. Top Categories (Per Branch tab) — compact numbered list style matching design spec
// 2. Branch switching — NO setGenerated(false). Mirrors Sales Report exactly:
//    selectedBranchId state updates → queryParams useMemo recalculates →
//    React Query sees a new cache key → refetches immediately while showing
//    the current data (no empty state flash).
// 3. selectedBranchId stored as string ('' = All Branches, '2' = Branch 2)
//    matching Sales Report. String values survive JSON.stringify in query keys.
// 4. Per-branch section heading uses same blue uppercase style as grid headers.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import {
    CalendarIcon,
    RefreshCw,
    ChevronDown,
    Bell,
    FileText,
    FileSpreadsheet,
    Tag,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
    useCategoryKpi,
    useCategoryBarChart,
    useCategoryPieChart,
    useCategoryTable,
    useCategoryByBranch,
    useCategoryBranches,
} from '@/hooks/useCategoryPerformance';
import {
    exportCategoryCSV,
    exportCategoryPDF,
    downloadBlob,
} from '@/api/category-performance.api';
import {
    CAT_DEFAULT_DATE_FROM,
    CAT_DEFAULT_DATE_TO,
    CATEGORY_BAR_COLOR,
    CATEGORY_PIE_COLORS,
} from '@/constants/category-performance.constants';
import type {
    CategoryPerformanceQueryParams,
    CategoryBranchEntry,
    RevenueBarResponse,
    ProfitPieResponse,
    CategoryTableRow,
} from '@/types/category-performance.types';

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
    `Rs ${new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n ?? 0)}`;

const formatNumber = (n: number) =>
    new Intl.NumberFormat('en-LK').format(n ?? 0);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl ${className}`}
        />
    );
}

// ─── Top Category KPI Card (All Branches tab only) ────────────────────────────
function CategoryKpiCard({
                             rank,
                             category,
                             revenue,
                         }: {
    rank: number;
    category: string;
    revenue: number;
}) {
    const RANK_COLORS: Record<number, string> = {
        1: 'bg-amber-50 text-amber-600 border-amber-100',
        2: 'bg-slate-50 text-slate-600 border-slate-200',
        3: 'bg-orange-50 text-orange-600 border-orange-100',
    };
    const color = RANK_COLORS[rank] ?? 'bg-blue-50 text-blue-600 border-blue-100';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    #{rank} Top Category
                </p>
                <div className={`p-2 rounded-xl border flex-shrink-0 ${color}`}>
                    <Tag className="h-3.5 w-3.5" />
                </div>
            </div>
            <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{category}</p>
                <p className="text-[18px] font-bold text-gray-900 tracking-tight leading-tight mt-0.5">
                    {formatCurrency(revenue)}
                </p>
            </div>
        </div>
    );
}

// ─── Per-Branch Top Categories — compact list style (matches Image 2) ─────────
// Shows inside the shared "Top Categories" card on the Per Branch tab.
// Layout: numbered rows  |  category name  |  revenue  |  percentage pill
function BranchTopCategoryList({
                                   rows,
                                   totalRevenue,
                               }: {
    rows: CategoryTableRow[];
    totalRevenue: number;
}) {
    const RANK_ICON_COLORS = [
        'bg-amber-50 text-amber-600',   // #1
        'bg-slate-100 text-slate-500',  // #2
        'bg-orange-50 text-orange-500', // #3
    ];

    if (!rows.length) {
        return (
            <p className="text-[12px] text-gray-400 py-6 text-center">No data</p>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-gray-50">
            {rows.map((row, idx) => {
                const pct =
                    totalRevenue > 0
                        ? ((row.revenue / totalRevenue) * 100).toFixed(1)
                        : '0.0';
                const iconColor = RANK_ICON_COLORS[idx] ?? 'bg-gray-100 text-gray-500';

                return (
                    <div
                        key={row.category}
                        className="flex items-center gap-3 py-2.5 px-1 group"
                    >
                        {/* Rank badge */}
                        <span
                            className={`flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold
                                flex items-center justify-center ${iconColor}`}
                        >
                            {idx + 1}
                        </span>

                        {/* Category name */}
                        <span className="flex-1 min-w-0 text-[12px] font-semibold text-gray-800 truncate">
                            {row.category}
                        </span>

                        {/* Revenue */}
                        <span className="text-[12px] font-bold text-gray-900 tabular-nums whitespace-nowrap">
                            {formatCurrency(row.revenue)}
                        </span>

                        {/* Percentage pill */}
                        <span className="flex-shrink-0 text-[10px] font-semibold text-blue-600
                            bg-blue-50 rounded-full px-2 py-0.5 tabular-nums whitespace-nowrap">
                            {pct}%
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────
function CategoryBarChart({ resp }: { resp?: RevenueBarResponse }) {
    const data = resp?.data ?? [];
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-300 h-64">
                <Tag className="h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">No data for this period</p>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto">
            <div style={{ minWidth: Math.max(data.length * 60, 320) }}>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                        data={data}
                        margin={{ top: 8, right: 8, left: 0, bottom: 60 }}
                        barCategoryGap="35%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="category"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            dy={6}
                            angle={-30}
                            textAnchor="end"
                        />
                        <YAxis
                            tickFormatter={v =>
                                v >= 1_000_000
                                    ? `${(v / 1_000_000).toFixed(1)}M`
                                    : v >= 1_000
                                        ? `${(v / 1_000).toFixed(0)}k`
                                        : String(v)
                            }
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            width={46}
                        />
                        <Tooltip
                            formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                            contentStyle={{
                                fontSize: 12,
                                borderRadius: 10,
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                padding: '8px 14px',
                                backgroundColor: '#ffffff',
                            }}
                            cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                        />
                        <Bar
                            dataKey="revenue"
                            fill={CATEGORY_BAR_COLOR}
                            radius={[5, 5, 0, 0]}
                            maxBarSize={48}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Profit Pie Chart ─────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, midAngle, outerRadius, name, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 32;
    const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
    const y2 = (outerRadius + 32) * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x2}
            y={y2}
            textAnchor={x2 > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
        >
            {`${name} ${Math.round(percentage)}%`}
        </text>
    );
};

function ProfitPieChart({ resp }: { resp?: ProfitPieResponse }) {
    const data = resp?.data ?? [];
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 h-72">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-2xl">%</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">No profit data</p>
            </div>
        );
    }
    const pieData = data.map((d, i) => ({
        name: d.category,
        value: d.profit,
        percentage: d.percentage,
        color: CATEGORY_PIE_COLORS[i % CATEGORY_PIE_COLORS.length],
    }));
    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={88}
                    dataKey="value"
                    labelLine={false}
                    label={renderPieLabel}
                    paddingAngle={2}
                >
                    {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(val: number, name: string) => [formatCurrency(val), name]}
                    contentStyle={{
                        fontSize: 12,
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

// ─── Category Detail Table ────────────────────────────────────────────────────
function CategoryDetailTable({
                                 rows,
                                 isLoading,
                                 onExportCsv,
                                 onExportPdf,
                                 exporting,
                                 hideExport = false,
                                 branchName,
                             }: {
    rows: CategoryTableRow[];
    isLoading: boolean;
    onExportCsv: () => void;
    onExportPdf: () => void;
    exporting: 'csv' | 'pdf' | null;
    hideExport?: boolean;
    branchName?: string;
}) {
    const TABLE_HEADERS = [
        'Category', 'Product Types', 'Total Sold',
        'Revenue', 'Cost', 'Profit', 'Transactions', 'Margin',
    ];

    const title = branchName
        ? `Category Performance Details (${branchName})`
        : 'Category Performance Details';
    const subtitle = branchName
        ? `Complete metrics for each category — ${branchName}`
        : 'Complete metrics for each category';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-[14px] font-bold text-gray-800">{title}</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
                </div>
                {!hideExport && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExportCsv}
                            disabled={!!exporting}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px]
                                font-semibold border border-gray-200 bg-white text-gray-600
                                hover:bg-gray-50 hover:border-gray-300 transition-all
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            {exporting === 'csv' ? 'Exporting…' : 'CSV'}
                        </button>
                        <button
                            onClick={onExportPdf}
                            disabled={!!exporting}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px]
                                font-semibold border border-gray-200 bg-white text-gray-600
                                hover:bg-gray-50 hover:border-gray-300 transition-all
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-200" />
                    </div>
                    <p className="text-[13px] text-gray-400 font-medium">No category data found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            {TABLE_HEADERS.map(h => (
                                <th
                                    key={h}
                                    className={`px-5 py-3 text-[11px] font-semibold text-gray-400
                                            uppercase tracking-wider whitespace-nowrap
                                            ${['Revenue', 'Cost', 'Profit', 'Margin',
                                        'Product Types', 'Total Sold', 'Transactions']
                                        .includes(h) ? 'text-right' : 'text-left'}`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => (
                            <tr
                                key={row.category}
                                className={`transition-colors hover:bg-blue-50/30
                                        ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                            >
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="text-[13px] font-semibold text-gray-800">
                                            {row.category}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-600 tabular-nums">
                                            {formatNumber(row.totalProducts)}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-600 tabular-nums">
                                            {formatNumber(row.totalSold)}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                                            {formatCurrency(row.revenue)}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-500 tabular-nums">
                                            {formatCurrency(row.cost)}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className={`text-[12px] font-semibold tabular-nums
                                            ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {formatCurrency(row.profit)}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-600 tabular-nums">
                                            {formatNumber(row.transactions)}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1
                                            rounded-lg text-[11px] font-semibold
                                            ${row.margin >= 40
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : row.margin >= 20
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-red-50 text-red-600'}`}>
                                            {row.margin}%
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Per Branch Section — Charts + Table ──────────────────────────────────────
// Renders bar chart + pie chart + table for a single branch.
// The top-3 compact list for ALL branches is rendered in the shared grid above.
function BranchChartsAndTable({
                                  entry,
                                  index,
                              }: {
    entry: CategoryBranchEntry;
    index: number;
}) {
    const rows = entry.data;

    const barResp: RevenueBarResponse = {
        data: rows.map(r => ({ category: r.category, revenue: r.revenue })),
    };

    const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
    const pieResp: ProfitPieResponse = {
        data: rows.map(r => ({
            category: r.category,
            profit: r.profit,
            percentage: totalProfit !== 0 ? Math.abs((r.profit / totalProfit) * 100) : 0,
        })),
    };

    return (
        <>
            {index > 0 && <div className="border-t border-gray-200" />}
            <div className="space-y-4">
                {/* Branch label — same blue uppercase style as Top Categories grid */}
                <h3 className="text-[12px] font-bold text-blue-600 uppercase tracking-wide pt-2 border-b border-gray-100 pb-2">
                    {entry.branch.name}
                </h3>

                {/* Bar + Pie side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h4 className="text-[13px] font-bold text-gray-800 mb-0.5">
                            Revenue by Category
                        </h4>
                        <p className="text-[11px] text-gray-400 mb-4">
                            Sales amount by category — {entry.branch.name}
                        </p>
                        <CategoryBarChart resp={barResp} />
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h4 className="text-[13px] font-bold text-gray-800 mb-0.5">
                            Profit by Category
                        </h4>
                        <p className="text-[11px] text-gray-400 mb-4">
                            Profit distribution — {entry.branch.name}
                        </p>
                        <ProfitPieChart resp={pieResp} />
                    </div>
                </div>

                {/* Detail table — no export buttons per branch */}
                <CategoryDetailTable
                    rows={rows}
                    isLoading={false}
                    onExportCsv={() => {}}
                    onExportPdf={() => {}}
                    exporting={null}
                    hideExport={true}
                    branchName={entry.branch.name}
                />
            </div>
        </>
    );
}

// ─── Date Picker Class Names ──────────────────────────────────────────────────
const CALENDAR_CLASS_NAMES = {
    months: 'flex flex-col',
    month: 'space-y-3 p-3',
    caption: 'flex justify-center relative items-center h-8',
    caption_label: 'text-sm font-semibold text-gray-800',
    nav: 'flex items-center gap-1',
    nav_button: 'h-7 w-7 bg-transparent hover:bg-gray-100 rounded-lg flex items-center justify-center',
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse',
    head_row: 'flex',
    head_cell: 'text-gray-400 rounded-md w-9 font-medium text-[11px] text-center',
    row: 'flex w-full mt-1',
    cell: 'h-9 w-9 text-center text-sm relative',
    day: 'h-9 w-9 p-0 font-normal rounded-lg hover:bg-blue-50 hover:text-blue-600',
    day_selected: 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-semibold',
    day_today: 'bg-gray-100 text-gray-900 font-semibold',
    day_disabled: 'text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
    day_outside: 'text-gray-300',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoryPerformancePage() {
    const { user, isSuperAdmin } = useAuth();

    // ── Local State ──────────────────────────────────────────────────────────
    const [dateFrom, setDateFrom] = useState<Date>(new Date(CAT_DEFAULT_DATE_FROM));
    const [dateTo, setDateTo] = useState<Date>(new Date(CAT_DEFAULT_DATE_TO));
    const [generated, setGenerated] = useState(false);
    // String type mirrors Sales Report: '' = All Branches, '2' = Branch 2.
    // String values survive JSON.stringify in React Query cache keys (unlike number | undefined).
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'all' | 'per-branch'>('all');
    const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const { data: branches = [] } = useCategoryBranches();

    // ── Query Params ─────────────────────────────────────────────────────────
    // selectedBranchId (string) is included so React Query generates a new cache
    // key on every branch change. '' stays '' in JSON.stringify — never collapses.
    const queryParams: CategoryPerformanceQueryParams = useMemo(() => {
        const dateFromStr = format(dateFrom, 'yyyy-MM-dd');
        const dateToStr   = format(dateTo,   'yyyy-MM-dd');

        if (isSuperAdmin) {
            return {
                dateFrom: dateFromStr,
                dateTo:   dateToStr,
                // Convert string → number for backend; undefined when 'All Branches'
                branchId: selectedBranchId !== '' ? Number(selectedBranchId) : undefined,
            };
        }

        // BRANCH_MANAGER — always locked to their own branchId from JWT
        return {
            dateFrom: dateFromStr,
            dateTo:   dateToStr,
            branchId: user?.branchId != null ? user.branchId : undefined,
        };
    }, [dateFrom, dateTo, selectedBranchId, isSuperAdmin, user?.branchId]);

    // ── Query Enable Flags ───────────────────────────────────────────────────
    const isAllEnabled = generated && (activeTab === 'all' || !isSuperAdmin);

    const isPerBranchEnabled =
        generated &&
        activeTab === 'per-branch' &&
        isSuperAdmin &&
        selectedBranchId === '';   // Per Branch tab only when viewing ALL branches

    // ── Data Queries ─────────────────────────────────────────────────────────
    const { data: kpiResp,   isLoading: kpiLoading   } = useCategoryKpi(queryParams, isAllEnabled);
    const { data: barResp,   isLoading: barLoading   } = useCategoryBarChart(queryParams, isAllEnabled);
    const { data: pieResp,   isLoading: pieLoading   } = useCategoryPieChart(queryParams, isAllEnabled);
    const { data: tableResp, isLoading: tableLoading } = useCategoryTable(queryParams, isAllEnabled);
    const { data: bbResp,    isLoading: bbLoading    } = useCategoryByBranch(queryParams, isPerBranchEnabled);

    console.log('🔍 DEBUG', {
        selectedBranchId,
        queryParamsBranchId: queryParams.branchId,
        kpiData: kpiResp?.topCategories?.[0]?.category,
        isAllEnabled,
        kpiLoading,
    });

    const isLoading = kpiLoading || barLoading || pieLoading || tableLoading;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleGenerate = useCallback(() => {
        setGenerated(true);
    }, []);

    const handleReset = useCallback(() => {
        setDateFrom(new Date(CAT_DEFAULT_DATE_FROM));
        setDateTo(new Date(CAT_DEFAULT_DATE_TO));
        setGenerated(false);
        setSelectedBranchId('');
        setActiveTab('all');
    }, []);

    const handleBranchChange = useCallback((value: string) => {
        setSelectedBranchId(value);
        // Per Branch tab is incompatible with a single-branch filter — switch back to All
        if (value !== '') setActiveTab('all');
        // NOTE: do NOT call setGenerated(false) here.
        // Mirrors Sales Report: queryParams memo recalculates with new branchId,
        // React Query sees a new cache key and refetches immediately —
        // the report stays visible during the fetch (no empty state flash).
    }, []);

    const handleExport = useCallback(
        async (type: 'csv' | 'pdf') => {
            if (!generated) return;
            setExporting(type);
            try {
                const blob =
                    type === 'csv'
                        ? await exportCategoryCSV(queryParams)
                        : await exportCategoryPDF(queryParams);
                const suffix = queryParams.dateFrom ?? 'all';
                downloadBlob(blob, `category-performance-${suffix}.${type}`);
            } catch (err) {
                console.error('[CategoryPerformancePage] Export failed:', err);
            } finally {
                setExporting(null);
            }
        },
        [generated, queryParams],
    );

    // Branch label for BRANCH_MANAGER header pill
    const managerBranchLabel = useMemo(() => {
        if (isSuperAdmin || !user?.branchId) return null;
        const found = branches.find(b => String(b.branchId) === String(user.branchId));
        return found?.name ?? `Branch ${user.branchId}`;
    }, [isSuperAdmin, user?.branchId, branches]);

    const triggerClass = cn(
        'h-10 justify-start text-left font-normal text-[13px] rounded-xl',
        'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
        'shadow-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
                            Category Performance Report
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                            Compare performance across product categories
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* SUPER_ADMIN — branch selector */}
                        {isSuperAdmin && (
                            <div className="relative">
                                <select
                                    value={selectedBranchId !== undefined ? String(selectedBranchId) : ''}
                                    onChange={e => handleBranchChange(e.target.value)}
                                    className="appearance-none bg-blue-600 text-white text-[13px]
                                        font-semibold pl-4 pr-9 py-2.5 rounded-xl cursor-pointer
                                        border-0 focus:outline-none focus:ring-2 focus:ring-blue-400
                                        hover:bg-blue-700 transition-colors min-w-[160px]"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => (
                                        <option key={b.branchId} value={String(b.branchId)}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                            </div>
                        )}
                        {/* BRANCH_MANAGER — static pill */}
                        {!isSuperAdmin && managerBranchLabel && (
                            <div className="bg-blue-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap">
                                {managerBranchLabel}
                            </div>
                        )}
                        <button
                            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Page Body ───────────────────────────────────────────────── */}
            <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">

                {/* ── Filter Bar ──────────────────────────────────────────── */}
                <div className="flex flex-wrap items-end gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {/* Date From */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Date From
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn(triggerClass, 'w-44')}>
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{format(dateFrom, 'MMM d, yyyy')}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 rounded-xl border border-gray-200 bg-white shadow-xl z-[200]"
                                align="start"
                                sideOffset={6}
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateFrom}
                                    onSelect={d => {
                                        if (!d) return;
                                        setDateFrom(d);
                                        if (d > dateTo) setDateTo(d);
                                    }}
                                    disabled={date => date > today}
                                    defaultMonth={dateFrom}
                                    initialFocus
                                    classNames={CALENDAR_CLASS_NAMES}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Date To */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Date To
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn(triggerClass, 'w-44')}>
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{format(dateTo, 'MMM d, yyyy')}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 rounded-xl border border-gray-200 bg-white shadow-xl z-[200]"
                                align="start"
                                sideOffset={6}
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={d => d && setDateTo(d)}
                                    disabled={date => date < dateFrom || date > today}
                                    defaultMonth={dateTo}
                                    initialFocus
                                    classNames={CALENDAR_CLASS_NAMES}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Generate / Reset */}
                    <div className="flex items-end gap-2 ml-auto">
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="h-10 px-7 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                                text-white font-semibold rounded-xl text-[13px]
                                shadow-sm shadow-blue-200/60 transition-all duration-150
                                disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Loading…
                                </span>
                            ) : 'Generate'}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            title="Reset filters"
                            className="h-10 w-10 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* ── Tabs (SUPER_ADMIN only, no specific branch selected) ── */}
                {isSuperAdmin && generated && selectedBranchId === '' && (
                    <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 w-fit shadow-sm">
                        {(['all', 'per-branch'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold
                                    transition-all duration-150 ${
                                    activeTab === tab
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {tab === 'all' ? 'All Branches' : 'Per Branch'}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────────── */}
                {!generated && (
                    <div className="flex flex-col items-center justify-center py-36 gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            <Tag className="h-9 w-9 text-gray-200" />
                        </div>
                        <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                            Set your date range{isSuperAdmin ? ' and branch' : ''} above and click{' '}
                            <span className="text-blue-600 font-bold">Generate</span> to load the report
                        </p>                    </div>
                )}

                {/* ══ ALL BRANCHES TAB ════════════════════════════════════════ */}
                {generated && activeTab === 'all' && (
                    <div className="space-y-5">
                        {/* Top-3 KPI rank cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {kpiLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32" />
                                ))
                            ) : (
                                (kpiResp?.topCategories ?? []).map(item => (
                                    <CategoryKpiCard
                                        key={item.rank}
                                        rank={item.rank}
                                        category={item.category}
                                        revenue={item.revenue}
                                    />
                                ))
                            )}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-[14px] font-bold text-gray-800 mb-0.5">
                                    Revenue by Category
                                </h2>
                                <p className="text-[11px] text-gray-400 mb-4">Sales amount by category</p>
                                {barLoading
                                    ? <Skeleton className="h-64" />
                                    : <CategoryBarChart resp={barResp} />
                                }
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-[14px] font-bold text-gray-800 mb-0.5">
                                    Profit by Category
                                </h2>
                                <p className="text-[11px] text-gray-400 mb-4">
                                    Profit distribution across categories
                                </p>
                                {pieLoading
                                    ? <Skeleton className="h-72" />
                                    : <ProfitPieChart resp={pieResp} />
                                }
                            </div>
                        </div>

                        {/* Detail table with export */}
                        <CategoryDetailTable
                            rows={tableResp?.data ?? []}
                            isLoading={tableLoading}
                            onExportCsv={() => handleExport('csv')}
                            onExportPdf={() => handleExport('pdf')}
                            exporting={exporting}
                            hideExport={false}
                        />
                    </div>
                )}

                {/* ══ PER BRANCH TAB ══════════════════════════════════════════ */}
                {generated && activeTab === 'per-branch' && isSuperAdmin && (
                    <div className="space-y-8">
                        {bbLoading ? (
                            <div className="space-y-8">
                                {/* Loading: top-list grid placeholder */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <Skeleton className="h-5 w-40 mb-4" />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Skeleton className="h-4 w-24 mb-3" />
                                                {Array.from({ length: 3 }).map((__, j) => (
                                                    <Skeleton key={j} className="h-10" />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Loading: charts + table placeholders */}
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-5 w-36" />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <Skeleton className="h-72" />
                                            <Skeleton className="h-72" />
                                        </div>
                                        <Skeleton className="h-56" />
                                    </div>
                                ))}
                            </div>
                        ) : (bbResp?.branches ?? []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                                    <Tag className="h-9 w-9 text-gray-200" />
                                </div>
                                <p className="text-[14px] text-gray-400 font-medium">
                                    No branch data found for this period
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* ── STEP A: Shared compact top-3 list for all branches ── */}
                                {/*
                                    Layout: one column per branch inside a single card.
                                    Each column: blue uppercase branch name + numbered compact rows.
                                    Matches Image 2 — Colombo / Kandy / Galle as equal columns.
                                */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h2 className="text-[14px] font-bold text-gray-800 mb-1">
                                        Top Categories
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mb-5">
                                        Top 3 performing categories per branch
                                    </p>
                                    <div
                                        className="grid gap-6"
                                        style={{
                                            gridTemplateColumns: `repeat(${Math.min(
                                                (bbResp?.branches ?? []).length, 4,
                                            )}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {(bbResp?.branches ?? []).map(entry => {
                                            // Sort rows by revenue desc, take top 3
                                            const top3 = [...entry.data]
                                                .sort((a, b) => b.revenue - a.revenue)
                                                .slice(0, 3);

                                            // Total revenue for this branch (for percentage)
                                            const branchTotal = entry.data.reduce(
                                                (s, r) => s + r.revenue, 0,
                                            );

                                            return (
                                                <div key={entry.branch.id} className="flex flex-col gap-0">
                                                    {/* Branch column header — blue uppercase, same as section headings */}
                                                    <p className="text-[11px] font-bold text-blue-600
                                                        uppercase tracking-widest border-b border-gray-100 pb-2 mb-1">
                                                        {entry.branch.name}
                                                    </p>

                                                    {/* Top Categories pill (matches Image 2 label) */}
                                                    <span className="inline-flex self-start items-center
                                                        gap-1 text-[9px] font-bold uppercase tracking-wider
                                                        bg-blue-50 text-blue-500 rounded-full px-2 py-0.5 mb-3">
                                                        <Tag className="h-2.5 w-2.5" />
                                                        Top Categories
                                                    </span>

                                                    {/* Compact numbered list */}
                                                    <BranchTopCategoryList
                                                        rows={top3}
                                                        totalRevenue={branchTotal}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ── STEP B: Bar + Pie + Table per branch ─────────────── */}
                                <div className="space-y-10">
                                    {(bbResp?.branches ?? []).map((entry, idx) => (
                                        <BranchChartsAndTable
                                            key={entry.branch.id}
                                            entry={entry}
                                            index={idx}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}