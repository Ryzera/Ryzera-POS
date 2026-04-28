'use client';

import { useState, useEffect, useRef } from 'react';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import { useCartStore, Product } from '@/store/cartstore';

const MOCK_PRODUCTS: Product[] = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Basmati Rice 5kg',    sku: 'RC-002', price: 1200, stock: 45,  category: 'Groceries'  },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Coconut Oil 1L',      sku: 'CO-003', price: 580,  stock: 0,   category: 'Groceries'  },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Green Tea Bags x20',  sku: 'TB-004', price: 320,  stock: 6,   category: 'Groceries'  },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Full Cream Milk 1L',  sku: 'FM-001', price: 480,  stock: 30,  category: 'Dairy'      },
    { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Cheddar Cheese 200g', sku: 'CC-002', price: 890,  stock: 9,   category: 'Dairy'      },
    { id: '550e8400-e29b-41d4-a716-446655440006', name: 'T-Shirt — Medium',    sku: 'TS-001', price: 1500, stock: 22,  category: 'Clothing'   },
    { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Slim Fit Jeans',      sku: 'JN-002', price: 3200, stock: 7,   category: 'Clothing'   },
    { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Floor Cleaner 1L',    sku: 'FC-001', price: 275,  stock: 18,  category: 'Household'  },
    { id: '550e8400-e29b-41d4-a716-446655440009', name: 'Dish Soap 500ml',     sku: 'DS-002', price: 190,  stock: 35,  category: 'Household'  },
    { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Wireless Earbuds',    sku: 'WE-001', price: 4500, stock: 12,  category: 'Electronic' },
    { id: '550e8400-e29b-41d4-a716-446655440011', name: 'USB-C Cable 2m',      sku: 'UC-003', price: 650,  stock: 28,  category: 'Electronic' },
    { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Coca Cola 330ml',     sku: 'CC-330', price: 180,  stock: 142, category: 'Groceries'  },
    { id: '550e8400-e29b-41d4-a716-446655440013', name: 'Liquid Detergent 1L', sku: 'LD-002', price: 560,  stock: 0,   category: 'Household'  },
    { id: '550e8400-e29b-41d4-a716-446655440014', name: 'Polo Shirt XL',       sku: 'PS-003', price: 1800, stock: 3,   category: 'Clothing'   },
];

const CATEGORIES = ['All', 'Electronic', 'Groceries', 'Clothing', 'Household', 'Dairy'];

export default function BillingPage() {
    const [search, setSearch]     = useState('');
    const [category, setCategory] = useState('All');

    const addItem = useCartStore(s => s.addItem);

    // ── USB Barcode Scanner (background keydown) ─────
    const barcodeBufferRef = useRef('');
    const barcodeTimerRef  = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'Enter') {
                const barcode = barcodeBufferRef.current.trim();
                if (barcode.length >= 3) {
                    const found = MOCK_PRODUCTS.find(
                        p =>
                            p.sku.toLowerCase() === barcode.toLowerCase() ||
                            p.id === barcode
                    );
                    if (found) {
                        addItem(found);
                        setSearch(found.sku);
                        setTimeout(() => setSearch(''), 1500);
                    } else {
                        setSearch(barcode);
                        setTimeout(() => setSearch(''), 2000);
                    }
                }
                barcodeBufferRef.current = '';
                if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
                return;
            }

            if (e.key.length === 1) {
                barcodeBufferRef.current += e.key;
                if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
                barcodeTimerRef.current = setTimeout(() => {
                    barcodeBufferRef.current = '';
                }, 80);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        };
    }, [addItem]);

    // ── Filter ───────────────────────────────────────
    const filtered = MOCK_PRODUCTS.filter(p => {
        const matchCat    = category === 'All' || p.category === category;
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // ── Search bar Enter
    function handleSearchEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            const barcode = search.trim();
            if (barcode.length >= 3) {
                const found = MOCK_PRODUCTS.find(
                    p =>
                        p.sku.toLowerCase() === barcode.toLowerCase() ||
                        p.id === barcode
                );
                if (found) {
                    addItem(found);
                    setSearch('');
                }
            }
        }
    }

    return (
        <div className="flex h-full overflow-hidden bg-gray-50">

            {/* ── Left: Product Discovery ── */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Top bar */}
                <div className="bg-blue-600 px-6 py-2.5 flex items-center justify-between shrink-0">
                    <div className="flex gap-2.5">
            <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg">
              📅 {new Date().toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
            })}
            </span>
                        <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg">
              🏢 Colombo Main Branch
            </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-white text-sm font-medium">Cashier Hiruni</p>
                            <p className="text-blue-200 text-xs">Sales Staff</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                            HI
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Discovery</h2>

                    {/* Search */}
                    <div className="relative mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              🔍
            </span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleSearchEnter}
                            placeholder="Search Product or Scan Barcode..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-1 mb-3 border-b border-gray-200">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer
                  ${category === cat
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <ProductGrid products={filtered} />
                </div>
            </div>

            {/* ── Right: Cart ── */}
            <CartPanel />
        </div>
    );
}