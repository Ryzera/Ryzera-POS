'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent as PercentIcon,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

import { useAuthStore } from "@/store/auth.store";
import { NotificationsDropdown } from '@/views/dashboard/components/NotificationsDropdown';
import {
  useProfitLossCards,
  useProfitLossChart,
  useProfitLossTable,
  useProfitLossByBranch,
} from '@/hooks/useProfitLoss';
import { useBranches } from '@/hooks/useSalesReport';
import { ProfitLossFilters } from '@/components/ProfitLossFilters';
import { exportProfitLossCSV, exportProfitLossPDF, downloadBlob } from '@/api/profit-loss.api';
import {
  PL_DEFAULT_DATE_FROM,
  PL_DEFAULT_DATE_TO,
} from '@/constants/profit-loss.constants';
import type {
  ProfitLossCards,
  ProfitLossChartResponse,
  ProfitLossTableResponse,
  ProfitLossByBranchResponse,
  ProfitLossQueryParams,
  ProfitLossBranchEntry,
} from '@/types/profit-loss.types';

const formatCurrency = (n: number) =>
  `Rs ${new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0)}`;

const formatPercent = (n: number) =>
  `${(n ?? 0).toFixed(1)}%`;

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

// ─── Top KPI Cards ────────────────────────────────────────────────────────────
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-tight">
          {label}
        </p>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-[24px] font-bold text-gray-900 tracking-tight leading-none mt-3">
        {value}
      </p>
      {sub && (
        <p className={`text-[11px] font-semibold mt-1 ${subColor || 'text-gray-400'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
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
    label: d.date?.slice(5) || d.date,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[13px] text-gray-400">
        No chart data available
      </div>
    );
  }

  const chartHeight = compact ? 200 : 260;
  const needsScroll = chartData.length > 10;
  const minWidth = needsScroll ? `${chartData.length * 64}px` : '100%';

  return (
    <div className="overflow-x-auto w-full">
      <div style={{ width: minWidth, minWidth: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            barCategoryGap={chartData.length <= 4 ? "40%" : "20%"}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={56}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                String(name).charAt(0).toUpperCase() + String(name).slice(1),
              ]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={36} />
            <Bar dataKey="cost"    fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={36} />
            <Bar dataKey="profit"  fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Profit & Loss Page ──────────────────────────────────────────────────
export default function ProfitLossPage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

  // FIX: Pre-fill default dates so initial fetch succeeds without 400 Bad Request
  const [filters, setFilters] = useState({
    dateFrom: PL_DEFAULT_DATE_FROM,
    dateTo:   PL_DEFAULT_DATE_TO,
  });
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'per-branch'>('all');
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const { data: branches = [] } = useBranches();

  // Branch manager static pill label
  const headerBranchLabel = useMemo(() => {
    if (isAdmin) return null;
    if (user?.branch_id) {
      const branch = branches.find(
        (b) => String(b.branchId) === String(user.branch_id),
      );
      return branch?.name ?? `Branch ${user.branch_id}`;
    }
    return null;
  }, [isAdmin, user?.branch_id, branches]);

  const queryParams: ProfitLossQueryParams = useMemo(() => {
    return {
      dateFrom: filters.dateFrom,
      dateTo:   filters.dateTo,
      branchId: isAdmin
        ? (selectedBranchId !== '' ? Number(selectedBranchId) : undefined)
        : (user?.branch_id ?? undefined),
    };
  }, [filters, selectedBranchId, isAdmin, user?.branch_id]);

  const isEnabled = Boolean(queryParams.dateFrom && queryParams.dateTo);

  const cardsQuery = useProfitLossCards(queryParams, isEnabled && activeTab === 'all');
  const chartQuery = useProfitLossChart(queryParams, isEnabled && activeTab === 'all');
  const tableQuery = useProfitLossTable(queryParams, isEnabled && activeTab === 'all');
  const byBranchQuery = useProfitLossByBranch(
    queryParams,
    isEnabled && isAdmin && activeTab === 'per-branch',
  );

  // FIX: Reset tab to 'all' if a specific branch is picked
  const handleBranchChange = useCallback((newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    if (newBranchId !== '') {
      setActiveTab('all');
    }
  }, []);

  const handleExport = async (formatType: 'csv' | 'pdf') => {
    setExporting(formatType);
    try {
      const blob = formatType === 'csv'
        ? await exportProfitLossCSV(queryParams)
        : await exportProfitLossPDF(queryParams);
      const ext = formatType === 'csv' ? 'csv' : 'pdf';
      downloadBlob(blob, `profit-loss-${filters.dateFrom || 'all'}.${ext}`);
    } catch (e) {
      console.error('P&L Export failed:', e);
    } finally {
      setExporting(null);
    }
  };

  const cards = cardsQuery.data;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Profit &amp; Loss Summary
            </h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Complete financial overview with P&amp;L breakdown
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Super Admin — Branch Dropdown */}
            {isAdmin && (
              <div className="relative">
                <select
                  value={selectedBranchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="appearance-none bg-blue-600 text-white text-[13px] font-semibold pl-4 pr-9 py-2.5 rounded-xl cursor-pointer"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.branchId} value={String(b.branchId)}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
              </div>
            )}

            {/* Branch Manager — Static Branch Pill */}
            {!isAdmin && headerBranchLabel && (
              <div className="bg-blue-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap">
                {headerBranchLabel}
              </div>
            )}

            <NotificationsDropdown
              branchId={isAdmin ? undefined : (user?.branch_id ?? undefined)}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 py-6 space-y-5">
        <ProfitLossFilters
          onGenerate={setFilters}
          isLoading={cardsQuery.isFetching}
        />

        {/* All Branches / Per Branch tabs — Super Admin only */}
        {isAdmin && selectedBranchId === "" && filters.dateFrom && (
          <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 w-fit shadow-sm">
            {(["all", "per-branch"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
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

        {/* ══ ALL BRANCHES TAB ════════════════════════════════════════ */}
        {activeTab === "all" && (
          <>
            {/* KPI Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {cardsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))
              ) : (
                <>
                  <KpiCard
                    label="Total Sales"
                    value={formatCurrency(cards?.totalSales ?? 0)}
                    icon={<DollarSign className="h-5 w-5 text-blue-500" />}
                    accent="bg-blue-50"
                  />
                  <KpiCard
                    label="Cost of Goods Sold"
                    value={formatCurrency(cards?.costOfGoodsSold ?? 0)}
                    icon={<TrendingDown className="h-5 w-5 text-orange-500" />}
                    accent="bg-orange-50"
                  />
                  <KpiCard
                    label="Gross Profit"
                    value={formatCurrency(cards?.grossProfit ?? 0)}
                    icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
                    accent="bg-emerald-50"
                  />
                  <KpiCard
                    label="Net Profit"
                    value={formatCurrency(cards?.netProfit ?? 0)}
                    sub={`Margin ${formatPercent(cards?.profitMargin ?? 0)}`}
                    subColor={
                      cards?.profitMargin && cards.profitMargin >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }
                    icon={<PercentIcon className="h-5 w-5 text-violet-500" />}
                    accent="bg-violet-50"
                  />
                </>
              )}
            </div>

            {/* Sub KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <KpiCard
                label="Total Tax"
                value={formatCurrency(cards?.totalTax ?? 0)}
                icon={<DollarSign className="h-4 w-4 text-gray-500" />}
                accent="bg-gray-50"
              />
              <KpiCard
                label="Total Discounts"
                value={formatCurrency(cards?.totalDiscounts ?? 0)}
                icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                accent="bg-amber-50"
              />
              <KpiCard
                label="Total Returns"
                value={formatCurrency(cards?.totalReturns ?? 0)}
                icon={<DollarSign className="h-4 w-4 text-red-500" />}
                accent="bg-red-50"
              />
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-[14px] font-bold text-gray-800">
                  Live Sales Counter
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Sales amount by Day
                </p>
              </div>
              <PLBarChart
                chartResp={chartQuery.data}
                isLoading={chartQuery.isLoading}
              />
            </div>

            {/* P&L Statement Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800">
                    Profit &amp; Loss Statement
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Detailed P&amp;L breakdown by date
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport("csv")}
                    disabled={exporting !== null}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={exporting !== null}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    PDF
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-gray-50 text-gray-400 text-[10.5px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                    <th className="px-6 py-3 text-right">COGS</th>
                    <th className="px-6 py-3 text-right">Gross Profit</th>
                    <th className="px-6 py-3 text-right">Tax</th>
                    <th className="px-6 py-3 text-right">Margin</th>
                    <th className="px-6 py-3 text-right">Net Profit</th>
                    <th className="px-6 py-3 text-right">Returns</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                  {tableQuery.isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-6 py-3.5">
                            <Skeleton className="h-4 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : !tableQuery.data?.data?.length ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No statement data found for this period
                      </td>
                    </tr>
                  ) : (
                    tableQuery.data.data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-semibold text-gray-800">
                          {row.date}
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-gray-700">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-gray-700">
                          {formatCurrency(row.cogs)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                          {formatCurrency(row.grossProfit)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-500">
                          {formatCurrency(row.tax)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">
                          {row.margin.toFixed(1)}%
                        </td>
                        <td
                          className={`px-6 py-3.5 text-right font-bold ${row.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {formatCurrency(row.netProfit)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-500">
                          {formatCurrency(row.returns)}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ PER BRANCH TAB ══════════════════════════════════════════ */}
        {activeTab === "per-branch" && isAdmin && (
          <div className="space-y-8">
            {byBranchQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-56" />
                ))}
              </div>
            ) : (byBranchQuery.data?.branches ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                No branch P&amp;L data found for this period.
              </div>
            ) : (
              <>
                {/* Per-Branch Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {byBranchQuery.data?.branches.map((b, idx) => {
                    const branchName =
                      branches.find((br) => br.branchId === b.branch.id)
                        ?.name ?? `Branch ${b.branch.id ?? idx + 1}`;
                    return (
                      <div
                        key={b.branch.id ?? idx}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900 text-[14px]">
                            {branchName}
                          </h4>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            Branch {idx + 1}
                          </span>
                        </div>
                        <div className="space-y-2 text-[12px]">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Revenue</span>
                            <span className="font-semibold text-gray-800">
                              {formatCurrency(b.kpi.totalSales)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Gross Profit</span>
                            <span className="font-semibold text-emerald-600">
                              {formatCurrency(b.kpi.grossProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Net Profit</span>
                            <span
                              className={`font-semibold ${b.kpi.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {formatCurrency(b.kpi.netProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Margin</span>
                            <span className="font-semibold text-gray-700">
                              {formatPercent(b.kpi.profitMargin)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Per-Branch Charts & Breakdown */}
                <div className="space-y-10">
                  {byBranchQuery.data?.branches.map((b, idx) => {
                    const branchName =
                      branches.find((br) => br.branchId === b.branch.id)
                        ?.name ?? `Branch ${b.branch.id ?? idx + 1}`;
                    return (
                      <div key={b.branch.id ?? idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0" />
                          <h3 className="text-[15px] font-bold text-gray-900">
                            {branchName}
                          </h3>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <h4 className="text-[13px] font-bold text-gray-800 mb-2">
                            Sales &amp; Profit Trend
                          </h4>
                          <PLBarChart
                            chartResp={b.chart}
                            isLoading={false}
                            compact
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}