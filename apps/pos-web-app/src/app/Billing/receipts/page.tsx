'use client';

import { useState } from 'react';
import { Search, Printer, Eye, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ── Types ─────────────────────────────────────────────
interface ReceiptItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Receipt {
    id: number;
    invoice_no: string;
    total_amount: number;
    discount_amount: number;
    tax_amount: number;
    payment_method: 'Cash' | 'Card' | 'Split';
    created_at: string;
    cashier_name: string;
    items: ReceiptItem[];
}

// ── Mock data ─────────────────────────────────────────
const MOCK_RECEIPTS: Receipt[] = [
    {
        id: 1,
        invoice_no: 'INV-2026-8380',
        total_amount: 3080,
        discount_amount: 0,
        tax_amount: 0,
        payment_method: 'Cash',
        created_at: new Date().toISOString(),
        cashier_name: 'Hiruni',
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
        created_at: new Date(Date.now() - 3600000).toISOString(),
        cashier_name: 'Kasun',
        items: [
            { id: 4, product_name: 'Wireless Earbuds', quantity: 1, unit_price: 4500, subtotal: 4500 },
            { id: 5, product_name: 'USB-C Cable 2m',   quantity: 2, unit_price: 650,  subtotal: 1300 },
        ],
    },
    {
        id: 3,
        invoice_no: 'INV-2026-3309',
        total_amount: 1850,
        discount_amount: 0,
        tax_amount: 280,
        payment_method: 'Split',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        cashier_name: 'Hiruni',
        items: [
            { id: 6, product_name: 'Coconut Oil 1L',    quantity: 2, unit_price: 580, subtotal: 1160 },
            { id: 7, product_name: 'Dish Soap 500ml',   quantity: 2, unit_price: 190, subtotal: 380  },
            { id: 8, product_name: 'Floor Cleaner 1L',  quantity: 1, unit_price: 275, subtotal: 275  },
        ],
    },
];

const PAYMENT_COLORS: Record<string, string> = {
    Cash:  'bg-green-50 text-green-700',
    Card:  'bg-blue-50 text-blue-700',
    Split: 'bg-purple-50 text-purple-700',
};

export default function ReceiptsPage() {
    const [search, setSearch]         = useState('');
    const [selected, setSelected]     = useState<Receipt | null>(null);

    const filtered = MOCK_RECEIPTS.filter(r =>
        r.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
        r.cashier_name.toLowerCase().includes(search.toLowerCase())
    );

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    function handlePrint() {
        window.print();
    }

    return (
        <>
            {/* Print styles — receipt only print වෙනවා */}
            <style>{`
        @media print {
          body > * { display: none !important; }
          #receipt-print-area { display: block !important; }
        }
        #receipt-print-area { display: none; }
      `}</style>

            {/* Hidden print area */}
            {selected && (
                <div id="receipt-print-area" className="p-8 max-w-sm mx-auto font-mono text-sm">
                    <div className="text-center mb-4">
                        <p className="font-bold text-lg">Ryzera POS</p>
                        <p className="text-xs">Colombo Main Branch</p>
                        <p className="text-xs">{formatDate(selected.created_at)}</p>
                        <p className="text-xs mt-1">Invoice: {selected.invoice_no}</p>
                        <p className="text-xs">Cashier: {selected.cashier_name}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-400 my-2" />
                    {selected.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs py-0.5">
                            <span>{item.product_name} x{item.quantity}</span>
                            <span>Rs. {item.subtotal.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="border-t border-dashed border-gray-400 my-2" />
                    {selected.discount_amount > 0 && (
                        <div className="flex justify-between text-xs">
                            <span>Discount</span>
                            <span>- Rs. {selected.discount_amount.toLocaleString()}</span>
                        </div>
                    )}
                    {selected.tax_amount > 0 && (
                        <div className="flex justify-between text-xs">
                            <span>Tax</span>
                            <span>Rs. {selected.tax_amount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold mt-1">
                        <span>TOTAL</span>
                        <span>Rs. {selected.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-400 my-2" />
                    <p className="text-center text-xs">Payment: {selected.payment_method}</p>
                    <p className="text-center text-xs mt-2">Thank you! 🙏</p>
                </div>
            )}

            <div className="flex h-full bg-gray-50 overflow-hidden">

                {/* ── Left: Receipts list ── */}
                <div className="flex-1 flex flex-col overflow-hidden p-6">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <FileText size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Receipts</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{MOCK_RECEIPTS.length} receipts available</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by invoice or cashier name..."
                            className="pl-9 text-sm h-9"
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">

                        {/* Table header */}
                        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr_60px] px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                            <span>Invoice</span>
                            <span>Date & Time</span>
                            <span>Cashier</span>
                            <span>Payment</span>
                            <span>Amount</span>
                            <span className="text-center">View</span>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                                    No receipts found.
                                </div>
                            ) : (
                                filtered.map(receipt => (
                                    <div
                                        key={receipt.id}
                                        onClick={() => setSelected(receipt)}
                                        className={`grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr_60px] items-center px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors
                      ${selected?.id === receipt.id
                                            ? 'bg-blue-50/60'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    >
                    <span className="text-sm font-semibold text-blue-600">
                      {receipt.invoice_no}
                    </span>

                                        <span className="text-xs text-gray-500">
                      {formatDate(receipt.created_at)}
                    </span>

                                        <span className="text-xs text-gray-700 font-medium">
                      {receipt.cashier_name}
                    </span>

                                        <Badge className={`text-[11px] border-0 w-fit ${PAYMENT_COLORS[receipt.payment_method]}`}>
                                            {receipt.payment_method}
                                        </Badge>

                                        <span className="text-sm font-semibold text-gray-900">
                      Rs. {receipt.total_amount.toLocaleString()}
                    </span>

                                        <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setSelected(receipt)}
                                                className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right: Receipt detail ── */}
                <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0">
                    {selected ? (
                        <>
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-gray-200 shrink-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-sm font-semibold text-gray-900">{selected.invoice_no}</p>
                                    <Badge className={`text-[11px] border-0 ${PAYMENT_COLORS[selected.payment_method]}`}>
                                        {selected.payment_method}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400">{formatDate(selected.created_at)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Cashier: {selected.cashier_name}</p>
                            </div>

                            {/* Items */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                    Items ({selected.items.length})
                                </p>

                                {/* Receipt card — thermal style */}
                                <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs">
                                    <p className="text-center font-bold text-sm text-gray-900 mb-0.5">Ryzera POS</p>
                                    <p className="text-center text-gray-400 text-[10px] mb-3">Colombo Main Branch</p>

                                    <div className="border-t border-dashed border-gray-300 my-2" />

                                    {selected.items.map(item => (
                                        <div key={item.id} className="flex justify-between py-0.5">
                                            <span className="text-gray-700 flex-1 pr-2 leading-snug">{item.product_name}</span>
                                            <span className="text-gray-500 mr-2">×{item.quantity}</span>
                                            <span className="text-gray-900 font-medium">
                        Rs.{item.subtotal.toLocaleString()}
                      </span>
                                        </div>
                                    ))}

                                    <div className="border-t border-dashed border-gray-300 my-2" />

                                    <div className="space-y-0.5">
                                        {selected.discount_amount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>- Rs.{selected.discount_amount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selected.tax_amount > 0 && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>Tax</span>
                                                <span>Rs.{selected.tax_amount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-gray-900 text-sm pt-1">
                                            <span>TOTAL</span>
                                            <span>Rs.{selected.total_amount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed border-gray-300 my-2" />
                                    <p className="text-center text-gray-400 text-[10px]">Thank you! 🙏</p>
                                </div>
                            </div>

                            {/* Print button */}
                            <div className="px-5 pb-5 pt-3 shrink-0">
                                <Button
                                    onClick={handlePrint}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                >
                                    <Printer size={14} className="mr-2" />
                                    Print Receipt
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <FileText size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Select a receipt</p>
                                <p className="text-xs mt-1">Click any row to preview</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}