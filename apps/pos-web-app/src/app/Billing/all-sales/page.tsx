'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getAllSales, cancelSale } from '@/lib/api';

// ── Types ─────────────────────────────────────────────
interface SaleItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Sale {
    id: number;
    invoice_no: string;
    total_amount: number;
    discount_amount: number;
    tax_amount: number;
    payment_method: string;  //Cash | Card | Split;
    status: string; // 'completed' | 'cancelled';
    created_at: string;
    items: SaleItem[];
}

// ── Mock data
const MOCK_SALES: Sale[] = [
    {
        id: 1,
        invoice_no: 'INV-2026-8380',
        total_amount: 3080,
        discount_amount: 0,
        tax_amount: 0,
        payment_method: 'Cash',
        status: 'completed',
        created_at: new Date().toISOString(),
        items: [
            { id: 1, product_name: 'Basmati Rice 5kg',   quantity: 1, unit_price: 1200, subtotal: 1200 },
            { id: 2, product_name: 'Full Cream Milk 1L', quantity: 2, unit_price: 480,  subtotal: 960  },
            { id: 3, product_name: 'Green Tea Bags x20', quantity: 3, unit_price: 320,  subtotal: 960  },
        ],
    },
    {
        id: 2,
        invoice_no: 'INV-2026-7241',
        total_amount: 6150,
        discount_amount: 350,
        tax_amount: 0,
        payment_method: 'Card',
        status: 'completed',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        items: [
            { id: 4, product_name: 'Wireless Earbuds', quantity: 1, unit_price: 4500, subtotal: 4500 },
            { id: 5, product_name: 'USB-C Cable 2m',   quantity: 2, unit_price: 650,  subtotal: 1300 },
        ],
    },
    {
        id: 3,
        invoice_no: 'INV-2026-5512',
        total_amount: 4700,
        discount_amount: 0,
        tax_amount: 0,
        payment_method: 'Cash',
        status: 'cancelled',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        items: [
            { id: 6, product_name: 'Slim Fit Jeans', quantity: 1, unit_price: 3200, subtotal: 3200 },
            { id: 7, product_name: 'Polo Shirt XL',  quantity: 1, unit_price: 1800, subtotal: 1800 },
        ],
    },
    {
        id: 4,
        invoice_no: 'INV-2026-3309',
        total_amount: 1850,
        discount_amount: 0,
        tax_amount: 280,
        payment_method: 'Split',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
            { id: 8, product_name: 'Coconut Oil 1L',    quantity: 2, unit_price: 580, subtotal: 1160 },
            { id: 9, product_name: 'Dish Soap 500ml',   quantity: 2, unit_price: 190, subtotal: 380  },
            { id: 10, product_name: 'Floor Cleaner 1L', quantity: 1, unit_price: 275, subtotal: 275  },
        ],
    },
];

const PAYMENT_COLORS: Record<string, string> = {
    Cash:  'bg-green-50 text-green-700',
    Card:  'bg-blue-50 text-blue-700',
    Split: 'bg-purple-50 text-purple-700',
};

export default function AllSalesPage() {
    const [sales, setSales]           = useState<Sale[]>(MOCK_SALES);
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState<'all' | 'completed' | 'cancelled'>('all');
    const [selectedSale, setSelected] = useState<Sale | null>(null);
    const [cancelling, setCancelling] = useState<number | null>(null);

    // ── Real API fetch ────────────────────────────────
    useEffect(() => {
        async function fetchSales() {
            try {
                const data = await getAllSales();
                if (data && data.length > 0) {
                    const mapped= data.map((s: any) => ({
                        id:              s.sale_id,
                        invoice_no:      s.invoice_number,
                        total_amount:    parseFloat(s.total_amount),
                        discount_amount: parseFloat(s.discount_amount),
                        tax_amount:      parseFloat(s.tax_amount),
                        payment_method:  s.payments?.[0]?.payment_method ?? 'Cash',
                        status:          s.sale_status === 'Completed' ? 'completed'
                            : s.sale_status === 'Cancelled' ? 'cancelled'
                                : 'completed',
                        created_at:      s.created_at,
                        items: s.sale_items?.map((i: any) => ({
                            id:           i.sale_item_id,
                            product_name: i.product_name,
                            quantity:     parseFloat(i.quantity),
                            unit_price:   parseFloat(i.unit_price),
                            subtotal:     parseFloat(i.subtotal),
                        })) ?? [],
                    }));
                    setSales(mapped);
                }
            } catch {
                console.warn('API not reachable — using mock data');
            }
        }
        fetchSales();
    }, []);

    // ── Filter ────────────────────────────────────────
    const filtered = sales.filter(s => {
        const matchSearch = s.invoice_no.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ── Stats ─────────────────────────────────────────
    const completedSales = sales.filter(s => s.status === 'completed');
    const totalRevenue   = completedSales.reduce((sum, s) => sum + s.total_amount, 0);
    const cancelledCount = sales.filter(s => s.status === 'cancelled').length;

    // ── Cancel sale ───────────────────────────────────
    async function handleCancel(id: number) {
        if (!confirm('Cancel this sale?')) return;
        setCancelling(id);
        try {
            await cancelSale(id);
            setSales(prev =>
                prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s)
            );
            if (selectedSale?.id === id) {
                setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null);
            }
        } catch {
            console.warn('Cancel failed');
        } finally {
            setCancelling(null);
        }
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    return (
        <div className="flex h-full bg-gray-50 overflow-hidden">

            {/* ── Left: Sales list ── */}
            <div className="flex-1 flex flex-col overflow-hidden p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">All Sales</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{sales.length} total transactions</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <StatCard label="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} color="text-blue-600" />
                    <StatCard label="Completed"     value={String(completedSales.length)}          color="text-green-600" />
                    <StatCard label="Cancelled"     value={String(cancelledCount)}                 color="text-red-500" />
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by invoice number..."
                            className="pl-9 text-sm h-9"
                        />
                    </div>
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        {(['all', 'completed', 'cancelled'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`px-3 py-1 rounded-md text-xs font-medium capitalize cursor-pointer transition-colors
                  ${statusFilter === s
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">

                    {/* Table header */}
                    <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr_80px] px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        <span>Invoice</span>
                        <span>Date & Time</span>
                        <span>Payment</span>
                        <span>Amount</span>
                        <span>Status</span>
                        <span className="text-center">Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                                No sales found.
                            </div>
                        ) : (
                            filtered.map(sale => (
                                <div
                                    key={sale.id}
                                    onClick={() => setSelected(sale)}
                                    className={`grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr_80px] items-center px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors
                    ${selectedSale?.id === sale.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                                >
                                    <span className="text-sm font-semibold text-blue-600">{sale.invoice_no}</span>
                                    <span className="text-xs text-gray-500">{formatDate(sale.created_at)}</span>
                                    <Badge className={`text-[11px] border-0 w-fit ${PAYMENT_COLORS[sale.payment_method] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {sale.payment_method}
                                    </Badge>
                                    <span className="text-sm font-semibold text-gray-900">
                    Rs. {sale.total_amount.toLocaleString()}
                  </span>
                                    <Badge className={`text-[11px] border-0 w-fit capitalize
                    ${sale.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                        {sale.status}
                                    </Badge>
                                    <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setSelected(sale)}
                                            className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                                        >
                                            <Eye size={15} />
                                        </button>
                                        {sale.status === 'completed' && (
                                            <button
                                                onClick={() => handleCancel(sale.id)}
                                                disabled={cancelling === sale.id}
                                                className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-40"
                                            >
                                                <XCircle size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Right: Detail panel ── */}
            <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0">
                {selectedSale ? (
                    <>
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{selectedSale.invoice_no}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{formatDate(selectedSale.created_at)}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <XCircle size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                Items ({selectedSale.items.length})
                            </p>
                            <div className="space-y-3">
                                {selectedSale.items.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-900">{item.product_name}</p>
                                            <p className="text-[11px] text-gray-400">
                                                Rs. {item.unit_price.toLocaleString()} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-900">
                                            Rs. {item.subtotal.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                            <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>Rs. {(selectedSale.total_amount + selectedSale.discount_amount - selectedSale.tax_amount).toLocaleString()}</span>
                                </div>
                                {selectedSale.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>− Rs. {selectedSale.discount_amount.toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedSale.tax_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>Rs. {selectedSale.tax_amount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1">
                                    <span>Total</span>
                                    <span>Rs. {selectedSale.total_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-1">
                                <Badge className={`text-[11px] border-0 ${PAYMENT_COLORS[selectedSale.payment_method] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {selectedSale.payment_method}
                                </Badge>
                                <Badge className={`text-[11px] border-0 capitalize
                  ${selectedSale.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {selectedSale.status}
                                </Badge>
                            </div>

                            {selectedSale.status === 'completed' && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleCancel(selectedSale.id)}
                                    disabled={cancelling === selectedSale.id}
                                    className="w-full mt-3 text-red-500 border-red-200 hover:bg-red-50 text-xs h-8 cursor-pointer"
                                >
                                    <XCircle size={13} className="mr-1.5" />
                                    {cancelling === selectedSale.id ? 'Cancelling...' : 'Cancel Sale'}
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <Eye size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Select a sale</p>
                            <p className="text-xs mt-1">Click any row to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
    );
}