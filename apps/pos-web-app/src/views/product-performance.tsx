'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    Package,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    FileSpreadsheet,
    TrendingUp,
    DollarSign,
    BarChart2 as BarChartIcon,
    Percent,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw } from 'lucide-react';

import { Button }                   from '@/components/ui/button';
import { Calendar }                 from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import { NotificationsDropdown } from '@/views/dashboard/components/NotificationsDropdown';
import { useBranches, useCategories } from '@/hooks/useSalesReport';
import {
    useProductKpiCards,
    useTopProducts,
    useProductPaymentMethods,
    usePerBranchSummary,
    useProductTable,
}                                   from '@/hooks/useProductPerformance';
import {
    exportProductPerformanceCsv,
    exportProductPerformancePdf,
    downloadBlob,
}                                   from '@/api/product-performance.api';
import {
    PP_DEFAULT_DATE_FROM,
    PP_DEFAULT_DATE_TO,
    PP_ALL_CATEGORIES_VALUE,
    PP_TABLE_PAGE_LIMIT,
    PP_PAYMENT_METHOD_COLORS,
    PP_MARGIN_COLORS,
    PP_KPI_CONFIG,
}                                   from '@/constants/product-performance.constants';
import type {
    ProductPerformanceQueryParams,
    TopProductsResponse,
    ProductPaymentMethodResponse,
    ProductTableResponse,
    PerBranchEntry,
}                                   from '@/types/product-performance.types';

// ─── Sentinel — empty string matches sales report ALL_BRANCHES_VALUE = '' ────
const ALL_BRANCHES_SENTINEL = '';

// ─── Calendar classNames — identical to sales report for consistent styling ──
const CALENDAR_CLASS_NAMES = {
    months:              'flex flex-col',
    month:               'space-y-3 p-3',
    caption:             'flex justify-center relative items-center h-8',
    caption_label:       'text-sm font-semibold text-gray-800',
    nav:                 'flex items-center gap-1',
    nav_button:          'h-7 w-7 bg-transparent hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors',
    nav_button_previous: 'absolute left-1',
    nav_button_next:     'absolute right-1',
    table:               'w-full border-collapse',
    head_row:            'flex',
    head_cell:           'text-gray-400 rounded-md w-9 font-medium text-[11px] text-center',
    row:                 'flex w-full mt-1',
    cell:                'h-9 w-9 text-center text-sm relative',
    day:                 'h-9 w-9 p-0 font-normal rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors aria-selected:opacity-100',
    day_selected:        'bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-semibold rounded-lg',
    day_today:           'bg-gray-100 text-gray-900 font-semibold',
    day_disabled:        'text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
    day_outside:         'text-gray-300',
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
    `Rs ${new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n ?? 0)}`;

const formatNumber = (n: number) =>
    new Intl.NumberFormat('en-LK').format(n ?? 0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function marginColorClass(pct: number): string {
    if (pct >= PP_MARGIN_COLORS.high.min)   return PP_MARGIN_COLORS.high.className;
    if (pct >= PP_MARGIN_COLORS.medium.min) return PP_MARGIN_COLORS.medium.className;
    return PP_MARGIN_COLORS.low.className;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-50
                         rounded-xl ${className}`} />
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

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
            <p className="text-[26px] font-bold text-gray-900 tracking-tight
                          leading-none truncate">
                {value}
            </p>
        </div>
    );
}

// ─── Top 10 Products Bar Chart ────────────────────────────────────────────────

const PIE_FALLBACK_COLORS = ['#f97316', '#3b82f6', '#a855f7', '#14b8a6', '#f43f5e', '#eab308'];

function TopProductsBarChart({ resp }: { resp?: TopProductsResponse }) {
    const data = resp?.data ?? [];

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-300"
                 style={{ height: 260 }}>
                <BarChartIcon className="h-10 w-10 text-gray-200" />
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
                        margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
                        barCategoryGap="35%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="productName"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            dy={6}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis
                            tickFormatter={v => String(Math.round(v))}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                        />
                        <Tooltip
                            formatter={(val) => [formatNumber(Number(val ?? 0)), 'Units Sold']}
                            contentStyle={{
                                fontSize:        12,
                                borderRadius:    10,
                                border:          '1px solid #e2e8f0',
                                boxShadow:       '0 8px 24px rgba(0,0,0,0.08)',
                                padding:         '8px 14px',
                                backgroundColor: '#ffffff',
                            }}
                            cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                        />
                        <Bar
                            dataKey="totalQuantitySold"
                            fill="#3b82f6"
                            radius={[5, 5, 0, 0]}
                            maxBarSize={44}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Payment Method Pie Chart ─────────────────────────────────────────────────

const renderOutsideLabel = ({ cx, cy, midAngle, outerRadius, name, percentage }: any) => {
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

function PaymentPieChart({
                             pmResp, compact = false,
                         }: {
    pmResp?:  ProductPaymentMethodResponse;
    compact?: boolean;
}) {
    const data   = pmResp?.data ?? [];
    const height = compact ? 220 : 280;

    const totalCount = data.reduce((sum, d) => sum + (d.count ?? 0), 0);
    const noData     = !data.length || (pmResp?.totalTransactions ?? 0) === 0 || totalCount === 0;

    if (noData) {
        return (
            <div className="flex flex-col items-center justify-center gap-2" style={{ height }}>
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-2xl">%</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">No payment data</p>
            </div>
        );
    }

    const pieData = data.map((d, i) => ({
        name:       d.paymentMethod,
        value:      d.count,
        percentage: d.percentage,
        color:      PP_PAYMENT_METHOD_COLORS[d.paymentMethod] ??
            PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length],
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="48%"
                    innerRadius={compact ? 40 : 55}
                    outerRadius={compact ? 68 : 88}
                    dataKey="value"
                    labelLine={false}
                    label={compact ? undefined : renderOutsideLabel}
                    paddingAngle={2}
                >
                    {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(val, name, props: any) => [
                        `${Number(val ?? 0)} txns (${props.payload.percentage?.toFixed(1)}%)`,
                        name,
                    ]}
                    contentStyle={{
                        fontSize:        12,
                        borderRadius:    10,
                        border:          '1px solid #e2e8f0',
                        boxShadow:       '0 8px 24px rgba(0,0,0,0.08)',
                        backgroundColor: '#ffffff',
                    }}
                />
                {compact && (
                    <g>
                        {pieData.map((entry, i) => {
                            const legendY = height - 30 + Math.floor(i / 2) * 16;
                            const legendX = i % 2 === 0 ? '15%' : '55%';
                            return (
                                <g key={i}>
                                    <circle cx={legendX} cy={legendY} r={4} fill={entry.color} />
                                    <text
                                        x={`${parseFloat(legendX as string) + 4}%`}
                                        y={legendY}
                                        dominantBaseline="central"
                                        style={{ fontSize: 10, fill: '#64748b' }}
                                    >
                                        {entry.name} {Math.round(entry.percentage)}%
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                )}
            </PieChart>
        </ResponsiveContainer>
    );
}

// ─── Export Buttons ───────────────────────────────────────────────────────────

function ExportButtons({
                           onExportCsv, onExportPdf, exporting,
                       }: {
    onExportCsv: () => void;
    onExportPdf: () => void;
    exporting:   'csv' | 'pdf' | null;
}) {
    return (
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
    );
}

// ─── Product Performance Details Table ───────────────────────────────────────

function ProductTable({
                          tableResp, isLoading, page, onPageChange, onExportCsv, onExportPdf, exporting,
                          title = 'Product Performance Details',
                          branchName,
                      }: {
    tableResp?:   ProductTableResponse;
    isLoading:    boolean;
    page:         number;
    onPageChange: (p: number) => void;
    onExportCsv:  () => void;
    onExportPdf:  () => void;
    exporting:    'csv' | 'pdf' | null;
    title?:       string;
    branchName?:  string;
}) {
    const rows       = tableResp?.data       ?? [];
    const pagination = tableResp?.pagination ?? null;
    const fullTitle  = branchName ? `${title} (${branchName})` : title;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-[14px] font-bold text-gray-800">{fullTitle}</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Complete product metrics and analysis
                    </p>
                </div>
                <ExportButtons
                    onExportCsv={onExportCsv}
                    onExportPdf={onExportPdf}
                    exporting={exporting}
                />
            </div>

            {isLoading ? (
                <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100
                                    flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-200" />
                    </div>
                    <p className="text-[13px] text-gray-400 font-medium">No products found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                {[
                                    { label: 'Product Name', align: 'left'  },
                                    { label: 'Category',     align: 'left'  },
                                    { label: 'Units Sold',   align: 'right' },
                                    { label: 'Revenue',      align: 'right' },
                                    { label: 'Cost',         align: 'right' },
                                    { label: 'Profit',       align: 'right' },
                                    { label: 'Margin',       align: 'right' },
                                ].map(h => (
                                    <th
                                        key={h.label}
                                        className={`px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase
                                                    tracking-wider text-${h.align}`}
                                    >
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {rows.map((row, i) => (
                                <tr
                                    key={`${row.productName}-${i}`}
                                    className={`transition-colors hover:bg-blue-50/30
                                                ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                >
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="text-[13px] font-semibold text-gray-800">
                                            {row.productName}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="text-[12px] text-gray-500">{row.category}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-700 tabular-nums font-medium">
                                            {formatNumber(row.unitsSold)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-700 tabular-nums">
                                            {formatCurrency(row.revenue)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className="text-[12px] text-gray-500 tabular-nums">
                                            {formatCurrency(row.cost)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className={`text-[12px] tabular-nums font-semibold
                                                          ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {formatCurrency(row.profit)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                        <span className={`text-[12px] tabular-nums font-semibold
                                                          ${marginColorClass(row.profitMargin)}`}>
                                            {row.profitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/60
                                        flex items-center justify-between">
                            <span className="text-[12px] text-gray-500">
                                Page{' '}
                                <span className="font-semibold text-gray-700">{pagination.currentPage}</span>
                                {' '}of{' '}
                                <span className="font-semibold text-gray-700">{pagination.totalPages}</span>
                                <span className="ml-2 text-gray-400">
                                    ({formatNumber(pagination.totalRecords)} records)
                                </span>
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    disabled={!pagination.hasPrevPage}
                                    onClick={() => onPageChange(page - 1)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                               border border-gray-200 text-[12px] font-medium
                                               text-gray-600 bg-white hover:bg-gray-50
                                               disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Prev
                                </button>
                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => onPageChange(page + 1)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                               border border-gray-200 text-[12px] font-medium
                                               text-gray-600 bg-white hover:bg-gray-50
                                               disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Per-Branch Top-5 Card (grid item) ───────────────────────────────────────

function PerBranchTopCard({ entry, index }: { entry: PerBranchEntry; index: number }) {
    const BADGE_COLORS = [
        'bg-blue-100 text-blue-700',
        'bg-violet-100 text-violet-700',
        'bg-emerald-100 text-emerald-700',
        'bg-orange-100 text-orange-700',
        'bg-rose-100 text-rose-700',
        'bg-cyan-100 text-cyan-700',
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-gray-900">{entry.branchName}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                                  ${BADGE_COLORS[index % BADGE_COLORS.length]}`}>
                    Top Products
                </span>
            </div>
            <div className="px-5 py-4 space-y-2.5">
                {entry.topProducts.length === 0 ? (
                    <p className="text-[12px] text-gray-400 py-2">No products for this period</p>
                ) : (
                    entry.topProducts.map(p => (
                        <div key={p.rank} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[11px] font-bold text-gray-400 w-4 flex-shrink-0">
                                    {p.rank}.
                                </span>
                                <span className="text-[12px] text-gray-700 font-medium truncate">
                                    {p.productName}
                                </span>
                            </div>
                            <span className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">
                                {formatNumber(p.unitsSold)} units · {formatCurrency(p.revenue)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Per-Branch Detailed Section (pie + paginated table for one branch) ───────

function PerBranchDetailSection({
                                    entry,
                                    baseParams,
                                    onExportCsv,
                                    onExportPdf,
                                }: {
    entry:       PerBranchEntry;
    baseParams:  ProductPerformanceQueryParams;
    onExportCsv: (branchId: string) => Promise<void>;
    onExportPdf: (branchId: string) => Promise<void>;
}) {
    const [page,      setPage]      = useState(1);
    const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

    const branchParams: ProductPerformanceQueryParams = useMemo(() => ({
        ...baseParams,
        branchId: String(entry.branchId),
        page:     String(page),
        limit:    String(PP_TABLE_PAGE_LIMIT),
    }), [baseParams, entry.branchId, page]);

    const { data: pmResp,    isLoading: pmLoading }    = useProductPaymentMethods(branchParams, true);
    const { data: tableResp, isLoading: tableLoading } = useProductTable(branchParams, true);

    const handleCsv = useCallback(async () => {
        setExporting('csv');
        try { await onExportCsv(String(entry.branchId)); } finally { setExporting(null); }
    }, [onExportCsv, entry.branchId]);

    const handlePdf = useCallback(async () => {
        setExporting('pdf');
        try { await onExportPdf(String(entry.branchId)); } finally { setExporting(null); }
    }, [onExportPdf, entry.branchId]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0" />
                <h3 className="text-[15px] font-bold text-gray-900">{entry.branchName}</h3>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="text-[13px] font-bold text-gray-800 mb-0.5">Payment Methods</h4>
                <p className="text-[11px] text-gray-400 mb-4">Transactions by payment type</p>
                {pmLoading
                    ? <Skeleton className="h-56" />
                    : (entry.topProducts?.length ?? 0) === 0
                        ? (
                            <div className="flex flex-col items-center justify-center gap-2 h-56">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-gray-300 text-2xl">%</span>
                                </div>
                                <p className="text-sm text-gray-400 font-medium">No payment data</p>
                            </div>
                        )
                        : <PaymentPieChart pmResp={pmResp} compact />
                }
            </div>

            <ProductTable
                tableResp={tableResp}
                isLoading={tableLoading}
                page={page}
                onPageChange={setPage}
                onExportCsv={handleCsv}
                onExportPdf={handlePdf}
                exporting={exporting}
                branchName={entry.branchName}
            />
        </div>
    );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function ProductPerformanceView() {
    const { user, isAdmin, isManager } = useAuth();

    // ── Filter bar state ──────────────────────────────────────────────────────
    const [dateFrom,         setDateFrom]         = useState<Date>(new Date(PP_DEFAULT_DATE_FROM));
    const [dateTo,           setDateTo]           = useState<Date>(new Date(PP_DEFAULT_DATE_TO));
    const [categoryId,       setCategoryId]       = useState<string>(PP_ALL_CATEGORIES_VALUE);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(ALL_BRANCHES_SENTINEL);

    // ── Generated query params ────────────────────────────────────────────────
    const [activeParams, setActiveParams] = useState<ProductPerformanceQueryParams | null>(null);
    const [isGenerated,  setIsGenerated]  = useState(false);

    // ── Table pagination (All Branches / single-branch view) ──────────────────
    const [tablePage, setTablePage] = useState(1);

    // ── Tab ───────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'all' | 'per-branch'>('all');

    // ── Export (All Branches table) ───────────────────────────────────────────
    const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

    // ── Reference data ────────────────────────────────────────────────────────
    const today                     = new Date();
    const { data: branches   = [] } = useBranches();
    const { data: categories = [] } = useCategories();

    const showBranchSelector = isAdmin;
    // Tabs visible only for SUPER_ADMIN with "All Branches" selected
    const showTabs = isAdmin && selectedBranchId === ALL_BRANCHES_SENTINEL;

    // ── FIX: Branch manager label — matches sales report exactly ─────────────
    // Shows the branch manager's own branch name as a static pill in the header.
    const headerBranchLabel = useMemo(() => {
        if (isAdmin) return null;
        if (user?.branch_id) {
            const branch = branches.find(b => String(b.branchId) === String(user.branch_id));
            return branch?.name ?? `Branch ${user.branch_id}`;
        }
        return null;
    }, [isAdmin, user?.branch_id, branches]);

    // ── Effective branchId for API calls ─────────────────────────────────────
    const effectiveBranchId = useMemo((): string | undefined => {
        if (isManager)                                         return undefined;
        if (selectedBranchId !== ALL_BRANCHES_SENTINEL)        return selectedBranchId;
        return undefined;
    }, [isManager, selectedBranchId]);

    // ── Query params ──────────────────────────────────────────────────────────
    const baseQueryParams = useMemo((): ProductPerformanceQueryParams => {
        if (!activeParams) return {};
        return {
            dateFrom:  activeParams.dateFrom,
            dateTo:    activeParams.dateTo,
            category:  activeParams.category,
            branchId:  effectiveBranchId,
        };
    }, [activeParams, effectiveBranchId]);

    const tableQueryParams = useMemo((): ProductPerformanceQueryParams => ({
        ...baseQueryParams,
        page:  String(tablePage),
        limit: String(PP_TABLE_PAGE_LIMIT),
    }), [baseQueryParams, tablePage]);

    const enableAllTab    = isGenerated && (!showTabs || activeTab === 'all');
    const enablePerBranch = isGenerated && showTabs && activeTab === 'per-branch';

    // ── Queries ───────────────────────────────────────────────────────────────
    const cardsQuery     = useProductKpiCards(baseQueryParams,      enableAllTab);
    const topProdQuery   = useTopProducts(baseQueryParams,          enableAllTab);
    const pmQuery        = useProductPaymentMethods(baseQueryParams, enableAllTab);
    const perBranchQuery = usePerBranchSummary(baseQueryParams,     enablePerBranch);
    const tableQuery     = useProductTable(tableQueryParams,        enableAllTab);

    const isLoading =
        cardsQuery.isLoading ||
        topProdQuery.isLoading ||
        pmQuery.isLoading ||
        tableQuery.isLoading;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleGenerate = useCallback(() => {
        const selectedCategory = categories.find(c => c.id === categoryId);
        setActiveParams({
            dateFrom: format(dateFrom, 'yyyy-MM-dd'),
            dateTo:   format(dateTo,   'yyyy-MM-dd'),
            category: categoryId !== PP_ALL_CATEGORIES_VALUE ? selectedCategory?.name : undefined,
        });
        setIsGenerated(true);
        setTablePage(1);
    }, [dateFrom, dateTo, categoryId, categories]);

    const handleReset = useCallback(() => {
        setDateFrom(new Date(PP_DEFAULT_DATE_FROM));
        setDateTo(new Date(PP_DEFAULT_DATE_TO));
        setCategoryId(PP_ALL_CATEGORIES_VALUE);
        setSelectedBranchId(ALL_BRANCHES_SENTINEL);
        setActiveParams(null);
        setIsGenerated(false);
        setTablePage(1);
        setActiveTab('all');
    }, []);

    const handleBranchChange = useCallback((newBranchId: string) => {
        setSelectedBranchId(newBranchId);
        setTablePage(1);
        if (newBranchId !== ALL_BRANCHES_SENTINEL) setActiveTab('all');
    }, []);

    const handleExportCsv = useCallback(async (branchIdOverride?: string) => {
        if (!activeParams) return;
        try {
            setExporting('csv');
            const blob = await exportProductPerformanceCsv({
                ...activeParams,
                branchId: branchIdOverride ?? effectiveBranchId,
            });
            downloadBlob(blob, `product-performance-${activeParams.dateFrom ?? 'all'}.csv`);
        } catch { /* TODO: toast */ } finally { setExporting(null); }
    }, [activeParams, effectiveBranchId]);

    const handleExportPdf = useCallback(async (branchIdOverride?: string) => {
        if (!activeParams) return;
        try {
            setExporting('pdf');
            const blob = await exportProductPerformancePdf({
                ...activeParams,
                branchId: branchIdOverride ?? effectiveBranchId,
            });
            downloadBlob(blob, `product-performance-${activeParams.dateFrom ?? 'all'}.pdf`);
        } catch { /* TODO: toast */ } finally { setExporting(null); }
    }, [activeParams, effectiveBranchId]);

    // ── Calendar trigger class ────────────────────────────────────────────────
    const calTriggerClass = cn(
        'h-10 justify-start text-left font-normal text-[13px] rounded-xl',
        'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
        'shadow-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div
          className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30
                            shadow-[0_1px_6px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
                Product Performance Report
              </h1>
              <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                Analyze product sales, profit margins, and top sellers
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Super Admin — branch dropdown */}
              {showBranchSelector && (
                <div className="relative">
                  <select
                    value={selectedBranchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="appearance-none bg-blue-600 text-white text-[13px]
                                               font-semibold pl-4 pr-9 py-2.5 rounded-xl
                                               cursor-pointer border-0 focus:outline-none
                                               focus:ring-2 focus:ring-blue-400
                                               hover:bg-blue-700 transition-colors min-w-[160px]"
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.branchId} value={String(b.branchId)}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2.5 top-1/2 -translate-y-1/2
                                               h-4 w-4 text-white pointer-events-none"
                  />
                </div>
              )}

              {/* FIX: Branch Manager — static branch name pill, identical to sales report */}
              {!isAdmin && headerBranchLabel && (
                <div
                  className="bg-blue-600 text-white text-[13px] font-semibold
                                            px-5 py-2.5 rounded-xl whitespace-nowrap"
                >
                  {headerBranchLabel}
                </div>
              )}

              <NotificationsDropdown
                branchId={isAdmin ? undefined : (user?.branch_id ?? undefined)}
              />
            </div>
          </div>
        </div>

        {/* ── Page Body ─────────────────────────────────────────────── */}
        <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">
          {/* ── Filter Bar ─────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-end gap-3 px-5 py-4
                                bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            {/* Date From */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Date From
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      calTriggerClass,
                      "w-44",
                      !dateFrom && "text-gray-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {dateFrom
                        ? format(dateFrom, "MMM d, yyyy")
                        : "Pick a date"}
                    </span>
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
                    onSelect={(d) => {
                      if (!d) return;
                      setDateFrom(d);
                      if (d > dateTo) setDateTo(d);
                    }}
                    disabled={(date) => date > today}
                    defaultMonth={dateFrom}
                    initialFocus
                    classNames={CALENDAR_CLASS_NAMES}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Date To
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      calTriggerClass,
                      "w-44",
                      !dateTo && "text-gray-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {dateTo ? format(dateTo, "MMM d, yyyy") : "Pick a date"}
                    </span>
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
                    onSelect={(d) => d && setDateTo(d)}
                    disabled={(date) => date < dateFrom || date > today}
                    defaultMonth={dateTo}
                    initialFocus
                    classNames={CALENDAR_CLASS_NAMES}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Category
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className={cn(calTriggerClass, "w-48")}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl z-[200] max-h-64 overflow-y-auto
                                                       border border-gray-100 shadow-xl bg-white"
                >
                  <SelectItem value={PP_ALL_CATEGORIES_VALUE}>
                    All Categories
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
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
                    <span
                      className="w-3.5 h-3.5 border-2 border-white/40 border-t-white
                                                     rounded-full animate-spin"
                    />
                    Loading…
                  </span>
                ) : (
                  "Generate"
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Reset filters"
                className="h-10 w-10 rounded-xl border-gray-200 bg-white
                                       hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs — super admin + all branches only */}
          {showTabs && isGenerated && (
            <div
              className="flex gap-1 bg-white border border-gray-100
                                    rounded-2xl p-1 w-fit shadow-sm"
            >
              {(["all", "per-branch"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setTablePage(1);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold
                                            transition-all duration-150 ${
                                              activeTab === tab
                                                ? "bg-gray-900 text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            }`}
                >
                  {tab === "all" ? "All Branches" : "Per Branch"}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isGenerated && (
            <div className="flex flex-col items-center justify-center py-36 gap-5">
              <div
                className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                                        shadow-sm flex items-center justify-center"
              >
                <Package className="h-9 w-9 text-gray-200" />
              </div>
              <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                Set your filters above and click{" "}
                <span className="text-blue-600 font-bold">Generate</span> to
                load the report.
              </p>
            </div>
          )}

          {/* ── PER BRANCH TAB ─────────────────────────────────────── */}
          {isGenerated && showTabs && activeTab === "per-branch" && (
            <div className="space-y-10">
              {perBranchQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : (perBranchQuery.data?.branches ?? []).length === 0 ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  No branch data available
                </div>
              ) : (
                <>
                  {/* Section 1: top-5 cards for all branches */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {(perBranchQuery.data?.branches ?? []).map((entry, idx) => (
                      <PerBranchTopCard
                        key={entry.branchId}
                        entry={entry}
                        index={idx}
                      />
                    ))}
                  </div>

                  {/* Section 2: per-branch pie + table, stacked per branch */}
                  <div className="space-y-12">
                    {(perBranchQuery.data?.branches ?? []).map((entry) => (
                      <PerBranchDetailSection
                        key={entry.branchId}
                        entry={entry}
                        baseParams={baseQueryParams}
                        onExportCsv={handleExportCsv}
                        onExportPdf={handleExportPdf}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ALL BRANCHES / SINGLE BRANCH / BRANCH MANAGER ─────── */}
          {isGenerated && (!showTabs || activeTab === "all") && (
            <div className="space-y-5">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cardsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                  ))
                ) : (
                  <>
                    <KpiCard
                      label="Total Products Sold"
                      value={formatNumber(
                        cardsQuery.data?.totalProductsSold ?? 0,
                      )}
                      icon={Package}
                      iconBg={PP_KPI_CONFIG.totalProductsSold.iconBg}
                      iconColor={PP_KPI_CONFIG.totalProductsSold.iconColor}
                    />
                    <KpiCard
                      label="Top Selling Product"
                      value={
                        cardsQuery.data?.topSellingProduct ??
                        topProdQuery.data?.data?.[0]?.productName ??
                        "N/A"
                      }
                      icon={TrendingUp}
                      iconBg={PP_KPI_CONFIG.topSellingCategory.iconBg}
                      iconColor={PP_KPI_CONFIG.topSellingCategory.iconColor}
                    />
                    <KpiCard
                      label="Total Revenue"
                      value={formatCurrency(cardsQuery.data?.totalRevenue ?? 0)}
                      icon={DollarSign}
                      iconBg={PP_KPI_CONFIG.totalRevenue.iconBg}
                      iconColor={PP_KPI_CONFIG.totalRevenue.iconColor}
                    />
                    <KpiCard
                      label="Total Profit"
                      value={formatCurrency(cardsQuery.data?.totalProfit ?? 0)}
                      icon={Percent}
                      iconBg={PP_KPI_CONFIG.totalProfit.iconBg}
                      iconColor={PP_KPI_CONFIG.totalProfit.iconColor}
                    />
                  </>
                )}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <div
                  className="xl:col-span-3 bg-white rounded-2xl border border-gray-100
                                            shadow-sm p-6"
                >
                  <div className="mb-4">
                    <h2 className="text-[14px] font-bold text-gray-800">
                      Top 10 Products
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Best selling products by units sold
                    </p>
                  </div>
                  {topProdQuery.isLoading ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <TopProductsBarChart resp={topProdQuery.data} />
                  )}
                </div>

                <div
                  className="xl:col-span-2 bg-white rounded-2xl border border-gray-100
                                            shadow-sm p-6"
                >
                  <div className="mb-4">
                    <h2 className="text-[14px] font-bold text-gray-800">
                      Payment Methods
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Transactions by payment type
                    </p>
                  </div>
                  {pmQuery.isLoading ? (
                    <Skeleton className="h-64" />
                  ) : (cardsQuery.data?.totalProductsSold ?? 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 h-64">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-2xl">%</span>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">
                        No payment data
                      </p>
                    </div>
                  ) : (
                    <PaymentPieChart pmResp={pmQuery.data} />
                  )}
                </div>
              </div>

              {/* Product Performance Details Table */}
              <ProductTable
                tableResp={tableQuery.data}
                isLoading={tableQuery.isLoading}
                page={tablePage}
                onPageChange={(p) => {
                  setTablePage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onExportCsv={() => handleExportCsv()}
                onExportPdf={() => handleExportPdf()}
                exporting={exporting}
              />
            </div>
          )}
        </div>
      </div>
    );
}