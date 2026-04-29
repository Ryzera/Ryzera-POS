'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    Package,
    Box,
    TrendingDown,
    XCircle,
    PercentIcon,
    ChevronDown,
    Bell,
    RefreshCw,
    FileText,
    FileSpreadsheet,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useAuth }                                       from '@/context/AuthContext';
import { useInventoryStatus, useInventoryByBranch }      from '@/hooks/useInventoryStatus';
import { useCategories, useBranches }                    from '@/hooks/useSalesReport';
import {
    exportInventoryCSV,
    exportInventoryPDF,
    exportInventoryBranchCSV,
    exportInventoryBranchPDF,
    downloadBlob,
}                                                        from '@/api/inventory-status.api';
import {
    ALL_CATEGORIES_INV_VALUE,
    ALL_STOCK_STATUS_VALUE,
    STOCK_STATUS_CONFIG,
    STOCK_STATUS_OPTIONS,
    INVENTORY_KPI_CONFIG,
}                                                        from '@/constants/inventory-status.constants';
import type {
    InventoryStatusQueryParams,
    InventoryKpi,
    InventoryDetailRow,
    InventoryBranchEntry,
}                                                        from '@/types/inventory-status.types';

// ─── Local types ──────────────────────────────────────────────────────────────

type ActiveTab   = 'all' | 'per-branch';
type ExportType  = 'csv' | 'pdf' | null;
type StockStatus = 'InStock' | 'LowStock' | 'OutOfStock';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a number as Sri Lankan Rupees (e.g. "Rs 1,234.56"). */
const formatCurrency = (n: number): string =>
    `Rs ${new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n ?? 0)}`;

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-100 to-gray-50
                        rounded-xl ${className}`}
        />
    );
}

// ─── Stock Status Badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cfg = STOCK_STATUS_CONFIG[status] ?? {
        label:      status,
        badgeClass: 'bg-gray-100 text-gray-600',
    };
    return (
        <span
            className={`inline-flex items-center justify-center px-3 py-1
                        rounded-lg text-[11px] font-semibold whitespace-nowrap
                        ${cfg.badgeClass}`}
        >
            {cfg.label}
        </span>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    label:     string;
    value:     string;
    icon:      React.ElementType;
    iconBg:    string;
    iconColor: string;
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: KpiCardProps) {
    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 px-6 py-5 shadow-sm
                       hover:shadow-md transition-shadow duration-200 min-w-0 flex flex-col gap-3"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-tight">
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

// ─── KPI Card Row ─────────────────────────────────────────────────────────────

interface KpiCardsProps {
    kpi:       InventoryKpi | null | undefined;
    isLoading: boolean;
}

function KpiCards({ kpi, isLoading }: KpiCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-36" />
                ))}
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <KpiCard label="Total Products"       value={String(kpi?.totalProducts ?? 0)}              icon={Box}         {...INVENTORY_KPI_CONFIG.totalProducts} />
            <KpiCard label="In Stock"             value={String(kpi?.inStock ?? 0)}                    icon={Package}     {...INVENTORY_KPI_CONFIG.inStock} />
            <KpiCard label="Low Stock"            value={String(kpi?.lowStock ?? 0)}                   icon={TrendingDown} {...INVENTORY_KPI_CONFIG.lowStock} />
            <KpiCard label="Out of Stock"         value={String(kpi?.outOfStock ?? 0)}                 icon={XCircle}     {...INVENTORY_KPI_CONFIG.outOfStock} />
            <KpiCard label="Total Inventory Value" value={formatCurrency(kpi?.totalInventoryValue ?? 0)} icon={PercentIcon} {...INVENTORY_KPI_CONFIG.value} />
        </div>
    );
}

// ─── Inventory Detail Table ───────────────────────────────────────────────────

interface InventoryTableProps {
    rows:             InventoryDetailRow[];
    isLoading:        boolean;
    /** Show a "Branch" column on the right (all-branches aggregated view). */
    showBranchColumn: boolean;
    onExportCsv:      () => void;
    onExportPdf:      () => void;
    exporting:        ExportType;
    title?:           string;
}

function InventoryTable({
                            rows,
                            isLoading,
                            showBranchColumn,
                            onExportCsv,
                            onExportPdf,
                            exporting,
                            title,
                        }: InventoryTableProps) {
    const baseColumns = [
        'Product Name', 'Category', 'Supplier',
        'Current Stock', 'Reorder Level', 'Current Status',
        'Cost Value', 'Selling Value',
    ] as const;

    const columns = showBranchColumn ? [...baseColumns, 'Branch'] : baseColumns;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-[14px] font-bold text-gray-800">
                        {title ?? 'Inventory Details'}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Complete inventory status and values
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onExportCsv}
                        disabled={!!exporting}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px]
                                   font-semibold border border-gray-200 bg-white text-gray-600
                                   hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        {exporting === 'csv' ? 'Exporting…' : 'CSV'}
                    </button>
                    <button
                        onClick={onExportPdf}
                        disabled={!!exporting}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px]
                                   font-semibold border border-gray-200 bg-white text-gray-600
                                   hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Package className="h-10 w-10 text-gray-200" />
                    <p className="text-[13px] text-gray-400 font-medium">
                        No inventory records found
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            {columns.map(h => (
                                <th
                                    key={h}
                                    className="px-5 py-3 text-[11px] font-semibold text-gray-400
                                                   uppercase tracking-wider text-left"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => (
                            <tr
                                key={`${row.productName}-${row.branch ?? i}`}
                                className={`transition-colors hover:bg-blue-50/30 ${
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                }`}
                            >
                                <td className="px-5 py-3.5">
                                        <span className="text-[12px] font-semibold text-gray-800">
                                            {row.productName}
                                        </span>
                                </td>
                                <td className="px-5 py-3.5 text-[12px] text-gray-600">{row.category}</td>
                                <td className="px-5 py-3.5 text-[12px] text-gray-600">{row.supplier}</td>
                                <td className="px-5 py-3.5 text-[12px] text-gray-700 font-medium">{row.currentStock}</td>
                                <td className="px-5 py-3.5 text-[12px] text-gray-500">{row.reorderLevel}</td>
                                <td className="px-5 py-3.5">
                                    <StatusBadge status={row.currentStatus} />
                                </td>
                                <td className="px-5 py-3.5 text-[12px] text-gray-700 tabular-nums">
                                    {formatCurrency(row.costValue)}
                                </td>
                                <td className="px-5 py-3.5 text-[12px] text-gray-700 tabular-nums">
                                    {formatCurrency(row.sellingValue)}
                                </td>
                                {showBranchColumn && (
                                    <td className="px-5 py-3.5 text-[12px] text-gray-500">
                                        {row.branch ?? '—'}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Per-Branch Summary Card ──────────────────────────────────────────────────

const BRANCH_BADGE_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
] as const;

interface BranchInventoryCardProps {
    entry: InventoryBranchEntry;
    index: number;
}

function BranchInventoryCard({ entry, index }: BranchInventoryCardProps) {
    const { kpi, branch } = entry;
    const badgeColor      = BRANCH_BADGE_COLORS[index % BRANCH_BADGE_COLORS.length];

    const statRows = [
        { label: 'Total Products',  value: String(kpi.totalProducts),               color: '' },
        { label: 'In Stock',        value: String(kpi.inStock),                      color: 'text-emerald-600' },
        { label: 'Low Stock',       value: String(kpi.lowStock),                     color: 'text-amber-600' },
        { label: 'Out of Stock',    value: String(kpi.outOfStock),                   color: 'text-red-600' },
        { label: 'Inventory Value', value: formatCurrency(kpi.totalInventoryValue),  color: '' },
    ] as const;

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                       hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-[14px] font-bold text-gray-900">{branch.name}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                    Stock Status
                </span>
            </div>
            <div className="space-y-3">
                {statRows.map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500">{row.label}</span>
                        <span className={`text-[12px] font-semibold ${row.color || 'text-gray-900'}`}>
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Per-Branch Section ───────────────────────────────────────────────────────
//
// Each branch renders its own section with its own isolated export handler.
// The handler calls /export/branch/csv|pdf with the branch's InvBranch UUID,
// guaranteeing the export matches exactly what the table shows for that branch.
// This is the same pattern the sales report uses in PerBranchSection.

interface PerBranchSectionProps {
    entry:       InventoryBranchEntry;
    baseParams:  InventoryStatusQueryParams;
    sectionIndex: number;
}

function PerBranchSection({ entry, baseParams, sectionIndex }: PerBranchSectionProps) {
    const [exporting, setExporting] = useState<ExportType>(null);

    // Build export params for this specific branch using its InvBranch UUID.
    const exportParams = useMemo(
        () => ({ ...baseParams, invBranchId: entry.branch.id }),
        [baseParams, entry.branch.id],
    );

    const handleExport = useCallback(
        async (type: 'csv' | 'pdf') => {
            setExporting(type);
            try {
                const blob =
                    type === 'csv'
                        ? await exportInventoryBranchCSV(exportParams)
                        : await exportInventoryBranchPDF(exportParams);
                downloadBlob(
                    blob,
                    `inventory-${entry.branch.name.replace(/\s+/g, '-')}.${type}`,
                );
            } catch (err) {
                console.error(`[PerBranchSection] Export ${type} failed:`, err);
            } finally {
                setExporting(null);
            }
        },
        [exportParams, entry.branch.name],
    );

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full flex-shrink-0" />
                <h3 className="text-[14px] font-bold text-gray-900">{entry.branch.name}</h3>
            </div>
            <InventoryTable
                rows={entry.inventoryDetails}
                isLoading={false}
                showBranchColumn={false}
                onExportCsv={() => handleExport('csv')}
                onExportPdf={() => handleExport('pdf')}
                exporting={exporting}
                title={`Inventory Details — ${entry.branch.name}`}
            />
        </div>
    );
}

// ─── Per-Branch Tab Content ───────────────────────────────────────────────────

interface PerBranchTabProps {
    byBranchData: { branches: InventoryBranchEntry[] } | undefined;
    byBrLoading:  boolean;
    baseParams:   InventoryStatusQueryParams;
}

function PerBranchTab({ byBranchData, byBrLoading, baseParams }: PerBranchTabProps) {
    const branches = byBranchData?.branches ?? [];

    if (byBrLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                ))}
            </div>
        );
    }

    if (branches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-36 gap-5">
                <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100
                               shadow-sm flex items-center justify-center">
                    <Package className="h-9 w-9 text-gray-200" />
                </div>
                <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                    No branch inventory data found for the selected filters.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Branch KPI summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map((entry, idx) => (
                    <BranchInventoryCard key={entry.branch.id} entry={entry} index={idx} />
                ))}
            </div>

            {/* Per-branch detail tables — each with its own isolated export handler */}
            <div className="space-y-6">
                {branches.map((entry, idx) => (
                    <PerBranchSection
                        key={entry.branch.id}
                        entry={entry}
                        baseParams={baseParams}
                        sectionIndex={idx}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryStatusPage() {
    const { user, isSuperAdmin } = useAuth();

    // ── Filter state ──────────────────────────────────────────────────────────
    const [selectedCategory,    setSelectedCategory]    = useState<string>(ALL_CATEGORIES_INV_VALUE);
    const [selectedStockStatus, setSelectedStockStatus] = useState<string>(ALL_STOCK_STATUS_VALUE);
    const [selectedBranchId,    setSelectedBranchId]    = useState<string>('');
    const [activeTab,           setActiveTab]           = useState<ActiveTab>('all');
    const [generated,           setGenerated]           = useState<boolean>(false);
    const [exporting,           setExporting]           = useState<ExportType>(null);

    // ── Reference data ────────────────────────────────────────────────────────
    const { data: categories  = [] } = useCategories();
    const { data: branchesRaw = [] } = useBranches();

    // ── Query params ──────────────────────────────────────────────────────────
    //
    // Sentinel values are stripped here so every downstream consumer receives
    // clean data. `hasCategory` is derived from this memo and drives all
    // enable-guards.

    const queryParams = useMemo((): InventoryStatusQueryParams => {
        const effectiveBranchId = isSuperAdmin
            ? (selectedBranchId || undefined)
            : (user?.branchId != null ? String(user.branchId) : undefined);

        return {
            category:    selectedCategory !== ALL_CATEGORIES_INV_VALUE
                ? selectedCategory
                : undefined,
            stockStatus: selectedStockStatus !== ALL_STOCK_STATUS_VALUE
                ? (selectedStockStatus as StockStatus)
                : undefined,
            branchId: effectiveBranchId,
        };
    }, [selectedCategory, selectedStockStatus, selectedBranchId, isSuperAdmin, user?.branchId]);

    // ── Derived booleans ──────────────────────────────────────────────────────

    const hasCategory          = !!queryParams.category;
    const isViewingAllBranches = isSuperAdmin && !selectedBranchId;
    const showTabs             = isViewingAllBranches && generated && hasCategory;

    // ── Data hooks ────────────────────────────────────────────────────────────

    const isAllEnabled  = generated && hasCategory && activeTab === 'all';
    const isPerBEnabled = generated && hasCategory && activeTab === 'per-branch' && isSuperAdmin;

    const { data: invData,      isLoading: invLoading  } = useInventoryStatus(queryParams,  isAllEnabled);
    const { data: byBranchData, isLoading: byBrLoading } = useInventoryByBranch(queryParams, isPerBEnabled);

    // ── Header branch label (branch managers) ─────────────────────────────────

    const headerBranchLabel = useMemo((): string | null => {
        if (isSuperAdmin) return null;
        if (user?.branchId) {
            const branch = branchesRaw.find(b => b.branchId === user.branchId);
            return branch?.name ?? `Branch ${user.branchId}`;
        }
        return null;
    }, [isSuperAdmin, user?.branchId, branchesRaw]);

    // ── Event handlers ────────────────────────────────────────────────────────

    const handleGenerate = useCallback(() => {
        if (!selectedCategory || selectedCategory === ALL_CATEGORIES_INV_VALUE) return;
        setGenerated(true);
    }, [selectedCategory]);

    const handleBranchChange = useCallback((branchId: string) => {
        setSelectedBranchId(branchId);
        // Snap back to "all" when a specific branch is chosen so the per-branch
        // tab (which is hidden for single-branch mode) doesn't leave a blank screen.
        if (branchId !== '') setActiveTab('all');
    }, []);

    const handleReset = useCallback(() => {
        setSelectedCategory(ALL_CATEGORIES_INV_VALUE);
        setSelectedStockStatus(ALL_STOCK_STATUS_VALUE);
        setSelectedBranchId('');
        setGenerated(false);
        setActiveTab('all');
    }, []);

    // All Branches tab export — calls the standard aggregated export endpoint.
    const handleExport = useCallback(async (type: 'csv' | 'pdf') => {
        setExporting(type);
        try {
            const blob =
                type === 'csv'
                    ? await exportInventoryCSV(queryParams)
                    : await exportInventoryPDF(queryParams);
            downloadBlob(blob, `inventory-status.${type}`);
        } catch (err) {
            console.error('[InventoryStatusPage] Export failed:', err);
        } finally {
            setExporting(null);
        }
    }, [queryParams]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col">

            {/* Page Header */}
            <div
                className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0
                           z-30 shadow-[0_1px_6px_rgba(0,0,0,0.05)]"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                            Inventory Status Report
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
                            Monitor stock levels and inventory value
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Super admin: branch dropdown */}
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
                                <ChevronDown
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2
                                               h-4 w-4 text-white pointer-events-none"
                                />
                            </div>
                        )}

                        {/* Branch manager: static pill */}
                        {!isSuperAdmin && headerBranchLabel && (
                            <div
                                className="bg-blue-600 text-white text-[13px] font-semibold
                                           px-5 py-2.5 rounded-xl whitespace-nowrap"
                            >
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

            {/* Page Body */}
            <div className="flex-1 px-8 py-6 space-y-5">

                {/* Filter Bar */}
                <div
                    className="flex flex-wrap items-end gap-3 px-5 py-4 bg-white
                               rounded-2xl border border-gray-100 shadow-sm"
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                            Category
                        </label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-10 w-52 rounded-xl border-gray-200 text-[13px] bg-white">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl z-[200] border border-gray-100 shadow-xl bg-white">
                                <SelectItem value={ALL_CATEGORIES_INV_VALUE}>All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                            Stock Status
                        </label>
                        <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                            <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 text-[13px] bg-white">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl z-[200] border border-gray-100 shadow-xl bg-white">
                                <SelectItem value={ALL_STOCK_STATUS_VALUE}>All Status</SelectItem>
                                {STOCK_STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end gap-2 ml-auto">
                        <button
                            onClick={handleGenerate}
                            disabled={invLoading || !hasCategory}
                            className="h-10 px-7 bg-blue-600 hover:bg-blue-700 text-white
                                       font-semibold rounded-xl text-[13px] shadow-sm
                                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {invLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/40
                                                     border-t-white rounded-full animate-spin" />
                                    Loading…
                                </span>
                            ) : 'Generate'}
                        </button>
                        <button
                            onClick={handleReset}
                            title="Reset filters"
                            className="h-10 w-10 rounded-xl border border-gray-200 bg-white
                                       text-gray-400 hover:text-gray-600 hover:bg-gray-50
                                       flex items-center justify-center transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Tab Toggle — super admin, all-branches mode, after Generate */}
                {showTabs && (
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
                            <Package className="h-9 w-9 text-gray-200" />
                        </div>
                        <p className="text-[14px] text-gray-400 font-medium text-center max-w-xs">
                            Select a{' '}
                            <span className="text-blue-600 font-bold">Category</span> and click{' '}
                            <span className="text-blue-600 font-bold">Generate</span> to load the report.
                        </p>
                    </div>
                )}

                {/* All Branches tab */}
                {generated && activeTab === 'all' && (
                    <div className="space-y-5">
                        <KpiCards kpi={invData?.kpi} isLoading={invLoading} />
                        <InventoryTable
                            rows={invData?.inventoryDetails ?? []}
                            isLoading={invLoading}
                            showBranchColumn={isViewingAllBranches}
                            onExportCsv={() => handleExport('csv')}
                            onExportPdf={() => handleExport('pdf')}
                            exporting={exporting}
                        />
                    </div>
                )}

                {/* Per Branch tab (super admin only) */}
                {generated && activeTab === 'per-branch' && isSuperAdmin && (
                    <PerBranchTab
                        byBranchData={byBranchData}
                        byBrLoading={byBrLoading}
                        baseParams={queryParams}
                    />
                )}
            </div>
        </div>
    );
}