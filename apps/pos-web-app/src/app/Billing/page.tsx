'use client';

import { useState,useEffect, useRef  } from 'react';
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

export default function BillingPage() {
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
            // Ignore if user is typing in an input (except our search bar)
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
                    // Clear search input after scan
                    setSearch('');
                    if (searchRef.current) searchRef.current.value = '';
                }
                return;
            }

            // If chars come in fast → barcode scanner
            if (timeDiff < SCANNER_SPEED || barcodeBuffer.current.length > 0) {
                if (e.key.length === 1) {
                    barcodeBuffer.current += e.key;
                }
            } else {
                // Slow typing = human, reset buffer
                barcodeBuffer.current = e.key.length === 1 ? e.key : '';
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    function handleBarcodeScan(code: string) {
        // Match by SKU or id
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
        setTimeout(() => setScanFlash(null), 2000)};
        const filtered = ALL_PRODUCTS.filter(p => {
            const matchCat = category === 'All' || p.category === category;
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
                || p.sku.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
        });

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