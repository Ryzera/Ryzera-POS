'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    TrendingUp,
    Bell,
    ChevronDown,
    DollarSign,
    PercentIcon,
    TrendingDown,
    FileText,
    FileSpreadsheet,
    BarChart3,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { Skeleton }      from '@/components/ui/skeleton';
import { useAuth }        from '@/context/AuthContext';
import { fetchBranches }  from '@/api/sales-report.api';
import {
    exportProfitLossCSV,
    exportProfitLossPDF,
    downloadBlob,
} from '@/api/profit-loss.api';
import {
    useProfitLossCards,
    useProfitLossChart,
    useProfitLossTable,
    useProfitLossByBranch,
} from '@/hooks/useProfitLoss';
import { useQuery } from '@tanstack/react-query';

import type {
    ProfitLossQueryParams,
    ProfitLossCards,
    ProfitLossChartResponse,
    ProfitLossTableResponse,
    ProfitLossBranchEntry,
} from '@/types/profit-loss.types';
import type { Branch } from '@/types/sales-report.types';

import {
    ProfitLossFilters,
    type ProfitLossFiltersShape,
} from '@/components/ProfitLossFilters';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    return `Rs ${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    label:     string;
    value:     string;
    sub?:      string;
    subColor?: string;
    icon:      React.ReactNode;
    accent:    string;
}

function KpiCard({ label, value, sub, subColor, icon, accent }: KpiCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                        flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-gray-500">{label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">
                    {value}
                </p>
                {sub && (
                    <p className={`text-[12px] font-semibold mt-1 ${subColor ?? 'text-gray-400'}`}>
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── KPI card builders (used by the All-Branches tab only) ───────────────────

function buildTopCards(cards: ProfitLossCards): KpiCardProps[] {
    return [
        {
            label:  'Total Sales',
            value:  formatCurrency(cards.totalSales),
            icon:   <DollarSign className="h-4 w-4 text-blue-600" />,
            accent: 'bg-blue-50',
        },
        {
            label:  'Cost of Goods Sold',
            value:  formatCurrency(cards.costOfGoodsSold),
            icon:   <TrendingDown className="h-4 w-4 text-orange-500" />,
            accent: 'bg-orange-50',
        },
        {
            label:  'Gross Profit',
            value:  formatCurrency(cards.grossProfit),
            icon:   <TrendingUp className="h-4 w-4 text-emerald-600" />,
            accent: 'bg-emerald-50',
        },
        {
            label:    'Net Profit',
            value:    formatCurrency(cards.netProfit),
            sub:      `Margin ${formatPercent(cards.profitMargin)}`,
            subColor: cards.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-500',
            icon:     <PercentIcon className="h-4 w-4 text-violet-600" />,
            accent:   'bg-violet-50',
        },
    ];
}

function buildSubCards(cards: ProfitLossCards): KpiCardProps[] {
    return [
        {
            label:  'Total Tax',
            value:  formatCurrency(cards.totalTax),
            icon:   <DollarSign className="h-4 w-4 text-gray-500" />,
            accent: 'bg-gray-50',
        },
        {
            label:  'Total Discounts',
            value:  formatCurrency(cards.totalDiscounts),
            icon:   <DollarSign className="h-4 w-4 text-yellow-500" />,
            accent: 'bg-yellow-50',
        },
        {
            label:  'Total Returns',
            value:  formatCurrency(cards.totalReturns),
            icon:   <DollarSign className="h-4 w-4 text-red-500" />,
            accent: 'bg-red-50',
        },
    ];
}

// ─── Branch Summary Card ──────────────────────────────────────────────────────
// Compact card used in the Per Branch tab — matches the screenshot layout:
// branch name as header, then labelled rows, Net Profit + margin at the bottom.

function BranchSummaryCard({
                               branchName,
                               kpi,
                               accentColor,   // Tailwind text color class, e.g. 'text-blue-700'
                               borderColor,   // Tailwind border color class, e.g. 'border-blue-200'
                           }: {
    branchName:  string;
    kpi:         ProfitLossCards;
    accentColor: string;
    borderColor: string;
}) {
    // Rows rendered in order matching the screenshot
    const rows: { label: string; value: string; color?: string }[] = [
        { label: 'Revenue',       value: formatCurrency(kpi.totalSales)      },
        { label: 'COGS',          value: formatCurrency(kpi.costOfGoodsSold), color: 'text-red-500'     },
        { label: 'Gross Profit',  value: formatCurrency(kpi.grossProfit),     color: 'text-emerald-600' },
        { label: 'Discounts',     value: formatCurrency(kpi.totalDiscounts),  color: 'text-orange-500'  },
        { label: 'Returns',       value: formatCurrency(kpi.totalReturns),    color: 'text-red-500'     },
        { label: 'Tax Collected', value: formatCurrency(kpi.totalTax),        color: 'text-gray-500'    },
    ];

    return (
        <div className={`bg-white rounded-2xl border-2 ${borderColor} shadow-sm p-5 flex flex-col gap-0`}>
            {/* Branch name header */}
            <p className={`text-[14px] font-bold mb-4 ${accentColor}`}>{branchName}</p>

            {/* Data rows */}
            <div className="space-y-2.5">
                {rows.map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-4">
                        <span className="text-[12px] text-gray-500 whitespace-nowrap">
                            {row.label}
                        </span>
                        <span className={`text-[12px] font-semibold tabular-nums ${row.color ?? 'text-gray-900'}`}>
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="my-3.5 h-px bg-gray-100" />

            {/* Net Profit footer */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[12px] font-bold text-gray-800">Net Profit</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Profit margin: {formatPercent(kpi.profitMargin)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-semibold text-gray-400">Rs</p>
                    <p className={`text-[20px] font-bold leading-none tabular-nums ${
                        kpi.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                        {kpi.netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Accent / border palette — one entry per branch (cycles if > 5 branches)
const BRANCH_CARD_PALETTE = [
    { accentColor: 'text-blue-700',   borderColor: 'border-blue-100'   },
    { accentColor: 'text-violet-700', borderColor: 'border-violet-100' },
    { accentColor: 'text-emerald-700',borderColor: 'border-emerald-100'},
    { accentColor: 'text-orange-700', borderColor: 'border-orange-100' },
    { accentColor: 'text-rose-700',   borderColor: 'border-rose-100'   },
] as const;

// ─── KPI Cards Section (All Branches tab) ────────────────────────────────────

function KpiCardsSection({
                             cards,
                             isLoading,
                         }: {
    cards?:    ProfitLossCards;
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!cards) return null;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {buildTopCards(cards).map(c => <KpiCard key={c.label} {...c} />)}
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-2xl">
                {buildSubCards(cards).map(c => <KpiCard key={c.label} {...c} />)}
            </div>
        </div>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
// FIX: ResponsiveContainer is replaced with a fixed-width BarChart inside a
// horizontally-scrollable wrapper. The canvas width grows with the number of
// data points (60px per group minimum) so bars are never crushed on long ranges.
// The scrollbar only appears when needed (short ranges look identical to before).

const BAR_GROUP_MIN_PX = 60; // minimum px per date point (3 bars + padding)
const Y_AXIS_WIDTH_PX  = 56; // room for the Y-axis labels

function PLBarChart({
                        chartResp,
                        isLoading,
                        compact = false,
                    }: {
    chartResp?:  ProfitLossChartResponse;
    isLoading:   boolean;
    compact?:    boolean;
}) {
    if (isLoading) return <Skeleton className={compact ? 'h-48' : 'h-64'} />;

    const chartData = (chartResp?.data ?? []).map(d => ({
        ...d,
        label: formatDateLabel(d.date),
    }));

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-[13px] text-gray-400">
                No chart data available
            </div>
        );
    }

    const chartHeight = compact ? 200 : 260;
    // Canvas is at least as wide as the container; grows when there are many bars
    const canvasWidth = Math.max(
        chartData.length * BAR_GROUP_MIN_PX + Y_AXIS_WIDTH_PX,
        300,
    );

    return (
        // overflow-x-auto → horizontal scrollbar appears only when canvasWidth > container
        <div className="overflow-x-auto w-full">
            <div style={{ width: canvasWidth, height: chartHeight }}>
                <BarChart
                    width={canvasWidth}
                    height={chartHeight}
                    data={chartData}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        width={Y_AXIS_WIDTH_PX}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                        }
                    />
                    <Tooltip
                        formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        formatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="cost"    fill="#ef4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="profit"  fill="#22c55e" radius={[3, 3, 0, 0]} />
                </BarChart>
            </div>
        </div>
    );
}

// ─── P&L Statement Table ──────────────────────────────────────────────────────

function PLTable({
                     tableResp,
                     isLoading,
                     onExportCsv,
                     onExportPdf,
                     exporting,
                     title = 'Profit & Loss Statement (All Branches)',
                 }: {
    tableResp?:  ProfitLossTableResponse;
    isLoading:   boolean;
    onExportCsv: () => void;
    onExportPdf: () => void;
    exporting:   'csv' | 'pdf' | null;
    title?:      string;
}) {
    const rows = tableResp?.data ?? [];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                <div>
                    <p className="text-[14px] font-bold text-gray-900">{title}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        Detailed P&L breakdown by date
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onExportCsv}
                        disabled={!!exporting}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                                   bg-gray-900 text-white text-[12px] font-semibold
                                   hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                        {exporting === 'csv' ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30
                                             border-t-white rounded-full animate-spin" />
                        ) : (
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                        )}
                        CSV
                    </button>
                    <button
                        onClick={onExportPdf}
                        disabled={!!exporting}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                                   bg-gray-900 text-white text-[12px] font-semibold
                                   hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                        {exporting === 'pdf' ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30
                                             border-t-white rounded-full animate-spin" />
                        ) : (
                            <FileText className="h-3.5 w-3.5" />
                        )}
                        PDF
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6 space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
            ) : rows.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-gray-400">
                    No data for the selected date range
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                        <tr className="border-b border-gray-50">
                            {['Date', 'Revenue', 'COGS', 'Gross Profit', 'Tax',
                                'Returns', 'Net Profit', 'Margin'].map(h => (
                                <th
                                    key={h}
                                    className="px-5 py-3 text-left text-[11px] font-semibold
                                                   text-gray-500 uppercase tracking-wide whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={row.date}
                                className={`border-b border-gray-50 hover:bg-gray-50/50
                                                transition-colors ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                            >
                                <td className="px-5 py-3 font-medium text-gray-700">{row.date}</td>
                                <td className="px-5 py-3 text-gray-900 font-medium">{formatCurrency(row.revenue)}</td>
                                <td className="px-5 py-3 text-gray-600">{formatCurrency(row.cogs)}</td>
                                <td className="px-5 py-3 text-gray-900">{formatCurrency(row.grossProfit)}</td>
                                <td className="px-5 py-3 text-gray-600">{formatCurrency(row.tax)}</td>
                                <td className="px-5 py-3 text-gray-600">{formatCurrency(row.returns)}</td>
                                <td className={`px-5 py-3 font-semibold ${
                                    row.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                    {formatCurrency(row.netProfit)}
                                </td>
                                <td className={`px-5 py-3 font-semibold ${
                                    row.margin >= 30 ? 'text-emerald-600'
                                        : row.margin >= 15 ? 'text-orange-500'
                                            : 'text-red-500'
                                }`}>
                                    {formatPercent(row.margin)}
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

// ─── Per-Branch Section ───────────────────────────────────────────────────────
// Each branch renders its own full block top-to-bottom:
//   1. Branch name pill + divider line
//   2. KPI cards (4 top + 3 sub)   ← was missing entirely before
//   3. Bar chart (horizontally scrollable for long ranges)
//   4. P&L table with CSV/PDF export

const BADGE_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
];

function PerBranchSection({
                              entries,
                              branches,
                              baseParams,
                          }: {
    entries:    ProfitLossBranchEntry[];
    branches:   Branch[];
    baseParams: ProfitLossQueryParams;
}) {
    const getBranchName = useCallback(
        (branchId: number | null): string => {
            if (branchId == null) return 'Unknown Branch';
            const b = branches.find(br => br.branchId === branchId);
            return b?.name ?? `Branch ${branchId}`;
        },
        [branches],
    );

    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (type: 'csv' | 'pdf', entry: ProfitLossBranchEntry) => {
        const key = `${type}-${entry.branch.id}`;
        setExporting(key);
        try {
            const params: ProfitLossQueryParams = {
                ...baseParams,
                branchId: entry.branch.id != null ? String(entry.branch.id) : undefined,
            };
            const blob = type === 'csv'
                ? await exportProfitLossCSV(params)
                : await exportProfitLossPDF(params);
            const safeName = getBranchName(entry.branch.id).replace(/\s+/g, '-');
            downloadBlob(blob, `pl-${safeName}-${baseParams.dateFrom ?? 'all'}.${type}`);
        } catch (err) {
            console.error('[PerBranchSection] Export failed:', err);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="space-y-10">

            {/* ── All branch summary boxes at the top ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry, idx) => (
                    <BranchSummaryCard
                        key={entry.branch.id ?? idx}
                        branchName={getBranchName(entry.branch.id)}
                        kpi={entry.kpi}
                        accentColor={BRANCH_CARD_PALETTE[idx % BRANCH_CARD_PALETTE.length].accentColor}
                        borderColor={BRANCH_CARD_PALETTE[idx % BRANCH_CARD_PALETTE.length].borderColor}
                    />
                ))}
            </div>

            {/* ── Per-branch detail sections below ── */}
            {entries.map((entry, idx) => {
                const branchName    = getBranchName(entry.branch.id);
                const badgeColor    = BADGE_COLORS[idx % BADGE_COLORS.length];
                const csvExporting  = exporting === `csv-${entry.branch.id}` ? 'csv' as const : null;
                const pdfExporting  = exporting === `pdf-${entry.branch.id}` ? 'pdf' as const : null;
                const currentExport = csvExporting ?? pdfExporting;

                return (
                    <div key={entry.branch.id ?? idx} className="space-y-4">

                        {/* Branch header */}
                        <div className="flex items-center gap-3">
                        <span className={`text-[12px] font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap ${badgeColor}`}>
                            {branchName}
                        </span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        {/* Scrollable bar chart */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-[13px] font-bold text-gray-800 mb-0.5">
                                Live Sales Counter
                            </p>
                            <p className="text-[11px] text-gray-400 mb-4">Sales amount by Day</p>
                            <PLBarChart chartResp={entry.chart} isLoading={false} compact />
                        </div>

                        {/* P&L table */}
                        <PLTable
                            tableResp={entry.table}
                            isLoading={false}
                            title={`Profit & Loss Statement (${branchName})`}
                            onExportCsv={() => handleExport('csv', entry)}
                            onExportPdf={() => handleExport('pdf', entry)}
                            exporting={currentExport}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfitLossPage() {
    const { user, isSuperAdmin } = useAuth();

    const [filters,          setFilters]          = useState<ProfitLossFiltersShape | null>(null);
    const [generated,        setGenerated]        = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [activeTab,        setActiveTab]        = useState<'all' | 'per-branch'>('all');
    const [exporting,        setExporting]        = useState<'csv' | 'pdf' | null>(null);

    const { data: branchesRaw = [] } = useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn:  fetchBranches,
    });

    const queryParams: ProfitLossQueryParams | null = useMemo(() => {
        if (!filters) return null;
        return {
            dateFrom: filters.dateFrom,
            dateTo:   filters.dateTo,
            branchId: isSuperAdmin
                ? (selectedBranchId || undefined)
                : (user?.branchId != null ? String(user.branchId) : undefined),
        };
    }, [filters, selectedBranchId, isSuperAdmin, user?.branchId]);

    const isAllEnabled = generated && !!queryParams && activeTab === 'all';
    const isByBranchEnabled =
        generated &&
        !!queryParams &&
        activeTab === 'per-branch' &&
        isSuperAdmin &&
        !selectedBranchId;

    const { data: cards,     isLoading: cardsLoading  } = useProfitLossCards(queryParams ?? {}, isAllEnabled);
    const { data: chartResp, isLoading: chartLoading  } = useProfitLossChart(queryParams ?? {}, isAllEnabled);
    const { data: tableResp, isLoading: tableLoading  } = useProfitLossTable(queryParams ?? {}, isAllEnabled);
    const { data: byBranch,  isLoading: bbLoading     } = useProfitLossByBranch(queryParams ?? {}, isByBranchEnabled);

    const isLoading = cardsLoading || chartLoading || tableLoading;

    const handleGenerate = useCallback((f: ProfitLossFiltersShape) => {
        setFilters(f);
        setGenerated(true);
    }, []);

    const handleBranchChange = useCallback((newBranchId: string) => {
        setSelectedBranchId(newBranchId);
        if (newBranchId !== '') setActiveTab('all');
    }, []);

    const handleExport = useCallback(
        async (type: 'csv' | 'pdf') => {
            if (!queryParams) return;
            setExporting(type);
            try {
                const blob = type === 'csv'
                    ? await exportProfitLossCSV(queryParams)
                    : await exportProfitLossPDF(queryParams);
                downloadBlob(blob, `profit-loss-${queryParams.dateFrom ?? 'all'}.${type}`);
            } catch (err) {
                console.error('[ProfitLossPage] Export failed:', err);
            } finally {
                setExporting(null);
            }
        },
        [queryParams],
    );

    const headerBranchLabel = useMemo(() => {
        if (isSuperAdmin) return null;
        if (user?.branchId) {
            const branch = branchesRaw.find(b => b.branchId === user.branchId);
            return branch?.name ?? `Branch ${user.branchId}`;
        }
        return null;
    }, [isSuperAdmin, user?.branchId, branchesRaw]);

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30
                            shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
                            Profit &amp; Loss Summary
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                            Complete financial overview with P&L breakdown
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
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

                        {!isSuperAdmin && headerBranchLabel && (
                            <div className="bg-blue-600 text-white text-[13px] font-semibold
                                            px-5 py-2.5 rounded-xl whitespace-nowrap">
                                {headerBranchLabel}
                            </div>
                        )}

                        <button
                            className="p-2.5 text-gray-400 hover:text-gray-600
                                       hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Page Body ────────────────────────────────────────────────── */}
            <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">

                <ProfitLossFilters onGenerate={handleGenerate} isLoading={isLoading} />

                {/* Tabs — SUPER_ADMIN + All Branches only */}
                {isSuperAdmin && generated && !selectedBranchId && (
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

                {/* Empty state */}
                {!generated && (
                    <div className="flex flex-col items-center justify-center py-36 gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                                        shadow-sm flex items-center justify-center">
                            <BarChart3 className="h-9 w-9 text-gray-200" />
                        </div>
                        <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                            Set your date range above and click <strong>Generate</strong> to
                            load the Profit &amp; Loss report.
                        </p>
                    </div>
                )}

                {/* ── All Branches Tab ──────────────────────────────────────── */}
                {generated && activeTab === 'all' && (
                    <div className="space-y-5">
                        <KpiCardsSection cards={cards} isLoading={cardsLoading} />

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-[13px] font-bold text-gray-800 mb-0.5">
                                Live Sales Counter
                            </p>
                            <p className="text-[11px] text-gray-400 mb-4">Sales amount by Day</p>
                            <PLBarChart chartResp={chartResp} isLoading={chartLoading} />
                        </div>

                        <PLTable
                            tableResp={tableResp}
                            isLoading={tableLoading}
                            title={
                                selectedBranchId
                                    ? `Profit & Loss Statement (${
                                        branchesRaw.find(b => String(b.branchId) === selectedBranchId)?.name
                                        ?? 'Branch'
                                    })`
                                    : 'Profit & Loss Statement (All Branches)'
                            }
                            onExportCsv={() => handleExport('csv')}
                            onExportPdf={() => handleExport('pdf')}
                            exporting={exporting}
                        />
                    </div>
                )}

                {/* ── Per Branch Tab ────────────────────────────────────────── */}
                {generated && activeTab === 'per-branch' && isSuperAdmin && (
                    <div>
                        {bbLoading ? (
                            // Skeleton that mirrors the real per-branch block shape
                            <div className="space-y-10">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-6 w-36 rounded-full" />
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[...Array(4)].map((_, j) => (
                                                <Skeleton key={j} className="h-28 rounded-2xl" />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 max-w-2xl">
                                            {[...Array(3)].map((_, j) => (
                                                <Skeleton key={j} className="h-24 rounded-2xl" />
                                            ))}
                                        </div>
                                        <Skeleton className="h-64 rounded-2xl" />
                                        <Skeleton className="h-48 rounded-2xl" />
                                    </div>
                                ))}
                            </div>
                        ) : (byBranch?.branches?.length ?? 0) > 0 ? (
                            <PerBranchSection
                                entries={byBranch!.branches}
                                branches={branchesRaw}
                                baseParams={queryParams ?? {}}
                            />
                        ) : (
                            <div className="py-12 text-center text-[13px] text-gray-400">
                                No branch data found for the selected period
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}