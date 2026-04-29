'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    TrendingUp,
    Package,
    Bell,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    FileSpreadsheet,
    ReceiptText,
    DollarSign,
    ShoppingCart,
    BarChart2 as BarChartIcon,
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

import { useAuth }            from '@/context/AuthContext';
import {
    useSalesCards,
    useSalesChart,
    usePaymentMethods,
    useSalesTransactions,
    useSalesByBranch,
    useBranches,
}                             from '@/hooks/useSalesReport';
import { SalesReportFilters } from '@/components/SalesReportFilters';
import {
    exportSalesCSV,
    exportSalesPDF,
    downloadBlob,
}                             from '@/api/sales-report.api';
import {
    PAYMENT_METHOD_COLORS,
    TRANSACTION_STATUS_STYLES,
    TRANSACTIONS_PAGE_LIMIT,
}                             from '@/constants/sales-report.constants';
import type {
    SalesReportFilters as FiltersType,
    SalesReportQueryParams,
    SalesChartResponse,
    PaymentMethodResponse,
    SalesTransactionsResponse,
    BranchReportEntry,
} from '@/types/sales-report.types';

// ─── Currency & number formatters ─────────────────────────────────────────────
const formatCurrency = (n: number) =>
    `Rs ${new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n ?? 0)}`;

const formatNumber = (n: number) =>
    new Intl.NumberFormat('en-LK').format(n ?? 0);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-50
                         rounded-xl ${className}`} />
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const style = TRANSACTION_STATUS_STYLES[status] ?? {
        label:     status,
        className: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`inline-flex items-center justify-center px-3 py-1
                          rounded-lg text-[11px] font-semibold whitespace-nowrap min-w-[80px]
                          ${style.className}`}>
            {style.label}
        </span>
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

// ─── Vertical Bar Chart ───────────────────────────────────────────────────────
function SalesBarChart({
                           chartResp,
                           compact = false,
                       }: {
    chartResp?: SalesChartResponse;
    compact?:   boolean;
}) {
    const data        = chartResp?.data ?? [];
    const chartHeight = compact ? 200 : 260;

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-300"
                 style={{ height: chartHeight }}>
                <BarChartIcon className="h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">No data for this period</p>
            </div>
        );
    }

    const formatted = data.map(d => ({
        date:   (() => {
            const parts = d.date?.slice(0, 10).split('-');
            if (!parts || parts.length < 3) return d.date ?? '';
            const months = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
        })(),
        amount: d.amount,
    }));

    return (
        <div className="overflow-x-auto">
            <div style={{ minWidth: Math.max(formatted.length * 44, 320) }}>
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart
                        data={formatted}
                        margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                        barCategoryGap="35%"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            dy={6}
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
                            formatter={(val: number) => [formatCurrency(val), 'Sales']}
                            labelFormatter={label => `Date: ${label}`}
                            contentStyle={{
                                fontSize:        12,
                                borderRadius:    10,
                                border:          '1px solid #e2e8f0',
                                boxShadow:       '0 8px 24px rgba(0,0,0,0.08)',
                                padding:         '8px 14px',
                                color:           '#1e293b',
                                backgroundColor: '#ffffff',
                            }}
                            cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                        />
                        <Bar
                            dataKey="amount"
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
const PIE_FALLBACK_COLORS = ['#f97316', '#3b82f6', '#a855f7', '#14b8a6', '#f43f5e', '#eab308'];

const renderOutsideLabel = ({
                                cx, cy, midAngle, outerRadius, name, percentage,
                            }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x      = cx + radius * Math.cos(-midAngle * RADIAN);
    const y      = cy + radius * Math.sin(-midAngle * RADIAN);
    const anchor = x > cx ? 'start' : 'end';

    return (
        <text
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="central"
            style={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
        >
            {`${name} ${Math.round(percentage)}%`}
        </text>
    );
};

function PaymentPieChart({
                             pmResp,
                             compact = false,
                         }: {
    pmResp?:  PaymentMethodResponse;
    compact?: boolean;
}) {
    const data   = pmResp?.data ?? [];
    const height = compact ? 220 : 280;

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2"
                 style={{ height }}>
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
        color:
            PAYMENT_METHOD_COLORS[d.paymentMethod] ??
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
                        <Cell
                            key={i}
                            fill={entry.color}
                            stroke="white"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(val: number, name: string, props: any) => [
                        `${val} txns (${props.payload.percentage?.toFixed(1)}%)`,
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
                                    <circle
                                        cx={legendX}
                                        cy={legendY}
                                        r={4}
                                        fill={entry.color}
                                    />
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
function ExportButton({
                          onCsv,
                          onPdf,
                          exporting,
                      }: {
    onCsv:     () => void;
    onPdf:     () => void;
    exporting: 'csv' | 'pdf' | null;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onCsv}
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
                onClick={onPdf}
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

// ─── Transaction Table ────────────────────────────────────────────────────────
function TransactionTable({
                              txResp,
                              isLoading,
                              page,
                              onPageChange,
                              onExportCsv,
                              onExportPdf,
                              exporting,
                              title = 'Sales Transactions',
                          }: {
    txResp?:      SalesTransactionsResponse;
    isLoading:    boolean;
    page:         number;
    onPageChange: (p: number) => void;
    onExportCsv:  () => void;
    onExportPdf:  () => void;
    exporting:    'csv' | 'pdf' | null;
    title?:       string;
}) {
    const transactions = txResp?.data       ?? [];
    const pagination   = txResp?.pagination ?? null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-[14px] font-bold text-gray-800">{title}</h2>
                    {pagination && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatNumber(pagination.totalRecords)} total records
                        </p>
                    )}
                </div>
                <ExportButton onCsv={onExportCsv} onPdf={onExportPdf} exporting={exporting} />
            </div>

            {isLoading ? (
                <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100
                                    flex items-center justify-center">
                        <ReceiptText className="h-6 w-6 text-gray-200" />
                    </div>
                    <p className="text-[13px] text-gray-400 font-medium">
                        No transactions found
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                {['Invoice', 'Date', 'Payment', 'Subtotal', 'Discount', 'Tax', 'Total', 'Status'].map(h => (
                                    <th
                                        key={h}
                                        className={`px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider
                                                        ${['Subtotal','Discount','Tax','Total'].includes(h) ? 'text-right' : 'text-left'}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {transactions.map((tx, i) => (
                                <tr
                                    key={tx.invoiceNumber}
                                    className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                                                    hover:bg-blue-50/30`}
                                >
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="text-[12px] font-bold text-blue-600 font-mono">
                                                {tx.invoiceNumber}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="text-[12px] text-gray-500">{tx.saleDate}</span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="text-[12px] text-gray-600">{tx.paymentMethod}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <span className="text-[12px] text-gray-600 tabular-nums">
                                                {formatCurrency(tx.subtotal)}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <span className="text-[12px] text-gray-500 tabular-nums">
                                                {formatCurrency(tx.discountAmount)}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <span className="text-[12px] text-gray-500 tabular-nums">
                                                {formatCurrency(tx.taxAmount)}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                                                {formatCurrency(tx.totalAmount)}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                        <StatusBadge status={tx.saleStatus} />
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
                                               disabled:opacity-30 disabled:cursor-not-allowed
                                               transition-all"
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
                                               disabled:opacity-30 disabled:cursor-not-allowed
                                               transition-all"
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

// ─── Per-Branch Summary Card ──────────────────────────────────────────────────
function BranchSummaryCard({ entry, index }: { entry: BranchReportEntry; index: number }) {
    const { kpi, branch } = entry;

    const grossMarginPct =
        kpi.totalRevenue > 0
            ? ((kpi.averageSales / kpi.totalRevenue) * 100).toFixed(1)
            : '0.0';

    const BADGE_COLORS = [
        'bg-blue-100 text-blue-700',
        'bg-violet-100 text-violet-700',
        'bg-emerald-100 text-emerald-700',
        'bg-orange-100 text-orange-700',
        'bg-rose-100 text-rose-700',
        'bg-cyan-100 text-cyan-700',
    ];
    const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                        flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="px-5 pt-5 pb-4 flex-1">
                <div className="flex items-start justify-between gap-2 mb-5">
                    <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                        {branch.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                                      whitespace-nowrap flex-shrink-0 ${badgeColor}`}>
                        Branch {index + 1}
                    </span>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'Revenue',        value: formatCurrency(kpi.totalRevenue),    color: '' },
                        { label: 'Transactions',   value: formatNumber(kpi.totalTransactions), color: '' },
                        { label: 'Avg Sale Value', value: formatCurrency(kpi.averageSales),    color: '' },
                        { label: 'Gross Margin',   value: `${grossMarginPct}%`,                color: 'text-emerald-600' },
                        { label: 'Items Sold',     value: formatNumber(kpi.totalItems),        color: '' },
                    ].map(row => (
                        <div key={row.label} className="flex justify-between items-center">
                            <span className="text-[12px] text-gray-500">{row.label}</span>
                            <span className={`text-[12px] font-semibold ${row.color || 'text-gray-900'}`}>
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-0.5">
                    Items Sold
                </p>
                <p className="text-[12px] font-bold text-blue-700">
                    {formatNumber(kpi.totalItems)} units total
                </p>
            </div>
        </div>
    );
}

// ─── Per-Branch Charts + Table Section ───────────────────────────────────────
function PerBranchSection({
                              entry,
                              baseParams,
                          }: {
    entry:      BranchReportEntry;
    baseParams: SalesReportQueryParams;
}) {
    const [page,      setPage]      = useState(1);
    const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

    const branchParams: SalesReportQueryParams = useMemo(
        () => ({
            ...baseParams,
            branchId: String(entry.branch.id),
            page:     String(page),
            limit:    String(TRANSACTIONS_PAGE_LIMIT),
        }),
        [baseParams, entry.branch.id, page],
    );

    const exportParams: SalesReportQueryParams = useMemo(
        () => ({ ...baseParams, branchId: String(entry.branch.id) }),
        [baseParams, entry.branch.id],
    );

    const { data: chartResp, isLoading: chartLoading } = useSalesChart(branchParams, true);
    const { data: pmResp,    isLoading: pmLoading }    = usePaymentMethods(branchParams, true);
    const { data: txResp,    isLoading: txLoading }    = useSalesTransactions(branchParams, true);

    const handleExport = useCallback(
        async (type: 'csv' | 'pdf') => {
            setExporting(type);
            try {
                const blob =
                    type === 'csv'
                        ? await exportSalesCSV(exportParams)
                        : await exportSalesPDF(exportParams);
                downloadBlob(
                    blob,
                    `sales-${entry.branch.name.replace(/\s+/g, '-')}-${baseParams.dateFrom ?? 'all'}.${type}`,
                );
            } catch (err) {
                console.error(`[PerBranchSection] Export ${type} failed:`, err);
            } finally {
                setExporting(null);
            }
        },
        [exportParams, entry.branch.name, baseParams.dateFrom],
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-[13px] font-bold text-gray-800 mb-0.5">Live Sales Counter</p>
                    <p className="text-[11px] text-gray-400 mb-4">Sales amount by Day</p>
                    {chartLoading ? <Skeleton className="h-52" /> : (
                        <SalesBarChart chartResp={chartResp as SalesChartResponse | undefined} compact />
                    )}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-[13px] font-bold text-gray-800 mb-0.5">Payment Methods</p>
                    <p className="text-[11px] text-gray-400 mb-4">Transactions by payment type</p>
                    {pmLoading ? <Skeleton className="h-52" /> : (
                        <PaymentPieChart pmResp={pmResp as PaymentMethodResponse | undefined} compact />
                    )}
                </div>
            </div>

            <TransactionTable
                txResp={txResp as SalesTransactionsResponse | undefined}
                isLoading={txLoading}
                page={page}
                onPageChange={setPage}
                onExportCsv={() => handleExport('csv')}
                onExportPdf={() => handleExport('pdf')}
                exporting={exporting}
                title={`Sales Transactions (${entry.branch.name})`}
            />
        </div>
    );
}

// ─── Main Sales Report Page ────────────────────────────────────────────────────
export default function SalesReportPage() {
    const { user, isSuperAdmin } = useAuth();

    const [filters,          setFilters]          = useState<FiltersType | null>(null);
    const [generated,        setGenerated]        = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [activeTab,        setActiveTab]        = useState<'all' | 'per-branch'>('all');
    const [page,             setPage]             = useState(1);
    const [exporting,        setExporting]        = useState<'csv' | 'pdf' | null>(null);

    const { data: branchesRaw = [] } = useBranches();

    // ── FIX: Build queryParams from filters + selectedBranchId together ─────────
    // This ensures branchId is always current when either filters or branch changes
    const queryParams: SalesReportQueryParams | null = useMemo(() => {
        if (!filters) return null;
        return {
            dateFrom: filters.dateFrom,
            dateTo:   filters.dateTo,
            category: filters.categoryId,
            product:  filters.productId,
            // Super admin: use selected branch (empty = all branches)
            // Branch manager: always use their own branchId from JWT
            branchId: isSuperAdmin
                ? (selectedBranchId || undefined)
                : (user?.branchId != null ? String(user.branchId) : undefined),
        };
    }, [filters, selectedBranchId, isSuperAdmin, user?.branchId]);

    // ── Derived params with pagination ────────────────────────────────────────
    const paramsWithPage: SalesReportQueryParams = useMemo(
        () => ({
            ...(queryParams ?? {}),
            page:  String(page),
            limit: String(TRANSACTIONS_PAGE_LIMIT),
        }),
        [queryParams, page],
    );

    const exportParams: SalesReportQueryParams = useMemo(
        () => ({ ...(queryParams ?? {}) }),
        [queryParams],
    );

    const isAllEnabled       = generated && !!queryParams && activeTab === 'all';
    const isPerBranchEnabled = generated && !!queryParams && activeTab === 'per-branch' && isSuperAdmin;

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: cards,     isLoading: cardsLoading } = useSalesCards(paramsWithPage,        isAllEnabled);
    const { data: chartResp, isLoading: chartLoading } = useSalesChart(paramsWithPage,        isAllEnabled);
    const { data: pmResp,    isLoading: pmLoading }    = usePaymentMethods(paramsWithPage,    isAllEnabled);
    const { data: txResp,    isLoading: txLoading }    = useSalesTransactions(paramsWithPage, isAllEnabled);

    const byBranchParams = useMemo(() => ({ ...(queryParams ?? {}) }), [queryParams]);
    const { data: byBranch, isLoading: bbLoading } = useSalesByBranch(
        byBranchParams,
        isPerBranchEnabled,
    );

    const isLoading = cardsLoading || chartLoading || pmLoading || txLoading;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleGenerate = useCallback((f: FiltersType) => {
        setFilters(f);
        setPage(1);
        setGenerated(true);
    }, []);

    // ✅ FIX: branch change just updates selectedBranchId; queryParams memo recalculates
    const handleBranchChange = useCallback((newBranchId: string) => {
        setSelectedBranchId(newBranchId);
        setPage(1);
        // When a specific branch is selected, force back to 'all' tab
        if (newBranchId !== '') {
            setActiveTab('all');
        }
    }, []);

    const handleExport = useCallback(
        async (type: 'csv' | 'pdf') => {
            if (!queryParams) return;
            setExporting(type);
            try {
                const blob =
                    type === 'csv'
                        ? await exportSalesCSV(exportParams)
                        : await exportSalesPDF(exportParams);
                downloadBlob(blob, `sales-report-${queryParams.dateFrom ?? 'all'}.${type}`);
            } catch (err) {
                console.error('[SalesReportPage] Export failed:', err);
            } finally {
                setExporting(null);
            }
        },
        [queryParams, exportParams],
    );

    // ✅ FIX: Branch label — no "#" in fallback
    const headerBranchLabel = useMemo(() => {
        if (isSuperAdmin) return null;
        if (user?.branchId) {
            const branch = branchesRaw.find(b => String(b.branchId) === String(user.branchId));
            return branch?.name ?? `Branch ${user.branchId}`;
        }
        return null;
    }, [isSuperAdmin, user?.branchId, branchesRaw]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30
                            shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
                            Sales Report
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                            View all sales transactions and revenue breakdown
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">

                        {/* ✅ FIX: Super Admin branch dropdown — native select works reliably */}
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
                                    {branchesRaw.map((b) => (
                                        <option
                                            key={b.branchId}
                                            value={String(b.branchId)}
                                        >
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

                        {/* Branch Manager — static branch name pill, no "#" */}
                        {!isSuperAdmin && headerBranchLabel && (
                            <div className="bg-blue-600 text-white text-[13px] font-semibold
                                            px-5 py-2.5 rounded-xl whitespace-nowrap">
                                {headerBranchLabel}
                            </div>
                        )}

                        <button
                            className="p-2.5 text-gray-400 hover:text-gray-600
                                       hover:bg-gray-100 rounded-xl transition-colors border
                                       border-gray-200"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Page Body ────────────────────────────────────────────────── */}
            <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">

                {/* Filter bar */}
                <SalesReportFilters onGenerate={handleGenerate} isLoading={isLoading} />

                {/* All Branches / Per Branch tabs — super admin only */}
                {isSuperAdmin && generated && selectedBranchId === '' && (
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

                {/* Empty / initial state */}
                {!generated && (
                    <div className="flex flex-col items-center justify-center py-36 gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                                        shadow-sm flex items-center justify-center">
                            <ReceiptText className="h-9 w-9 text-gray-200" />
                        </div>
                        <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                            Set your filters above and click{' '}
                            <span className="text-blue-600 font-bold">Generate</span> to load the report.
                        </p>
                    </div>
                )}

                {/* ══ ALL BRANCHES TAB ════════════════════════════════════════ */}
                {generated && activeTab === 'all' && (
                    <div className="space-y-5">

                        {/* 4 KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {cardsLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-36" />
                                ))
                            ) : (
                                <>
                                    <KpiCard
                                        label="Total Revenue"
                                        value={formatCurrency(cards?.totalRevenue ?? 0)}
                                        icon={DollarSign}
                                        iconBg="bg-emerald-50"
                                        iconColor="text-emerald-500"
                                    />
                                    <KpiCard
                                        label="Total Transactions"
                                        value={formatNumber(cards?.totalTransactions ?? 0)}
                                        icon={ShoppingCart}
                                        iconBg="bg-blue-50"
                                        iconColor="text-blue-500"
                                    />
                                    <KpiCard
                                        label="Total Items"
                                        value={formatNumber(cards?.totalItems ?? 0)}
                                        icon={Package}
                                        iconBg="bg-violet-50"
                                        iconColor="text-violet-500"
                                    />
                                    <KpiCard
                                        label="Average Sales"
                                        value={formatCurrency(cards?.averageSales ?? 0)}
                                        icon={TrendingUp}
                                        iconBg="bg-amber-50"
                                        iconColor="text-amber-500"
                                    />
                                </>
                            )}
                        </div>

                        {/* Charts: bar (2/3) + pie (1/3) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                            <div className="lg:col-span-2 bg-white rounded-2xl
                                            border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-[14px] font-bold text-gray-800">
                                        Live Sales Counter
                                    </h2>
                                    {chartResp && (
                                        <span className="text-[11px] text-gray-400 bg-gray-100
                                                          px-2.5 py-1 rounded-lg font-medium">
                                            {chartResp.count} day{chartResp.count !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-400 mb-4">Sales amount by Day</p>
                                {chartLoading ? <Skeleton className="h-64" /> : (
                                    <SalesBarChart chartResp={chartResp as SalesChartResponse | undefined} />
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-[14px] font-bold text-gray-800 mb-0.5">
                                    Payment Methods
                                </h2>
                                <p className="text-[11px] text-gray-400 mb-4">
                                    Transactions by payment type
                                </p>
                                {pmLoading ? <Skeleton className="h-64" /> : (
                                    <PaymentPieChart pmResp={pmResp as PaymentMethodResponse | undefined} />
                                )}
                            </div>
                        </div>

                        {/* Transaction table */}
                        <TransactionTable
                            txResp={txResp as SalesTransactionsResponse | undefined}
                            isLoading={txLoading}
                            page={page}
                            onPageChange={setPage}
                            onExportCsv={() => handleExport('csv')}
                            onExportPdf={() => handleExport('pdf')}
                            exporting={exporting}
                        />
                    </div>
                )}

                {/* ══ PER BRANCH TAB ══════════════════════════════════════════ */}
                {generated && activeTab === 'per-branch' && isSuperAdmin && (
                    <div className="space-y-8">

                        {bbLoading ? (
                            <div className="grid gap-4"
                                 style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-64" />
                                ))}
                            </div>
                        ) : (byBranch?.branches ?? []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                                                shadow-sm flex items-center justify-center">
                                    <BarChartIcon className="h-9 w-9 text-gray-200" />
                                </div>
                                <p className="text-[14px] text-gray-400 font-medium">
                                    No branch data found for this period
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4"
                                     style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
                                    {(byBranch?.branches ?? []).map((entry, idx) => (
                                        <BranchSummaryCard key={entry.branch.id} entry={entry} index={idx} />
                                    ))}
                                </div>

                                <div className="space-y-10">
                                    {(byBranch?.branches ?? []).map(entry => (
                                        <div key={entry.branch.id}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0" />
                                                <h3 className="text-[14px] font-bold text-gray-900">
                                                    {entry.branch.name}
                                                </h3>
                                                {entry.branch.city && (
                                                    <span className="text-[12px] text-gray-400">
                                                        — {entry.branch.city}
                                                    </span>
                                                )}
                                            </div>
                                            <PerBranchSection entry={entry} baseParams={queryParams ?? {}} />
                                        </div>
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