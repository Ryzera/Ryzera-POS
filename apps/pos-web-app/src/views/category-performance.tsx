'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Tag,
  PieChart as PieChartIcon,
  ChevronDown,
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
import { ProfitLossFilters } from "@/components/ProfitLossFilters";
import { useAuthStore } from "@/store/auth.store";
import { NotificationsDropdown } from '@/views/dashboard/components/NotificationsDropdown';
import {
  useCategoryKpi,
  useCategoryBarChart,
  useCategoryPieChart,
  useCategoryTable,
  useCategoryByBranch,
  useCategoryBranches,
} from "@/hooks/useCategoryPerformance";
import {
  exportCategoryCSV,
  exportCategoryPDF,
  downloadBlob,
} from '@/api/category-performance.api';
import {
  CAT_DEFAULT_DATE_FROM,
  CAT_DEFAULT_DATE_TO,
} from '@/constants/category-performance.constants';
import type {
  RevenueBarResponse,
  ProfitPieResponse,
  CategoryPerformanceQueryParams,
} from "@/types/category-performance.types";

const formatCurrency = (n: number) =>
  `Rs ${new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0)}`;

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
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

  const needsScroll = data.length > 8;
  const minWidth = needsScroll ? `${data.length * 64}px` : '100%';

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ width: minWidth, minWidth: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
            barCategoryGap={data.length <= 4 ? "40%" : "20%"}
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
              formatter={(val) => [formatCurrency(Number(val ?? 0)), 'Revenue']}
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
              fill="#3b82f6"
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
function CategoryProfitPieChart({ resp }: { resp?: ProfitPieResponse }) {
  const data = resp?.data ?? [];
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-300 h-64">
        <PieChartIcon className="h-10 w-10 text-gray-200" />
        <p className="text-sm text-gray-400 font-medium">No profit data</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="profit"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={82}
            paddingAngle={3}
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [formatCurrency(Number(val ?? 0)), String(name)]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              padding: '8px 14px',
              backgroundColor: '#ffffff',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Category Performance Page ───────────────────────────────────────────
export default function CategoryPerformancePage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

  // FIX: Pre-fill default dates on initial load
  const [dateFrom, setDateFrom] = useState(CAT_DEFAULT_DATE_FROM);
  const [dateTo, setDateTo] = useState(CAT_DEFAULT_DATE_TO);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'per-branch'>('all');
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const { data: branches = [] } = useCategoryBranches();

  // Branch Name Label for Branch Managers
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

  const queryParams: CategoryPerformanceQueryParams = useMemo(() => {
    return {
      dateFrom: dateFrom || undefined,
      dateTo:   dateTo   || undefined,
      branchId: isAdmin
        ? (selectedBranchId !== '' ? Number(selectedBranchId) : undefined)
        : (user?.branch_id ?? undefined),
    };
  }, [dateFrom, dateTo, selectedBranchId, isAdmin, user?.branch_id]);

  const isEnabled = Boolean(queryParams.dateFrom && queryParams.dateTo);

  const cardsQuery    = useCategoryKpi(queryParams, isEnabled && activeTab === 'all');
  const barQuery      = useCategoryBarChart(queryParams, isEnabled && activeTab === 'all');
  const pieQuery      = useCategoryPieChart(queryParams, isEnabled && activeTab === 'all');
  const tableQuery    = useCategoryTable(queryParams, isEnabled && activeTab === 'all');
  const byBranchQuery = useCategoryByBranch(
    queryParams,
    isEnabled && isAdmin && activeTab === 'per-branch',
  );

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
        ? await exportCategoryCSV(queryParams)
        : await exportCategoryPDF(queryParams);
      const ext = formatType === 'csv' ? 'csv' : 'pdf';
      downloadBlob(blob, `category-performance-${dateFrom || 'all'}.${ext}`);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(null);
    }
  };

  const tableData = tableQuery.data?.data ?? [];
  const totalRevenue = tableData.reduce((s, r) => s + r.revenue, 0);
  const totalProfit = tableData.reduce((s, r) => s + r.profit, 0);
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const topCategory = cardsQuery.data?.topCategories?.[0]?.category ?? tableData[0]?.category ?? 'N/A';
  const activeCategoriesCount = tableData.length;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-30 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Category Performance
            </h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Sales and margin analytics by category
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* SUPER ADMIN — Branch Dropdown */}
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

            {/* BRANCH MANAGER — Branch Name Pill */}
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
        {/* Filter bar */}
        <ProfitLossFilters
          onGenerate={({ dateFrom: df, dateTo: dt }) => {
            setDateFrom(df);
            setDateTo(dt);
          }}
          isLoading={tableQuery.isLoading || cardsQuery.isLoading}
        />

        {/* All Branches / Per Branch tabs — Super Admin only */}
        {isAdmin && selectedBranchId === "" && dateFrom && (
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
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {tableQuery.isLoading || cardsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      Total Revenue
                    </p>
                    <p className="text-[24px] font-bold text-gray-900 mt-3">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      Top Category
                    </p>
                    <p className="text-[24px] font-bold text-gray-900 mt-3">
                      {topCategory}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      Avg Margin
                    </p>
                    <p className="text-[24px] font-bold text-emerald-600 mt-3">
                      {averageMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      Categories
                    </p>
                    <p className="text-[24px] font-bold text-gray-900 mt-3">
                      {activeCategoriesCount}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 mb-1">
                  Revenue by Category
                </h3>
                <p className="text-[11px] text-gray-400 mb-4">
                  Total sales generated per category
                </p>
                <CategoryBarChart resp={barQuery.data} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 mb-1">
                  Profit Distribution
                </h3>
                <p className="text-[11px] text-gray-400 mb-4">
                  Profit share by category
                </p>
                <CategoryProfitPieChart resp={pieQuery.data} />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800">
                    Category Breakdown
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Detailed metrics per category
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
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Items Sold</th>
                    <th className="px-6 py-3 text-right">Revenue</th>
                    <th className="px-6 py-3 text-right">COGS</th>
                    <th className="px-6 py-3 text-right">Gross Profit</th>
                    <th className="px-6 py-3 text-right">Margin</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                  {tableQuery.isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-6 py-3.5">
                            <Skeleton className="h-4 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : !tableData.length ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No category data found for this period
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr
                        key={`${row.category}-${idx}`}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-semibold text-gray-800">
                          {row.category}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-600">
                          {row.totalSold}
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-gray-800">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-500">
                          {formatCurrency(row.cost)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                          {formatCurrency(row.profit)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">
                          {row.margin.toFixed(1)}%
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
                No branch category data found for this period.
              </div>
            ) : (
              <div className="space-y-8">
                {byBranchQuery.data?.branches.map((b, idx) => {
                  const branchName = b.branch?.name ?? `Branch ${b.branch?.id ?? idx + 1}`;
                  const branchRows = b.data ?? [];
                  const branchRevenue = branchRows.reduce((s, r) => s + r.revenue, 0);

                  return (
                    <div
                      key={b.branch?.id ?? idx}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0" />
                          <h3 className="text-[16px] font-bold text-gray-900">
                            {branchName}
                          </h3>
                        </div>
                        <span className="text-[12px] font-semibold text-gray-600">
                          Total Revenue: <span className="text-gray-900 font-bold">{formatCurrency(branchRevenue)}</span>
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12.5px]">
                          <thead className="bg-gray-50 text-gray-400 text-[10.5px] font-bold uppercase tracking-wider border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3 text-right">Items Sold</th>
                            <th className="px-6 py-3 text-right">Revenue</th>
                            <th className="px-6 py-3 text-right">COGS</th>
                            <th className="px-6 py-3 text-right">Gross Profit</th>
                            <th className="px-6 py-3 text-right">Margin</th>
                          </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                          {branchRows.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                No category sales recorded for this branch.
                              </td>
                            </tr>
                          ) : (
                            branchRows.map((row, rIdx) => (
                              <tr key={`${row.category}-${rIdx}`} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-6 py-3.5 font-semibold text-gray-800">
                                  {row.category}
                                </td>
                                <td className="px-6 py-3.5 text-right text-gray-600">
                                  {row.totalSold}
                                </td>
                                <td className="px-6 py-3.5 text-right font-medium text-gray-800">
                                  {formatCurrency(row.revenue)}
                                </td>
                                <td className="px-6 py-3.5 text-right text-gray-500">
                                  {formatCurrency(row.cost)}
                                </td>
                                <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                                  {formatCurrency(row.profit)}
                                </td>
                                <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">
                                  {row.margin.toFixed(1)}%
                                </td>
                              </tr>
                            ))
                          )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}