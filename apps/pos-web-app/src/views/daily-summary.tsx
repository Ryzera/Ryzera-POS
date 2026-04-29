'use client';

// ============================================================
// Daily Summary View  —  FIXED
// File: pos-web-app/src/views/daily-summary.tsx
//
// ROOT-CAUSE FIX (Per-Branch tab shows only 1 branch):
//   The backend /all-branches endpoint previously returned only
//   branches that HAD a DailySummary record for the selected date.
//   After the backend fix (getAllBranchesSummary in service),
//   it now returns ALL active branches with hasData:boolean.
//
//   Frontend changes in this file:
//   1. PerBranchTab — uses `allBranches.branches` directly as the
//      merged list (backend now guarantees all branches appear).
//      Falls back to knownBranches only when allBranches is absent.
//   2. BranchSummaryCard — reads `branch.hasData` (from backend)
//      instead of re-computing it from the summary nullability.
//   3. PerBranchDetailSection — enabled flag uses `branch.hasData`
//      (same source of truth as the card).
//   4. Empty-state messages added to every chart / table / P&L
//      section so "no data" branches render cleanly.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    Percent,
    Bell,
    ChevronDown,
    FileText,
    FileSpreadsheet,
    CalendarDays,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import { useAuth }       from '@/context/AuthContext';
import { useBranches }   from '@/hooks/useSalesReport';
import {
    useDailySummaryCards,
    useHourlySales,
    useDailyPaymentMethods,
    useDailySummaryDetails,
    useAllBranchesSummary,
} from '@/hooks/useDailySummary';
import { DailySummaryFilters as DailySummaryFilterBar } from '@/components/DailySummaryFilters';
import {
    exportDailySummaryCSV,
    exportDailySummaryPDF,
    downloadBlob,
} from '@/api/daily-summary.api';
import {
    PAYMENT_METHOD_COLORS,
    PIE_FALLBACK_COLORS,
    PL_ROWS,
    ALL_BRANCHES_VALUE,
} from '@/constants/daily-summary.constants';
import type {
    DailySummaryFilters as FiltersType,
    DailySummaryQueryParams,
    HourlySalesResponse,
    PaymentMethodResponse,
    DailySummaryDetailsResponse,
    AllBranchesSummaryResponse,
    BranchDailySummary,
} from '@/types/daily-summary.types';
import type { Branch } from '@/types/sales-report.types';

// ─── Formatters ───────────────────────────────────────────────
const formatCurrency = (n: number) =>
    `Rs ${new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n ?? 0)}`;

const formatNumber = (n: number) =>
    new Intl.NumberFormat('en-LK').format(n ?? 0);

// ─── Badge colours ────────────────────────────────────────────
const BADGE_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
];

// ─── Skeleton ─────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl ${className}`}
        />
    );
}

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({
                     label, value, icon: Icon, iconBg, iconColor,
                 }: {
    label:     string;
    value:     string;
    icon:      React.ElementType;
    iconBg:    string;
    iconColor: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5
                        shadow-sm hover:shadow-md transition-shadow duration-200
                        min-w-0 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase
                              tracking-widest leading-tight">
                    {label}
                </p>
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
            <p className="text-[26px] font-bold text-gray-900 tracking-tight leading-none truncate">
                {value}
            </p>
        </div>
    );
}

// ─── Hourly Sales Line Chart ───────────────────────────────────
function HourlySalesChart({ chartResp }: { chartResp?: HourlySalesResponse }) {
    const data = chartResp?.data ?? [];

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 h-64">
                <CalendarDays className="h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">No hourly sales data for this date</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(h: string, i: number) => (i % 2 === 0 ? h : '')}
                    dy={6}
                />
                <YAxis
                    tickFormatter={v =>
                        v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : String(v)
                    }
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={46}
                />
                <Tooltip
                    formatter={(val: number) => [formatCurrency(val), 'Sales']}
                    labelFormatter={label => `Hour: ${label}`}
                    contentStyle={{
                        fontSize:        12,
                        borderRadius:    10,
                        border:          '1px solid #e2e8f0',
                        boxShadow:       '0 8px 24px rgba(0,0,0,0.08)',
                        padding:         '8px 14px',
                        color:           '#1e293b',
                        backgroundColor: '#ffffff',
                    }}
                    cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 1 }}
                />
                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#3b82f6' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// ─── Payment Pie Chart ─────────────────────────────────────────
const renderOutsideLabel = ({
                                cx, cy, midAngle, outerRadius, name, percentage,
                            }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x      = cx + radius * Math.cos(-midAngle * RADIAN);
    const y      = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
        >
            {`${name} ${Math.round(percentage)}%`}
        </text>
    );
};

function PaymentPieChart({ pmResp }: { pmResp?: PaymentMethodResponse }) {
    const data = pmResp?.data ?? [];

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 h-64">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-2xl">%</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">No payment data for this date</p>
            </div>
        );
    }

    const pieData = data.map((d, i) => ({
        name:       d.paymentMethod,
        value:      d.percentage,
        percentage: d.percentage,
        color:
            PAYMENT_METHOD_COLORS[d.paymentMethod] ??
            PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length],
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
                    label={renderOutsideLabel}
                    paddingAngle={2}
                >
                    {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(val: number, name: string) => [`${val.toFixed(1)}%`, name]}
                    contentStyle={{
                        fontSize:        12,
                        borderRadius:    10,
                        border:          '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

// ─── Daily Summary Details Table ───────────────────────────────
function DailySummaryTable({
                               detailsResp, isLoading, onExportCsv, onExportPdf, exporting,
                           }: {
    detailsResp?: DailySummaryDetailsResponse;
    isLoading:    boolean;
    onExportCsv:  () => void;
    onExportPdf:  () => void;
    exporting:    'csv' | 'pdf' | null;
}) {
    const table = detailsResp?.table;
    const TABLE_COLS = [
        'Date', 'Total Sales', 'Transactions', 'Items Sold',
        'Discounts', 'Tax', 'Returns', 'Net Profit',
    ] as const;
    const RIGHT_ALIGN = new Set(['Total Sales', 'Discounts', 'Tax', 'Returns', 'Net Profit']);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-[14px] font-bold text-gray-800">Daily Summary Details</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Complete breakdown for the day</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onExportCsv}
                        disabled={!!exporting || !table}
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
                        disabled={!!exporting || !table}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px]
                                   font-semibold border border-gray-200 bg-white text-gray-600
                                   hover:bg-gray-50 hover:border-gray-300 transition-all
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6"><Skeleton className="h-16" /></div>
            ) : !table ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <CalendarDays className="h-8 w-8 text-gray-200" />
                    <p className="text-[13px] text-gray-400 font-medium">No summary data recorded for this date</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            {TABLE_COLS.map(h => (
                                <th
                                    key={h}
                                    className={`px-5 py-3 text-[11px] font-semibold text-gray-400
                                                    uppercase tracking-wider
                                                    ${RIGHT_ALIGN.has(h) ? 'text-right' : 'text-left'}`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-5 py-3.5 text-[12px] font-medium text-gray-700 whitespace-nowrap">
                                {table.date}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                                    <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                                        {formatCurrency(table.totalSales)}
                                    </span>
                            </td>
                            <td className="px-5 py-3.5 text-[12px] text-gray-600 tabular-nums">
                                {formatNumber(table.transactions)}
                            </td>
                            <td className="px-5 py-3.5 text-[12px] text-gray-600 tabular-nums">
                                {formatNumber(table.itemsSold)}
                            </td>
                            <td className="px-5 py-3.5 text-right text-[12px] text-gray-500 tabular-nums">
                                {formatCurrency(table.discounts)}
                            </td>
                            <td className="px-5 py-3.5 text-right text-[12px] text-gray-500 tabular-nums">
                                {formatCurrency(table.tax)}
                            </td>
                            <td className="px-5 py-3.5 text-right text-[12px] text-gray-500 tabular-nums">
                                {formatCurrency(table.returns)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                                    <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                                        {formatCurrency(table.netProfit)}
                                    </span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── P&L Breakdown ────────────────────────────────────────────
function PlBreakdownSection({
                                detailsResp, isLoading,
                            }: {
    detailsResp?: DailySummaryDetailsResponse;
    isLoading:    boolean;
}) {
    const pl = detailsResp?.plBreakdown;
    if (isLoading) return <Skeleton className="h-56" />;
    if (!pl) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-[14px] font-bold text-gray-800 mb-4">P&amp;L Breakdown</h2>
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <CalendarDays className="h-7 w-7 text-gray-200" />
                    <p className="text-[12px] text-gray-400 font-medium">No P&amp;L data available for this date</p>
                </div>
            </div>
        );
    }

    const displayValue = (key: string, value: number): string => {
        if (['costOfGoodsSold', 'discounts', 'returns'].includes(key))
            return `-${formatCurrency(value)}`;
        if (key === 'taxCollected')
            return `+${formatCurrency(value)}`;
        return formatCurrency(value);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-[14px] font-bold text-gray-800 mb-4">P&amp;L Breakdown</h2>
            <div className="space-y-0">
                {PL_ROWS.map((row, i) => {
                    const value  = pl[row.key as keyof typeof pl] as number;
                    const isLast = i === PL_ROWS.length - 1;
                    return (
                        <div
                            key={row.key}
                            className={`flex items-center justify-between py-3
                                        ${isLast
                                ? 'border-t-2 border-gray-200 mt-1'
                                : 'border-b border-gray-50'}`}
                        >
                            <span className={`text-[13px] ${isLast ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                {row.label}
                            </span>
                            <span className={`text-[13px] tabular-nums
                                             ${isLast
                                ? 'font-bold text-gray-900'
                                : `font-medium ${row.color}`}`}>
                                {row.key === 'profitMargin'
                                    ? `${value.toFixed(1)}%`
                                    : displayValue(row.key, value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Branch KPI Summary Card ───────────────────────────────────
// Shows KPI numbers when hasData=true, otherwise a clear no-data state.
function BranchSummaryCard({
                               branch, index,
                           }: {
    branch: BranchDailySummary;
    index:  number;
}) {
    const badge = BADGE_COLORS[index % BADGE_COLORS.length];
    const kpi   = branch.hasData ? branch.kpi : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                        flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="px-5 pt-5 pb-4 flex-1">
                <div className="flex items-start justify-between gap-2 mb-5">
                    <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-gray-900 leading-tight truncate">
                            {branch.branchName}
                        </h3>
                        {branch.branchCity && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{branch.branchCity}</p>
                        )}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                                      whitespace-nowrap flex-shrink-0 ${badge}`}>
                        Branch {index + 1}
                    </span>
                </div>

                {!kpi ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <CalendarDays className="h-7 w-7 text-gray-200" />
                        <p className="text-[12px] text-gray-400 text-center">
                            No sales recorded for this date
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {([
                            { label: 'Total Sales',  value: formatCurrency(kpi.totalSales)   },
                            { label: 'Transactions', value: formatNumber(kpi.transactions)   },
                            { label: 'Items Sold',   value: formatNumber(kpi.itemsSold)      },
                            { label: 'Customers',    value: formatNumber(kpi.totalCustomers) },
                            { label: 'Gross Profit', value: formatCurrency(kpi.grossProfit)  },
                            { label: 'Net Profit',   value: formatCurrency(kpi.netProfit)    },
                        ] as const).map(row => (
                            <div key={row.label} className="flex justify-between items-center">
                                <span className="text-[12px] text-gray-500">{row.label}</span>
                                <span className="text-[12px] font-semibold text-gray-900">{row.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={`px-5 py-3 border-t
                            ${kpi
                ? 'bg-blue-50 border-blue-100'
                : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5
                               ${kpi ? 'text-blue-400' : 'text-gray-400'}`}>
                    Net Profit
                </p>
                <p className={`text-[13px] font-bold
                               ${kpi ? 'text-blue-700' : 'text-gray-400'}`}>
                    {kpi ? formatCurrency(kpi.netProfit) : '—'}
                </p>
            </div>
        </div>
    );
}

// ─── Per-Branch Detail Section ─────────────────────────────────
// Renders hourly chart + payment pie + table + P&L for ONE branch.
// When hasData=false, skips API calls and shows empty states per feature.
function PerBranchDetailSection({
                                    branch, baseDate, index,
                                }: {
    branch:   BranchDailySummary;
    baseDate: string;
    index:    number;
}) {
    const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

    const branchParams: DailySummaryQueryParams = useMemo(() => ({
        date:     baseDate,
        branchId: branch.branchId != null ? String(branch.branchId) : undefined,
    }), [baseDate, branch.branchId]);

    // Only fire API calls when this branch actually has data for the date
    const enabled = branch.hasData;

    const { data: hourlyResp,  isLoading: hourlyLoading  } = useHourlySales(branchParams, enabled);
    const { data: pmResp,      isLoading: pmLoading      } = useDailyPaymentMethods(branchParams, enabled);
    const { data: detailsResp, isLoading: detailsLoading } = useDailySummaryDetails(branchParams, enabled);

    const handleExport = useCallback(async (type: 'csv' | 'pdf') => {
        setExporting(type);
        try {
            const blob = type === 'csv'
                ? await exportDailySummaryCSV(branchParams)
                : await exportDailySummaryPDF(branchParams);
            downloadBlob(
                blob,
                `daily-summary-${branch.branchName.replace(/\s+/g, '-')}-${baseDate}.${type}`,
            );
        } catch (err) {
            console.error(`[PerBranchDetailSection] Export ${type} failed:`, err);
        } finally {
            setExporting(null);
        }
    }, [branchParams, branch.branchName, baseDate]);

    const badge = BADGE_COLORS[index % BADGE_COLORS.length];

    return (
        <div className="space-y-4">
            {/* Branch heading row */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0" />
                <h3 className="text-[15px] font-bold text-gray-900">{branch.branchName}</h3>
                {branch.branchCity && (
                    <span className="text-[12px] text-gray-400">— {branch.branchCity}</span>
                )}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badge}`}>
                    Branch {index + 1}
                </span>
            </div>

            {/* No-data state for the whole branch section */}
            {!branch.hasData ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                                flex flex-col items-center justify-center py-14 gap-3">
                    <CalendarDays className="h-9 w-9 text-gray-200" />
                    <div className="text-center">
                        <p className="text-[14px] font-semibold text-gray-500">
                            No data for {branch.branchName}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-1">
                            No daily summary was recorded for this branch on {baseDate}.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Charts row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-[13px] font-bold text-gray-800 mb-0.5">Hourly Sales</p>
                            <p className="text-[11px] text-gray-400 mb-4">
                                Sales performance throughout the day
                            </p>
                            {hourlyLoading
                                ? <Skeleton className="h-52" />
                                : <HourlySalesChart
                                    chartResp={hourlyResp as HourlySalesResponse | undefined}
                                />}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-[13px] font-bold text-gray-800 mb-0.5">Payment Methods</p>
                            <p className="text-[11px] text-gray-400 mb-4">
                                Transactions by payment type
                            </p>
                            {pmLoading
                                ? <Skeleton className="h-52" />
                                : <PaymentPieChart
                                    pmResp={pmResp as PaymentMethodResponse | undefined}
                                />}
                        </div>
                    </div>

                    {/* Details table */}
                    <DailySummaryTable
                        detailsResp={detailsResp as DailySummaryDetailsResponse | undefined}
                        isLoading={detailsLoading}
                        onExportCsv={() => handleExport('csv')}
                        onExportPdf={() => handleExport('pdf')}
                        exporting={exporting}
                    />

                    {/* P&L */}
                    <PlBreakdownSection
                        detailsResp={detailsResp as DailySummaryDetailsResponse | undefined}
                        isLoading={detailsLoading}
                    />
                </>
            )}
        </div>
    );
}

// ─── Per Branch Tab ────────────────────────────────────────────
//
// FIX: We now use allBranches?.branches directly as the list of branches
//      to render. The backend (after fix) returns ALL active branches,
//      not just those with data. `hasData` on each branch tells us
//      whether to show real KPIs or a no-data empty state.
//
//      Fallback to knownBranches (from useBranches) only if the backend
//      response is absent — this maintains backward-compatibility.
//
function PerBranchTab({
                          allBranches,
                          allBranchLoading,
                          knownBranches,
                          baseDate,
                      }: {
    allBranches:      AllBranchesSummaryResponse | undefined;
    allBranchLoading: boolean;
    knownBranches:    Branch[];
    baseDate:         string;
}) {
    // ── Build the definitive branch list ──────────────────────────────────────
    //
    // Priority 1: allBranches.branches from the backend  — ALWAYS preferred.
    //             The backend now includes ALL active branches with hasData flag.
    //
    // Priority 2: knownBranches from useBranches()       — fallback only.
    //             Use when allBranches hasn't arrived yet or is empty.
    //             We can't know hasData here so we treat them all as no-data.
    //
    const merged = useMemo<BranchDailySummary[]>(() => {
        // Backend returned branches — use directly (preferred path after fix)
        if (allBranches?.branches && allBranches.branches.length > 0) {
            return allBranches.branches;
        }

        // Fallback: build from knownBranches with hasData=false
        // (will show no-data cards for all branches)
        return knownBranches.map(b => ({
            branchId:   b.branchId,
            branchName: b.name,
            branchCity: b.city ?? null,
            hasData:    false,
            kpi: {
                totalSales:     0,
                transactions:   0,
                itemsSold:      0,
                totalCustomers: 0,
                grossProfit:    0,
                netProfit:      0,
            },
        }));
    }, [allBranches, knownBranches]);

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (allBranchLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid gap-4"
                         style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-64" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Empty state — no branches at all ──────────────────────────────────────
    if (merged.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                                shadow-sm flex items-center justify-center">
                    <CalendarDays className="h-9 w-9 text-gray-200" />
                </div>
                <div className="text-center">
                    <p className="text-[15px] font-semibold text-gray-500">No branches found</p>
                    <p className="text-[13px] text-gray-400 mt-1">
                        No active branches are registered in the system.
                    </p>
                </div>
            </div>
        );
    }

    const withData    = merged.filter(b => b.hasData).length;
    const withoutData = merged.length - withData;

    return (
        <div className="space-y-10">

            {/* ── Section 1: Branch overview cards ─────────── */}
            <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <h2 className="text-[15px] font-bold text-gray-800">Branch Overview</h2>
                    <span className="text-[11px] bg-gray-100 text-gray-500 font-semibold
                                     px-2.5 py-1 rounded-full">
                        {merged.length} {merged.length === 1 ? 'branch' : 'branches'}
                    </span>
                    {withData > 0 && (
                        <span className="text-[11px] bg-emerald-100 text-emerald-700 font-semibold
                                         px-2.5 py-1 rounded-full">
                            {withData} with data
                        </span>
                    )}
                    {withoutData > 0 && (
                        <span className="text-[11px] bg-orange-100 text-orange-700 font-semibold
                                         px-2.5 py-1 rounded-full">
                            {withoutData} no data
                        </span>
                    )}
                </div>

                <div className="grid gap-4"
                     style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
                    {merged.map((b, idx) => (
                        <BranchSummaryCard key={b.branchId ?? idx} branch={b} index={idx} />
                    ))}
                </div>
            </div>

            {/* ── Divider ───────────────────────────────────── */}
            <div className="border-t border-gray-200" />

            {/* ── Section 2: Per-branch detailed breakdown ─── */}
            <div>
                <h2 className="text-[15px] font-bold text-gray-800 mb-6">
                    Detailed Breakdown — Per Branch
                </h2>
                <div className="space-y-12">
                    {merged.map((b, idx) => (
                        <PerBranchDetailSection
                            key={b.branchId ?? idx}
                            branch={b}
                            baseDate={baseDate}
                            index={idx}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function DailySummaryPage() {
    const { user, isSuperAdmin } = useAuth();

    const [filters,          setFilters]          = useState<FiltersType | null>(null);
    const [generated,        setGenerated]        = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(ALL_BRANCHES_VALUE);
    const [activeTab,        setActiveTab]        = useState<'all' | 'per-branch'>('all');
    const [exporting,        setExporting]        = useState<'csv' | 'pdf' | null>(null);

    // Full branch list from POS branches endpoint (used as fallback in Per Branch tab)
    const { data: branchesRaw = [] } = useBranches();

    // ── Query params ──────────────────────────────────────────
    const queryParams: DailySummaryQueryParams | null = useMemo(() => {
        if (!filters) return null;
        return {
            date:     filters.date,
            branchId: isSuperAdmin
                ? (selectedBranchId || undefined)
                : (user?.branchId != null ? String(user.branchId) : undefined),
        };
    }, [filters, selectedBranchId, isSuperAdmin, user?.branchId]);

    // ── Enabled flags ─────────────────────────────────────────
    const isAllEnabled =
        generated && !!queryParams && activeTab === 'all';

    const isPerBranchEnabled =
        generated &&
        !!queryParams &&
        activeTab === 'per-branch' &&
        isSuperAdmin &&
        selectedBranchId === ALL_BRANCHES_VALUE;

    // ── Queries ───────────────────────────────────────────────
    const { data: cardsResp,   isLoading: cardsLoading   } =
        useDailySummaryCards(queryParams ?? {}, isAllEnabled);
    const { data: hourlyResp,  isLoading: hourlyLoading  } =
        useHourlySales(queryParams ?? {}, isAllEnabled);
    const { data: pmResp,      isLoading: pmLoading      } =
        useDailyPaymentMethods(queryParams ?? {}, isAllEnabled);
    const { data: detailsResp, isLoading: detailsLoading } =
        useDailySummaryDetails(queryParams ?? {}, isAllEnabled);
    const { data: allBranches, isLoading: allBranchLoading } =
        useAllBranchesSummary(queryParams ?? {}, isPerBranchEnabled);

    const isLoading = cardsLoading || hourlyLoading || pmLoading || detailsLoading;

    // ── Handlers ──────────────────────────────────────────────
    const handleGenerate = useCallback((f: FiltersType) => {
        setFilters(f);
        setGenerated(true);
    }, []);

    const handleBranchChange = useCallback((newBranchId: string) => {
        setSelectedBranchId(newBranchId);
        if (newBranchId !== ALL_BRANCHES_VALUE) setActiveTab('all');
    }, []);

    const handleExport = useCallback(async (type: 'csv' | 'pdf') => {
        if (!queryParams) return;
        setExporting(type);
        try {
            const blob = type === 'csv'
                ? await exportDailySummaryCSV(queryParams)
                : await exportDailySummaryPDF(queryParams);
            downloadBlob(blob, `daily-summary-${queryParams.date ?? 'all'}.${type}`);
        } catch (err) {
            console.error('[DailySummaryPage] Export failed:', err);
        } finally {
            setExporting(null);
        }
    }, [queryParams]);

    // Branch pill for non-super-admin
    const headerBranchLabel = useMemo(() => {
        if (isSuperAdmin) return null;
        if (user?.branchId) {
            const b = branchesRaw.find(br => br.branchId === user.branchId);
            return b?.name ?? `Branch ${user.branchId}`;
        }
        return null;
    }, [isSuperAdmin, user?.branchId, branchesRaw]);

    const kpi = (cardsResp as any)?.kpi ?? null;

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

            {/* ── Page Header ───────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30
                            shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
                            Daily Summary Report
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                            Comprehensive daily business summary and breakdown
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">

                        {/* SUPER_ADMIN — branch selector */}
                        {isSuperAdmin && (
                            <div className="relative">
                                <select
                                    value={selectedBranchId}
                                    onChange={e => handleBranchChange(e.target.value)}
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

                        {/* Branch Manager — static pill */}
                        {!isSuperAdmin && headerBranchLabel && (
                            <div className="bg-blue-600 text-white text-[13px] font-semibold
                                            px-5 py-2.5 rounded-xl whitespace-nowrap">
                                {headerBranchLabel}
                            </div>
                        )}

                        <button
                            className="p-2.5 text-gray-400 hover:text-gray-600
                                       hover:bg-gray-100 rounded-xl transition-colors
                                       border border-gray-200"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Page Body ─────────────────────────────────── */}
            <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">

                {/* Filter bar */}
                <DailySummaryFilterBar onGenerate={handleGenerate} isLoading={isLoading} />

                {/* Tab switcher — SUPER_ADMIN + All Branches only */}
                {isSuperAdmin && generated && selectedBranchId === ALL_BRANCHES_VALUE && (
                    <div className="flex gap-1 bg-white border border-gray-100
                                    rounded-2xl p-1 w-fit shadow-sm">
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

                {/* Initial state */}
                {!generated && (
                    <div className="flex flex-col items-center justify-center py-36 gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                                        shadow-sm flex items-center justify-center">
                            <CalendarDays className="h-9 w-9 text-gray-200" />
                        </div>
                        <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                            Select a date and click{' '}
                            <span className="text-blue-600 font-bold">Generate</span>{' '}
                            to load the summary.
                        </p>
                    </div>
                )}

                {/* ══ ALL BRANCHES TAB ══════════════════════ */}
                {generated && activeTab === 'all' && (
                    <div className="space-y-5">

                        {/* 6 KPI cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {cardsLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-36" />
                                ))
                            ) : !kpi ? (
                                <div className="col-span-full flex flex-col items-center
                                                justify-center py-20 gap-4">
                                    <CalendarDays className="h-10 w-10 text-gray-200" />
                                    <div className="text-center">
                                        <p className="text-[15px] font-semibold text-gray-500">
                                            No data found for this date
                                        </p>
                                        <p className="text-[13px] text-gray-400 mt-1">
                                            No recorded sales for the selected date. Try a different date.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <KpiCard label="Total Sales"     value={formatCurrency(kpi.totalSales)}   icon={DollarSign}   iconBg="bg-emerald-50" iconColor="text-emerald-500" />
                                    <KpiCard label="Transactions"    value={formatNumber(kpi.transactions)}   icon={ShoppingCart} iconBg="bg-blue-50"    iconColor="text-blue-500"    />
                                    <KpiCard label="Items Sold"      value={formatNumber(kpi.itemsSold)}      icon={Package}      iconBg="bg-violet-50"  iconColor="text-violet-500"  />
                                    <KpiCard label="Total Customers" value={formatNumber(kpi.totalCustomers)} icon={Users}        iconBg="bg-cyan-50"    iconColor="text-cyan-500"    />
                                    <KpiCard label="Gross Profit"    value={formatCurrency(kpi.grossProfit)}  icon={TrendingUp}   iconBg="bg-amber-50"   iconColor="text-amber-500"   />
                                    <KpiCard label="Net Profit"      value={formatCurrency(kpi.netProfit)}    icon={Percent}      iconBg="bg-green-50"   iconColor="text-green-500"   />
                                </>
                            )}
                        </div>

                        {/* Charts */}
                        {kpi && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h2 className="text-[14px] font-bold text-gray-800">Hourly Sales</h2>
                                    <p className="text-[11px] text-gray-400 mb-4">
                                        Sales performance throughout the day
                                    </p>
                                    {hourlyLoading
                                        ? <Skeleton className="h-64" />
                                        : <HourlySalesChart
                                            chartResp={hourlyResp as HourlySalesResponse | undefined}
                                        />}
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h2 className="text-[14px] font-bold text-gray-800">Payment Methods</h2>
                                    <p className="text-[11px] text-gray-400 mb-4">
                                        Transactions by payment type
                                    </p>
                                    {pmLoading
                                        ? <Skeleton className="h-64" />
                                        : <PaymentPieChart
                                            pmResp={pmResp as PaymentMethodResponse | undefined}
                                        />}
                                </div>
                            </div>
                        )}

                        {/* Details table + P&L */}
                        {kpi && (
                            <>
                                <DailySummaryTable
                                    detailsResp={detailsResp as DailySummaryDetailsResponse | undefined}
                                    isLoading={detailsLoading}
                                    onExportCsv={() => handleExport('csv')}
                                    onExportPdf={() => handleExport('pdf')}
                                    exporting={exporting}
                                />
                                <PlBreakdownSection
                                    detailsResp={detailsResp as DailySummaryDetailsResponse | undefined}
                                    isLoading={detailsLoading}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* ══ PER BRANCH TAB ════════════════════════ */}
                {generated && activeTab === 'per-branch' && isSuperAdmin && (
                    <PerBranchTab
                        allBranches={allBranches as AllBranchesSummaryResponse | undefined}
                        allBranchLoading={allBranchLoading}
                        knownBranches={branchesRaw}
                        baseDate={queryParams?.date ?? ''}
                    />
                )}
            </div>
        </div>
    );
}