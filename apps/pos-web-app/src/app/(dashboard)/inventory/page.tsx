'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Plus, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api, { branchesApi, extractItem } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface StockItem {
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    branchName: string;
    branchId: string;
    quantity: number;
    minStock: number;
    unitPrice: number;
    status: 'active' | 'low_stock' | 'out_of_stock';
    product?: any;
    branch?: any;
}

interface Alert {
    id: string;
    productName: string;
    branchName: string;
    quantity: number;
    minStock: number;
    type: 'low_stock' | 'out_of_stock';
    createdAt: string;
    product?: any;
    branch?: any;
}

interface Log {
    id: string;
    action: string;
    details: string;
    description?: string;
    userName: string;
    createdAt: string;
    user?: { name: string };
}

interface ExpiringBatch {
    id: string;
    productName: string;
    branchName: string;
    batchNo: string;
    quantity: number;
    expiryDate: string;
    daysLeft: number;
}

// ── Helpers ──────────────────────────────────────────────────

function extractArray<T = any>(payload: any): T[] {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return [];
}

function getStockColor(qty: number, min: number): string {
    if (qty === 0) return '#ef4444';
    if (min <= 0) {
        return qty > 0 ? '#22c55e' : '#ef4444';
    }
    if (qty <= min) return '#ef4444';
    if (qty <= min * 1.5) return '#f97316';
    return '#22c55e';
}

function deriveStatus(qty: number, min: number): 'active' | 'low_stock' | 'out_of_stock' {
    if (qty === 0) return 'out_of_stock';
    if (min > 0 && qty <= min) return 'low_stock';
    return 'active';
}

function formatValue(v: number) {
    if (v >= 1_000_000) return `Rs. ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `Rs. ${(v / 1_000).toFixed(3)}K`;
    return `Rs. ${v.toLocaleString()}`;
}

function timeAgo(dateStr: string) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'just now';
}

function daysUntil(dateStr: string): number {
    if (!dateStr) return 9999;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / 86_400_000);
}

// ── Small presentational components ─────────────────────────

function StatCard({
                      label,
                      value,
                      sub,
                      subColor,
                      borderColor,
                  }: {
    label: string;
    value: string | number;
    sub: string;
    subColor: string;
    borderColor: string;
}) {
    return (
        <Card className={`border-l-4 ${borderColor} flex-1`}>
            <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1.5">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className={`text-xs mt-2 ${subColor}`}>{sub}</p>
            </CardContent>
        </Card>
    );
}

function StockBar({ qty, min }: { qty: number; min: number }) {
    const max = Math.max(min * 3, qty, 1);
    const pct = Math.min((qty / max) * 100, 100);
    const color = getStockColor(qty, min);
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-colors"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-sm text-gray-700">{qty}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variantMap: Record<string, 'success' | 'warning' | 'destructive'> = {
        active: 'success',
        low_stock: 'warning',
        out_of_stock: 'destructive',
    };
    const labels: Record<string, string> = {
        active: 'Active',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock',
    };
    return <Badge variant={variantMap[status] ?? 'default'}>{labels[status] ?? status}</Badge>;
}

// ── Main page ────────────────────────────────────────────────

export default function InventoryDashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const userBranchId = user?.branch_id;

    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [expiring, setExpiring] = useState<ExpiringBatch[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [activeTab, setActiveTab] = useState<'alerts' | 'expiring'>('alerts');
    const [loading, setLoading] = useState(true);
    const [branchName, setBranchName] = useState<string>('');

    useEffect(() => {
        if (!isAdmin && userBranchId) {
            branchesApi
                .getById(userBranchId)
                .then((res) => setBranchName(extractItem<any>(res.data)?.name ?? ''))
                .catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, userBranchId]);

    useEffect(() => {
        const scopeParams: any = {};
        if (!isAdmin && userBranchId) {
            scopeParams.branchId = userBranchId;
        }

        Promise.all([
            api.get('/inventory/branch-products', { params: scopeParams }),
            api.get('/inventory/alerts', { params: scopeParams }),
            api.get('/inventory/logs', { params: scopeParams }),
            api.get('/products'),
            api.get('/batches', { params: scopeParams }),
        ])
            .then(([stockRes, alertsRes, logsRes, productsRes, batchesRes]) => {
                const rawStock = extractArray<any>(stockRes.data);
                const normalizedStock: StockItem[] = rawStock.map((item: any) => {
                    const qty = Number(item.quantity ?? item.stockQty ?? item.stock_qty ?? 0);
                    const min = Number(
                        item.minStock ??
                        item.min_stock ??
                        item.product?.min_quantity ??
                        item.product?.minStock ??
                        item.product?.min_stock ??
                        0
                    );
                    const price = Number(
                        item.unitPrice ??
                        item.unit_price ??
                        item.product?.price ??
                        item.product?.sellingPrice ??
                        item.product?.cost_price ??
                        0
                    );

                    const productId = String(item.productId ?? item.product_id ?? item.product?.id ?? '');
                    const branchId = String(item.branchId ?? item.branch_id ?? item.branch?.id ?? '');

                    return {
                        ...item,
                        productId,
                        branchId,
                        productName: item.productName ?? item.product_name ?? item.product?.name ?? '—',
                        sku: item.sku ?? item.product?.sku ?? item.product?.code ?? '—',
                        categoryName:
                            item.categoryName ??
                            item.category_name ??
                            item.product?.category?.name ??
                            item.product?.categoryName ??
                            '—',
                        branchName: item.branchName ?? item.branch_name ?? item.branch?.name ?? '—',
                        quantity: qty,
                        minStock: min,
                        unitPrice: price,
                        status: deriveStatus(qty, min),
                    };
                });
                setStockItems(normalizedStock);

                // ── Alerts: normalize persisted alerts, then fill gaps from live stock ──
                const rawAlerts = extractArray<any>(alertsRes.data);
                const openAlerts = rawAlerts
                    .map((a: any) => ({
                        ...a,
                        id: String(a.id ?? `${a.product_id ?? a.productId}-${a.branch_id ?? a.branchId}`),
                        productId: String(a.product_id ?? a.productId ?? a.product?.id ?? ''),
                        branchIdKey: String(a.branch_id ?? a.branchId ?? a.branch?.id ?? ''),
                        productName: a.productName ?? a.product_name ?? a.product?.name ?? '—',
                        branchName: a.branchName ?? a.branch_name ?? a.branch?.name ?? '—',
                        quantity: Number(a.quantity ?? a.stockQty ?? a.stock_qty ?? 0),
                        minStock: Number(
                            a.minStock ?? a.min_stock ?? a.product?.min_quantity ?? a.product?.minStock ?? 0
                        ),
                        type:
                            a.type ??
                            (a.status === 'OUT_OF_STOCK' || a.quantity === 0 ? 'out_of_stock' : 'low_stock'),
                        createdAt: a.createdAt ?? a.created_at ?? new Date().toISOString(),
                    }))
                    .filter((a: any) => !(a.resolvedAt ?? a.resolved_at));

                const openKeys = new Set(
                    openAlerts.map((a: any) => `${a.productId}-${a.branchIdKey}`)
                );

                const derivedAlerts: Alert[] = normalizedStock
                    .filter(
                        (s) =>
                            (s.status === 'low_stock' || s.status === 'out_of_stock') &&
                            !openKeys.has(`${s.productId}-${s.branchId}`)
                    )
                    .map((s) => ({
                        id: `derived-${s.productId}-${s.branchId}`,
                        productName: s.productName,
                        branchName: s.branchName,
                        quantity: s.quantity,
                        minStock: s.minStock,
                        type: s.status as 'low_stock' | 'out_of_stock',
                        createdAt: new Date().toISOString(),
                    }));

                setAlerts([...openAlerts, ...derivedAlerts]);

                const rawLogs = extractArray<any>(logsRes.data);
                const normalizedLogs = rawLogs.slice(0, 5).map((log: any) => ({
                    ...log,
                    id: String(log.id ?? Math.random()),
                    details: log.details ?? log.description ?? log.action ?? '—',
                    userName: log.userName ?? log.user_name ?? log.user?.name ?? '—',
                    createdAt: log.createdAt ?? log.created_at ?? new Date().toISOString(),
                }));
                setLogs(normalizedLogs);

                const prodData = productsRes.data as any;
                let count = 0;
                if (Array.isArray(prodData)) {
                    count = prodData.length;
                } else if (prodData && typeof prodData === 'object') {
                    count =
                        prodData.total ??
                        prodData.count ??
                        (Array.isArray(prodData.data) ? prodData.data.length : 0) ??
                        (Array.isArray(prodData.items) ? prodData.items.length : 0) ??
                        0;
                    if (count === 0 && prodData.data && typeof prodData.data === 'object') {
                        const inner = prodData.data;
                        count =
                            inner.total ??
                            inner.count ??
                            (Array.isArray(inner.items) ? inner.items.length : 0) ??
                            (Array.isArray(inner.data) ? inner.data.length : 0) ??
                            0;
                    }
                }
                if (count === 0 && normalizedStock.length > 0) {
                    count = new Set(normalizedStock.map((s) => s.productId).filter(Boolean)).size;
                }
                setTotalProducts(count);

                const rawBatches = extractArray<any>(batchesRes?.data ?? batchesRes);
                const expiringList: ExpiringBatch[] = rawBatches
                    .map((b: any) => {
                        const expiry = b.expiryDate ?? b.expiry_date ?? b.expiresAt ?? b.expires_at ?? '';
                        const days = daysUntil(expiry);
                        return {
                            id: String(b.id ?? Math.random()),
                            productName: b.productName ?? b.product_name ?? b.product?.name ?? '—',
                            branchName: b.branchName ?? b.branch_name ?? b.branch?.name ?? '—',
                            batchNo: b.batchNo ?? b.batch_no ?? b.lotNumber ?? b.lot_number ?? '—',
                            quantity: Number(b.quantity ?? b.qty ?? b.remainingQty ?? 0),
                            expiryDate: expiry,
                            daysLeft: days,
                        };
                    })
                    .filter((b) => b.expiryDate && b.daysLeft >= 0 && b.daysLeft <= 30)
                    .sort((a, b) => a.daysLeft - b.daysLeft);
                setExpiring(expiringList);
            })
            .catch(() => toast.error('Failed to load dashboard data'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categories = [...new Set(stockItems.map((i) => i.categoryName).filter((c) => c && c !== '—'))];
    const branches = isAdmin
        ? [...new Set(stockItems.map((i) => i.branchName).filter((b) => b && b !== '—'))]
        : [];

    const filtered = stockItems.filter((item) => {
        const matchSearch =
            !search ||
            item.productName.toLowerCase().includes(search.toLowerCase()) ||
            item.sku.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCategory || item.categoryName === filterCategory;
        const matchBranch = !filterBranch || item.branchName === filterBranch;
        const matchStatus = !filterStatus || item.status === filterStatus;
        return matchSearch && matchCat && matchBranch && matchStatus;
    });

    const totalValue = stockItems.reduce((sum, i) => sum + i.quantity * (i.unitPrice || 0), 0);

    const lowCount = alerts.filter((a) => a.type === 'low_stock').length;
    const outCount = alerts.filter((a) => a.type === 'out_of_stock').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen">
                <div className="w-6 h-6 border-2 border-[#1e2a4a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
                    {!isAdmin && branchName && (
                        <p className="text-xs text-gray-400 mt-1">
                            Viewing: <span className="font-medium text-[#4A8FD4]">{branchName}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="pl-9 w-56"
                        />
                    </div>
                    <Button variant="outline" size="default" onClick={() => {}}>
                        <Download size={14} />
                        Export
                    </Button>
                    {(isAdmin || isManager) && (
                        <Button onClick={() => router.push('/inventory/products')}>
                            <Plus size={14} />
                            Add Product
                        </Button>
                    )}
                </div>
            </div>

            {/* Stat cards */}
            <div className="flex gap-6">
                <StatCard
                    label="Total Products"
                    value={totalProducts}
                    sub={`${stockItems.length} stock records`}
                    subColor="text-blue-600"
                    borderColor="border-blue-500"
                />
                <StatCard
                    label="In Stock Value"
                    value={formatValue(totalValue)}
                    sub="Based on unit price"
                    subColor="text-green-600"
                    borderColor="border-green-500"
                />
                <StatCard
                    label="Low Stock Alerts"
                    value={lowCount}
                    sub={lowCount > 0 ? 'Needs attention' : 'All good'}
                    subColor={lowCount > 0 ? 'text-orange-500' : 'text-green-600'}
                    borderColor="border-orange-400"
                />
                <StatCard
                    label="Out of Stock"
                    value={outCount}
                    sub={outCount > 0 ? 'Action required' : 'All good'}
                    subColor={outCount > 0 ? 'text-red-500' : 'text-green-600'}
                    borderColor="border-red-500"
                />
            </div>

            {/* Product inventory table */}
            <Card>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Product Inventory</h2>
                    <div className="flex gap-3">
                        <Select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-40"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </Select>

                        {isAdmin && (
                            <Select
                                value={filterBranch}
                                onChange={(e) => setFilterBranch(e.target.value)}
                                className="w-40"
                            >
                                <option value="">All Branches</option>
                                {branches.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </Select>
                        )}

                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-36"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </Select>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="px-6 py-4 text-left font-medium">Product</th>
                        <th className="px-6 py-4 text-left font-medium">Category</th>
                        {isAdmin && <th className="px-6 py-4 text-left font-medium">Branch</th>}
                        <th className="px-6 py-4 text-left font-medium">Stock Level</th>
                        <th className="px-6 py-4 text-left font-medium">Unit Price</th>
                        <th className="px-6 py-4 text-left font-medium">Status</th>
                        <th className="px-6 py-4 text-left font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 7 : 6} className="px-6 py-10 text-center text-gray-400">
                                No items found
                            </td>
                        </tr>
                    )}
                    {filtered.map((item) => (
                        <tr key={`${item.productId}-${item.branchId}`} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                                <p className="font-medium text-gray-800 mb-1">{item.productName}</p>
                                <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{item.categoryName || '—'}</td>
                            {isAdmin && <td className="px-6 py-4 text-gray-600">{item.branchName}</td>}
                            <td className="px-6 py-4">
                                <StockBar qty={item.quantity} min={item.minStock} />
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {item.unitPrice ? `Rs. ${item.unitPrice.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-[#4A8FD4]"
                                    onClick={() => router.push('/inventory/products')}
                                >
                                    View
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Card>

            {/* Bottom panels */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex gap-4 border-b border-gray-100 mb-5">
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'alerts'
                                        ? 'border-[#1e2a4a] text-[#1e2a4a]'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Low Stock Alerts{' '}
                                {lowCount + outCount > 0 && (
                                    <Badge variant="warning" className="ml-1">
                                        {lowCount + outCount}
                                    </Badge>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('expiring')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'expiring'
                                        ? 'border-[#1e2a4a] text-[#1e2a4a]'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Expiring Soon{' '}
                                {expiring.length > 0 && (
                                    <Badge variant="destructive" className="ml-1">
                                        {expiring.length}
                                    </Badge>
                                )}
                            </button>
                        </div>

                        {activeTab === 'alerts' && (
                            <div className="space-y-4">
                                {alerts.slice(0, 5).map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`w-2 h-2 rounded-full shrink-0 ${
                                                    alert.type === 'out_of_stock' ? 'bg-red-500' : 'bg-orange-400'
                                                }`}
                                            />
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    {alert.productName} —{' '}
                                                    {alert.type === 'out_of_stock'
                                                        ? 'Out of stock'
                                                        : `${alert.quantity} units left`}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {alert.branchName} · min: {alert.minStock}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{timeAgo(alert.createdAt)}</span>
                                    </div>
                                ))}
                                {alerts.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">No alerts</p>
                                )}
                                {alerts.length > 5 && (
                                    <button
                                        onClick={() => router.push('/inventory/inventory/alerts')}
                                        className="text-xs text-[#4A8FD4] hover:underline w-full text-center pt-1"
                                    >
                                        View all {alerts.length} alerts →
                                    </button>
                                )}
                            </div>
                        )}

                        {activeTab === 'expiring' && (
                            <div className="space-y-4">
                                {expiring.slice(0, 5).map((b) => (
                                    <div key={b.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`w-2 h-2 rounded-full shrink-0 ${
                                                    b.daysLeft <= 7 ? 'bg-red-500' : 'bg-orange-400'
                                                }`}
                                            />
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    {b.productName} <span className="text-gray-400">({b.batchNo})</span>
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {b.branchName} · {b.quantity} units ·{' '}
                                                    {b.daysLeft === 0
                                                        ? 'Expires today'
                                                        : `${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'} left`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                ))}
                                {expiring.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        No batches expiring in the next 30 days
                                    </p>
                                )}
                                {expiring.length > 5 && (
                                    <button
                                        onClick={() => router.push('/inventory/batches')}
                                        className="text-xs text-[#4A8FD4] hover:underline w-full text-center pt-1"
                                    >
                                        View all batches →
                                    </button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                            <button
                                onClick={() => router.push('/inventory/inventory/logs')}
                                className="text-xs text-[#4A8FD4] hover:underline"
                            >
                                View all →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <TrendingUp size={12} className="text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 truncate">{log.details}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {log.userName} · {timeAgo(log.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}