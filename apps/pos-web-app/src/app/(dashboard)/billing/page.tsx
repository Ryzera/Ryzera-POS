'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api, { extractArray } from '@/lib/api';
import { Receipt, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import { useCartStore } from '@/store/cartstore';
import { Product } from '@/store/cartstore';

const FALLBACK_PRODUCTS: Product[] = [
    { id: '1',  name: 'Basmati Rice 5kg',     sku: 'RC-002', price: 1200, stock: 50,  category: 'Groceries',  minStock: 10 },
    { id: '2',  name: 'Coconut Oil 1L',        sku: 'CO-003', price: 580,  stock: 0,   category: 'Groceries',  minStock: 5  },
    { id: '3',  name: 'Green Tea Bags x20',    sku: 'TB-004', price: 320,  stock: 6,   category: 'Groceries',  minStock: 10 },
    { id: '4',  name: 'Full Cream Milk 1L',    sku: 'FM-001', price: 480,  stock: 20,  category: 'Dairy',      minStock: 10 },
    { id: '5',  name: 'Cheddar Cheese 200g',   sku: 'CC-002', price: 890,  stock: 9,   category: 'Dairy',      minStock: 10 },
    { id: '6',  name: 'T-Shirt — Medium',      sku: 'TS-001', price: 1500, stock: 30,  category: 'Clothing',   minStock: 10 },
    { id: '7',  name: 'Slim Fit Jeans',        sku: 'JN-002', price: 3200, stock: 7,   category: 'Clothing',   minStock: 10 },
    { id: '8',  name: 'Floor Cleaner 1L',      sku: 'FC-001', price: 275,  stock: 40,  category: 'Household',  minStock: 10 },
    { id: '9',  name: 'Dish Soap 500ml',       sku: 'DS-002', price: 190,  stock: 25,  category: 'Household',  minStock: 10 },
    { id: '10', name: 'Wireless Earbuds',      sku: 'WE-001', price: 4500, stock: 15,  category: 'Electronic', minStock: 10 },
    { id: '11', name: 'USB-C Cable 2m',        sku: 'UC-003', price: 650,  stock: 20,  category: 'Electronic', minStock: 10 },
    { id: '12', name: 'Coca Cola 330ml',       sku: 'CC-330', price: 180,  stock: 100, category: 'Groceries',  minStock: 20 },
    { id: '13', name: 'Liquid Detergent 1L',   sku: 'LD-002', price: 560,  stock: 0,   category: 'Household',  minStock: 10 },
    { id: '14', name: 'Polo Shirt XL',         sku: 'PS-003', price: 1800, stock: 3,   category: 'Clothing',   minStock: 10 },
];

interface Branch {
    id: number | string;
    name: string;
}

interface Bill {
    id: number;
    bill_number: string;
    status: string;
    payment_method: string;
    total: number;
    created_at: string;
    cashier: { username: string; info: { first_name: string; last_name: string } | null };
    branch: { name: string };
    items: any[];
}

export default function BillingPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    // ── View toggle ──
    const [view, setView] = useState<'pos' | 'list'>('pos');

    // ── POS state ──
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [search, setSearch]     = useState('');
    const [category, setCategory] = useState('All');
    const [scanFlash, setScanFlash]   = useState<'success' | 'error' | null>(null);
    const [scanMsg, setScanMsg]       = useState('');

    // Branch list — used for Admin's branch filter dropdown, and also to
    // resolve the current user's own branch name for the top-bar badge
    // (Manager/Cashier are scoped to one branch but still want to see its
    // name, not just "Branch #3").
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

    const addItem     = useCartStore(s => s.addItem);
    const searchRef   = useRef<HTMLInputElement>(null);

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const isCashier = user?.roles?.includes('CASHIER');
    const canCreate = isAdmin || isManager || isCashier;

    // ── Fetch real categories from backend (no more hardcoded list) ──
    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories', { params: { limit: 100 } });
            const data = extractArray<any>(res.data);
            const names = (data || []).map((c: any) => c.name).filter(Boolean);
            setCategories(['All', ...names]);
        } catch {
            // Keep 'All' only if categories fail to load
        }
    };

    // ── Fetch branch list ──
    // Needed for Admin's branch filter dropdown AND for resolving the
    // logged-in user's own branch name (Manager/Cashier), so everyone
    // gets this now instead of admin-only.
    const fetchBranches = async () => {
        try {
            const res = await api.get('/branches', { params: { limit: 100 } });
            const data = extractArray<any>(res.data);
            const list: Branch[] = (data || [])
                .map((b: any) => ({ id: b.id, name: b.name }))
                .filter((b: Branch) => b.id != null && b.name);
            setBranches(list);
        } catch {
            // Keep branch list empty if it fails to load — badge falls
            // back to "Branch #id" below.
        }
    };

    // Look up the current (non-admin) user's own branch name from the
    // fetched branch list. Falls back to "Branch #id" if not found yet
    // (e.g. still loading) or if the fetch failed.
    const myBranchName = branches.find(
        b => String(b.id) === String(user?.branch_id),
    )?.name;

    // ── Fetch Live Products & Stock from Backend ──
    // Admin can filter by a specific branch via selectedBranchId, or leave it
    // on 'all' to see every branch's stock summed together (previous default
    // behavior, regardless of their own account's branch_id).
    // Cashier/Manager stay scoped to their own branch.
    // Pulls every page, then de-dupes by product so an unfiltered Admin view
    // shows one card per product (stock summed across branches) instead of
    // one per row. When Admin picks a specific branch, stock naturally
    // reflects just that branch since only its rows come back.
    //
    // While this is in flight, `products` stays empty so the UI shows a
    // loading state instead of flashing the hardcoded FALLBACK_PRODUCTS.
    // FALLBACK_PRODUCTS is only used if the fetch genuinely fails (e.g. offline).
    const fetchLiveProducts = async () => {
        setProductsLoading(true);
        try {
            const branchId = isAdmin
                ? (selectedBranchId !== 'all' ? selectedBranchId : undefined)
                : user?.branch_id;
            const firstPage = await api.get('/inventory/branch-products', {
                params: { ...(branchId ? { branchId } : {}), page: 1, limit: 100 },
            });

            let allRows: any[] = extractArray<any>(firstPage.data) || [];
            const total = firstPage.data?.total ?? allRows.length;
            const limit = firstPage.data?.limit ?? 100;
            const totalPages = Math.ceil(total / limit);

            if (totalPages > 1) {
                const rest = await Promise.all(
                    Array.from({ length: totalPages - 1 }, (_, i) =>
                        api.get('/inventory/branch-products', {
                            params: { ...(branchId ? { branchId } : {}), page: i + 2, limit },
                        }),
                    ),
                );
                rest.forEach(r => {
                    allRows = allRows.concat(extractArray<any>(r.data) || []);
                });
            }

            // Group by product id, summing stock across branches.
            // min_quantity is a product-level field (same across branches),
            // so it's read once when the product is first seen — it isn't
            // summed like stock is.
            const byProduct = new Map<string, Product>();
            for (const bp of allRows) {
                const id = String(bp.productId ?? bp.product_id ?? bp.product?.id ?? bp.id);
                const stockQty = Number(bp.stockQty ?? bp.quantity ?? bp.stock_qty ?? 0);
                const existing = byProduct.get(id);
                if (existing) {
                    existing.stock += stockQty;
                } else {
                    const rawMinStock =
                        bp.minQuantity ?? bp.min_quantity ??
                        bp.product?.minQuantity ?? bp.product?.min_quantity ??
                        bp.product?.minStock ?? bp.product?.min_stock;
                    byProduct.set(id, {
                        id,
                        name:     bp.productName ?? bp.product_name ?? bp.product?.name ?? '—',
                        sku:      bp.sku ?? bp.product?.sku ?? bp.product?.code ?? '',
                        price:    Number(bp.unitPrice ?? bp.unit_price ?? bp.product?.price ?? 0),
                        stock:    stockQty,
                        category: bp.categoryName ?? bp.category_name ?? bp.product?.category?.name ?? 'General',
                        minStock: rawMinStock != null ? Number(rawMinStock) : undefined,
                    });
                }
            }
            setProducts(Array.from(byProduct.values()));
        } catch {
            // Only fall back to hardcoded data on a real failure (e.g. offline)
            setProducts(FALLBACK_PRODUCTS);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchBranches();
    }, [user?.roles, user?.user_type]);

    useEffect(() => {
        fetchLiveProducts();
    }, [user?.branch_id, user?.roles, user?.user_type, selectedBranchId]);

    // ── Barcode detection ──
    const barcodeBuffer = useRef('');
    const lastKeyTime   = useRef(0);
    const SCANNER_SPEED = 50;

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement).tagName;
            const isOurInput = e.target === searchRef.current;
            if (tag === 'INPUT' && !isOurInput) return;
            if (tag === 'TEXTAREA') return;

            const now = Date.now();
            const timeDiff = now - lastKeyTime.current;
            lastKeyTime.current = now;

            if (e.key === 'Enter') {
                const code = barcodeBuffer.current.trim();
                barcodeBuffer.current = '';

                if (code.length >= 3) {
                    handleBarcodeScan(code);
                    setSearch('');
                    if (searchRef.current) searchRef.current.value = '';
                }
                return;
            }

            if (timeDiff < SCANNER_SPEED || barcodeBuffer.current.length > 0) {
                if (e.key.length === 1) {
                    barcodeBuffer.current += e.key;
                }
            } else {
                barcodeBuffer.current = e.key.length === 1 ? e.key : '';
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [products]);

    function handleBarcodeScan(code: string) {
        const product = products.find(
            p => p.sku.toLowerCase() === code.toLowerCase() || p.id === code
        );

        if (!product) {
            showFlash('error', `Barcode not found: ${code}`);
            return;
        }

        if (product.stock === 0) {
            showFlash('error', `${product.name} — Out of stock`);
            return;
        }

        addItem(product);
        showFlash('success', `Added: ${product.name}`);
    }

    function showFlash(type: 'success' | 'error', msg: string) {
        setScanFlash(type);
        setScanMsg(msg);
        setTimeout(() => setScanFlash(null), 2000);
    }

    const filtered = products.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
            || p.sku.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // ── Bills list state ──
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await api.get('/billing/sales');
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.data
                    ? res.data.data
                    : [];
            setBills(data);
        } catch {
            toast.error('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBills(); }, []);

    const handleCancel = async (id: number) => {
        if (!confirm('Cancel this bill?')) return;
        try {
            await api.patch(`/billing/sales/${id}/cancel`);
            toast.success('Bill cancelled');
            fetchBills();
            fetchLiveProducts(); // Refresh stock
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const getStatusStyle = (status: string) => {
        const s = (status || '').toUpperCase();
        if (s === 'COMPLETED' || s === 'PAID') return { bg: '#f0fdf4', color: '#16a34a' };
        if (s === 'CANCELLED') return { bg: '#fef2f2', color: '#dc2626' };
        if (s === 'PENDING') return { bg: '#fffbeb', color: '#d97706' };
        return { bg: '#f8fafc', color: '#64748b' };
    };

    const totalRevenue = bills
        .filter(b => (b.status || '').toUpperCase() === 'COMPLETED')
        .reduce((sum, b) => sum + Number(b.total), 0);

    // ── POS view ──
    if (view === 'pos') {
        return (
            <div style={{display: 'flex', height: '100%', overflow: 'hidden'}}>
                {/* LEFT — product area */}
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0}}>
                    {/* TOP BAR */}
                    <div style={{
                        background: '#2563eb', color: '#fff',
                        padding: '10px 24px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
                    }}>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500
                            }}>
                                📅 {new Date().toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short',
                                day: 'numeric', year: 'numeric',
                            })}
                            </div>
                            {isAdmin ? (
                                <div style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '4px 8px 4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}>
                                    🏢
                                    <select
                                        value={selectedBranchId}
                                        onChange={e => setSelectedBranchId(e.target.value)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            outline: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value="all" style={{ color: '#111827' }}>All Branches</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={String(b.id)} style={{ color: '#111827' }}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 500
                                }}>
                                    🏢 {user?.branch_id
                                    ? (myBranchName ? `${myBranchName} (#${user.branch_id})` : `Branch #${user.branch_id}`)
                                    : 'Assigned Branch'}
                                </div>
                            )}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <button onClick={() => { setView('list'); fetchBills(); }} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', background: 'rgba(255,255,255,0.2)',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, color: '#fff',
                            }}>
                                <Receipt size={14} /> Bills List
                            </button>
                            <button onClick={fetchLiveProducts} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', background: 'rgba(255,255,255,0.2)',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, color: '#fff',
                            }}>
                                <RefreshCw size={14} /> Sync Stock
                            </button>
                            <div style={{textAlign: 'right'}}>
                                <div style={{fontSize: '13px', fontWeight: 600}}>
                                    {user?.username || 'Cashier'}
                                </div>
                                <div style={{fontSize: '11px', color: '#bfdbfe'}}>
                                    {user?.user_type || 'Staff'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div style={{flex: 1, overflow: 'auto', padding: '24px', background: '#f9fafb'}}>
                        <h2 style={{fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '16px'}}>
                            Product Discovery
                        </h2>

                        {/* SEARCH */}
                        <div style={{position: 'relative', marginBottom: '16px'}}>
                            <span style={{
                                position: 'absolute', left: '12px',
                                top: '50%', transform: 'translateY(-50%)',
                                fontSize: '14px', color: '#9ca3af',
                            }}>
                                🔍
                            </span>
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search Product or Scan Barcode..."
                                style={{
                                    width: '100%', paddingLeft: '38px', paddingRight: '16px',
                                    paddingTop: '10px', paddingBottom: '10px',
                                    border: '1px solid #d1d5db', borderRadius: '8px',
                                    background: '#ffffff', fontSize: '13px', color: '#111827',
                                    outline: 'none', boxSizing: 'border-box',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                }}
                            />
                        </div>

                        {/* CATEGORY TABS */}
                        <div style={{
                            display: 'flex', gap: '4px',
                            borderBottom: '1px solid #e5e7eb', marginBottom: '24px',
                            overflowX: 'auto',
                        }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    style={{
                                        padding: '6px 14px 10px', fontSize: '13px', fontWeight: 500,
                                        border: 'none', background: 'none', cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        borderBottom: category === cat ? '2px solid #2563eb' : '2px solid transparent',
                                        color: category === cat ? '#2563eb' : '#6b7280',
                                        marginBottom: '-1px', transition: 'color 0.15s',
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* PRODUCT GRID */}
                        {productsLoading ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '64px 0', color: '#9ca3af', fontSize: '13px', gap: '8px',
                            }}>
                                <RefreshCw size={16} className="animate-spin" /> Loading products…
                            </div>
                        ) : (
                            <ProductGrid products={filtered}/>
                        )}
                    </div>
                </div>

                {/* RIGHT — cart */}
                <CartPanel
                    onPaymentSuccess={() => { fetchLiveProducts(); fetchBills(); }}
                    checkoutBranchId={isAdmin && selectedBranchId !== 'all' ? selectedBranchId : undefined}
                    requireBranchSelection={isAdmin && selectedBranchId === 'all'}
                />
            </div>
        );
    }

    // ── Bills list view ──
    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Billing</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{bills.length} bills total</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => { setView('pos'); fetchLiveProducts(); }} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                    }}>
                        <Receipt size={14} /> POS
                    </button>
                    <button onClick={fetchBills} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                    }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Bills', value: bills.length, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Completed', value: bills.filter(b => (b.status || '').toUpperCase() === 'COMPLETED').length, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: '#7c3aed', bg: '#f5f3ff' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem', background: stat.bg,
                            borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Receipt size={18} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bills Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading bills...</div>
                ) : bills.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No bills yet. Create your first bill!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['Bill #', 'Cashier', 'Branch', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                                <th key={h} style={{
                                    padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                                    fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {bills.map(bill => {
                            const statusStyle = getStatusStyle(bill.status);
                            return (
                                <tr key={bill.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                                        {bill.bill_number}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>
                                        {bill.cashier?.info
                                            ? `${bill.cashier.info.first_name} ${bill.cashier.info.last_name}`
                                            : bill.cashier?.username}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {bill.branch?.name}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {bill.items?.length || 0} items
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                                        Rs. {Number(bill.total).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '9999px',
                                            fontSize: '0.7rem', fontWeight: 500,
                                            background: '#f8fafc', color: '#64748b',
                                        }}>{bill.payment_method}</span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '9999px',
                                            fontSize: '0.7rem', fontWeight: 500,
                                            background: statusStyle.bg, color: statusStyle.color,
                                        }}>{bill.status}</span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {new Date(bill.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {(isAdmin || isManager) && (bill.status || '').toUpperCase() !== 'CANCELLED' && (
                                            <button onClick={() => handleCancel(bill.id)} style={{
                                                padding: '0.3rem 0.625rem', background: '#fef2f2', color: '#dc2626',
                                                border: '1px solid #fecaca', borderRadius: '0.375rem',
                                                fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                                            }}>Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
