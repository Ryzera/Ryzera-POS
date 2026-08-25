'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Receipt, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import { useCartStore } from '@/store/cartstore';
import { Product } from '@/store/cartstore';

const CATEGORIES = ['All', 'Electronic', 'Groceries', 'Clothing', 'Household', 'Dairy'];

const ALL_PRODUCTS: Product[] = [
    { id: '1',  name: 'Basmati Rice 5kg',     sku: 'RC-002', price: 1200, stock: 50,  category: 'Groceries'  },
    { id: '2',  name: 'Coconut Oil 1L',        sku: 'CO-003', price: 580,  stock: 0,   category: 'Groceries'  },
    { id: '3',  name: 'Green Tea Bags x20',    sku: 'TB-004', price: 320,  stock: 6,   category: 'Groceries'  },
    { id: '4',  name: 'Full Cream Milk 1L',    sku: 'FM-001', price: 480,  stock: 20,  category: 'Dairy'      },
    { id: '5',  name: 'Cheddar Cheese 200g',   sku: 'CC-002', price: 890,  stock: 9,   category: 'Dairy'      },
    { id: '6',  name: 'T-Shirt — Medium',      sku: 'TS-001', price: 1500, stock: 30,  category: 'Clothing'   },
    { id: '7',  name: 'Slim Fit Jeans',        sku: 'JN-002', price: 3200, stock: 7,   category: 'Clothing'   },
    { id: '8',  name: 'Floor Cleaner 1L',      sku: 'FC-001', price: 275,  stock: 40,  category: 'Household'  },
    { id: '9',  name: 'Dish Soap 500ml',       sku: 'DS-002', price: 190,  stock: 25,  category: 'Household'  },
    { id: '10', name: 'Wireless Earbuds',      sku: 'WE-001', price: 4500, stock: 15,  category: 'Electronic' },
    { id: '11', name: 'USB-C Cable 2m',        sku: 'UC-003', price: 650,  stock: 20,  category: 'Electronic' },
    { id: '12', name: 'Coca Cola 330ml',       sku: 'CC-330', price: 180,  stock: 100, category: 'Groceries'  },
    { id: '13', name: 'Liquid Detergent 1L',   sku: 'LD-002', price: 560,  stock: 0,   category: 'Household'  },
    { id: '14', name: 'Polo Shirt XL',         sku: 'PS-003', price: 1800, stock: 3,   category: 'Clothing'   },
];

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
    // ── View toggle (merged) ───────────────────────────
    const [view, setView] = useState<'pos' | 'list'>('pos');

    // ── POS state ───────────────────────────────────────
    const [search, setSearch]     = useState('');
    const [category, setCategory] = useState('All');
    const [scanFlash, setScanFlash]   = useState<'success' | 'error' | null>(null);
    const [scanMsg, setScanMsg]       = useState('');

    const addItem     = useCartStore(s => s.addItem);
    const searchRef   = useRef<HTMLInputElement>(null);

    // ── Barcode detection ──────────────────────────────
    const barcodeBuffer = useRef('');
    const lastKeyTime   = useRef(0);
    const SCANNER_SPEED = 50; // ms — faster than human typing

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
    }, []);

    function handleBarcodeScan(code: string) {
        const product = ALL_PRODUCTS.find(
            p => p.sku.toLowerCase() === code.toLowerCase() ||
                p.id === code
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

    const filtered = ALL_PRODUCTS.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
            || p.sku.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // ── Bills list / auth state ─────────────────────────
    const router = useRouter();
    const { user } = useAuthStore();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const isCashier = user?.roles?.includes('CASHIER');
    const canCreate = isAdmin || isManager || isCashier;

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
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const getStatusStyle = (status: string) => {
        if (status === 'COMPLETED') return { bg: '#f0fdf4', color: '#16a34a' };
        if (status === 'CANCELLED') return { bg: '#fef2f2', color: '#dc2626' };
        if (status === 'PENDING') return { bg: '#fffbeb', color: '#d97706' };
        return { bg: '#f8fafc', color: '#64748b' };
    };

    const totalRevenue = bills
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + Number(b.total), 0);

    // ── POS view ─────────────────────────────────────────
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
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500
                            }}>
                                🏢 Colombo Main Branch
                            </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <button onClick={() => setView('list')} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', background: 'rgba(255,255,255,0.2)',
                                border: 'none', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, color: '#fff',
                            }}>
                                <Receipt size={14} /> Bills List
                            </button>
                            <div style={{textAlign: 'right'}}>
                                <div style={{fontSize: '13px', fontWeight: 600}}>Cashier Hiruni</div>
                                <div style={{fontSize: '11px', color: '#bfdbfe'}}>Sales Staff</div>
                            </div>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: '#1e40af',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 700,
                            }}>
                                HI
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
                                onFocus={e => {
                                    e.currentTarget.style.borderColor = '#2563eb';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                }}
                            />
                        </div>

                        {/* CATEGORY TABS */}
                        <div style={{
                            display: 'flex', gap: '4px',
                            borderBottom: '1px solid #e5e7eb', marginBottom: '24px',
                        }}>
                            {CATEGORIES.map(cat => (
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
                        <ProductGrid products={filtered}/>
                    </div>
                </div>

                {/* RIGHT — cart */}
                <CartPanel/>
            </div>
        );
    }

    // ── Bills list view ───────────────────────────────────
    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Billing</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{bills.length} bills total</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setView('pos')} style={{
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
                    {canCreate && (
                        <button onClick={() => router.push('/billing/create')} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: '#2563eb', border: 'none',
                            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem',
                            color: 'white', fontWeight: 500,
                        }}>
                            <Plus size={14} /> New Bill
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Bills', value: bills.length, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Completed', value: bills.filter(b => b.status === 'COMPLETED').length, color: '#16a34a', bg: '#f0fdf4' },
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
                                        {(isAdmin || isManager) && bill.status !== 'CANCELLED' && (
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