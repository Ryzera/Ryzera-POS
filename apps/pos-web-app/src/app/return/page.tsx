'use client';

import { useState } from 'react';
import { Search, RotateCcw, CheckCircle, X } from 'lucide-react';
import { Input }     from '@/components/ui/input';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { processReturn } from '@/lib/api';

interface SaleItem {
    id: number;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Sale {
    id: number;
    invoice_no: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    items: SaleItem[];
}

interface ReturnItem {
    saleItemId: number;
    productName: string;
    unitPrice: number;
    maxQty: number;
    returnQty: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ReturnPage() {
    const [invoiceInput, setInvoiceInput] = useState('');
    const [sale, setSale]                 = useState<Sale | null>(null);
    const [returnItems, setReturnItems]   = useState<ReturnItem[]>([]);
    const [reason, setReason]             = useState('');
    const [refundMethod, setRefundMethod] = useState<'Cash' | 'Card' | 'Wallet'>('Cash');
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState('');
    const [success, setSuccess]           = useState(false);
    const [refundTotal, setRefundTotal]   = useState(0);

    // ── Search sale by invoice number ─────────────────
    async function handleSearch() {
        if (!invoiceInput.trim()) return;
        setLoading(true);
        setError('');
        setSale(null);
        setReturnItems([]);

        try {
            const res = await fetch(
                `${API_URL}/api/billing/sales`,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (!res.ok) throw new Error('Server error');

            const allSales = await res.json();
            const found = allSales.find(
                (s: any) => s.invoice_number === invoiceInput.trim().toUpperCase()
            );

            if (!found) {
                setError('Invoice not found. Please check the invoice number.');
                return;
            }

            const mapped: Sale = {
                id:             found.sale_id,
                invoice_no:     found.invoice_number,
                total_amount:   parseFloat(found.total_amount),
                payment_method: found.payments?.[0]?.payment_method ?? 'Cash',
                created_at:     found.created_at,
                items: found.sale_items?.map((i: any) => ({
                    id:           i.sale_item_id,
                    product_id:   i.product_id,
                    product_name: i.product_name,
                    quantity:     parseFloat(i.quantity),
                    unit_price:   parseFloat(i.unit_price),
                    subtotal:     parseFloat(i.subtotal),
                })) ?? [],
            };

            setSale(mapped);
            setReturnItems(
                mapped.items.map(i => ({
                    saleItemId:  i.id,
                    productName: i.product_name,
                    unitPrice:   i.unit_price,
                    maxQty:      i.quantity,
                    returnQty:   0,
                }))
            );
        } catch {
            setError('Failed to connect to server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }

    function updateReturnQty(saleItemId: number, qty: number) {
        setReturnItems(prev =>
            prev.map(i => i.saleItemId === saleItemId ? { ...i, returnQty: qty } : i)
        );
    }

    const selectedItems   = returnItems.filter(i => i.returnQty > 0);
    const calculatedTotal = selectedItems.reduce(
        (sum, i) => sum + i.unitPrice * i.returnQty, 0
    );

    // ── Process return ────────────────────────────────
    async function handleProcessReturn() {
        if (selectedItems.length === 0 || !sale) return;
        if (!reason.trim() || reason.trim().length < 5) {
            setError('Please enter a reason (minimum 5 characters).');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await processReturn({
                sale_id:       sale.id,
                reason:        reason.trim(),
                refund_method: refundMethod,
                items: selectedItems.map(i => ({
                    sale_item_id:      i.saleItemId,
                    quantity_returned: i.returnQty,
                    item_condition:    'Good',
                })),
            });
            setRefundTotal(calculatedTotal);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to process return.');
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        setSale(null);
        setReturnItems([]);
        setInvoiceInput('');
        setReason('');
        setError('');
        setSuccess(false);
        setRefundTotal(0);
    }

    // ── Success screen ────────────────────────────────
    if (success) {
        return (
            <div className="flex h-full bg-gray-50 items-center justify-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center max-w-sm w-full">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Return Processed!</h2>
                    <p className="text-gray-500 text-sm mb-1">Refund Amount</p>
                    <p className="text-3xl font-bold text-green-600 mb-6">
                        Rs. {refundTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        Invoice: {sale?.invoice_no} · {selectedItems.length} item(s) returned
                    </p>
                    <Button
                        onClick={handleReset}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                        Process Another Return
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50 overflow-hidden">

            {/* ── Left ── */}
            <div className="flex-1 flex flex-col overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                        <RotateCcw size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Process Return</h2>
                        <p className="text-xs text-gray-400">Search by invoice number to begin</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={invoiceInput}
                            onChange={e => setInvoiceInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter Invoice Number (e.g. INV-1777351843695)"
                            className="pl-9 text-sm"
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={loading || !invoiceInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-6 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center gap-2">
                        <X size={15} />
                        {error}
                    </div>
                )}

                {/* Sale found */}
                {sale && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 flex flex-col">

                        {/* Sale header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{sale.invoice_no}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(sale.created_at).toLocaleDateString('en-US', {
                                        weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
                                    })}
                                    {' · '}
                                    <span className="font-medium text-gray-600">{sale.payment_method}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Original Total</p>
                                <p className="font-bold text-gray-900">Rs. {sale.total_amount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr_100px_100px_100px] px-5 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                            <span>Product</span>
                            <span className="text-center">Unit Price</span>
                            <span className="text-center">Purchased</span>
                            <span className="text-center">Return Qty</span>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto">
                            {returnItems.map(item => (
                                <div
                                    key={item.saleItemId}
                                    className={`grid grid-cols-[1fr_100px_100px_100px] items-center px-5 py-3.5 border-b border-gray-50 transition-colors
                                        ${item.returnQty > 0 ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {item.returnQty > 0 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        )}
                                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                    </div>
                                    <p className="text-sm text-center text-gray-500">
                                        Rs. {item.unitPrice.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-center font-medium text-gray-700">
                                        {item.maxQty}
                                    </p>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button
                                            onClick={() => updateReturnQty(item.saleItemId, Math.max(0, item.returnQty - 1))}
                                            className="w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 cursor-pointer text-sm"
                                        >−</button>
                                        <span className={`text-sm font-semibold w-5 text-center
                                            ${item.returnQty > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {item.returnQty}
                                        </span>
                                        <button
                                            onClick={() => updateReturnQty(item.saleItemId, Math.min(item.maxQty, item.returnQty + 1))}
                                            className="w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 cursor-pointer text-sm"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reason */}
                        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Return Reason
                            </p>
                            <Input
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason for return (min 5 characters)..."
                                className="text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!sale && !loading && !error && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <RotateCcw size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Search for an invoice to begin</p>
                            <p className="text-xs mt-1">Enter the invoice number above</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Right: Refund Summary ── */}
            <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0">

                <div className="px-5 py-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">Refund Summary</p>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {selectedItems.length === 0 ? (
                        <div className="text-center text-gray-400 text-xs mt-8">
                            <p>No items selected for return.</p>
                            <p className="mt-1">Adjust quantities above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedItems.map(item => (
                                <div key={item.saleItemId} className="flex justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-900 text-xs leading-snug">{item.productName}</p>
                                        <p className="text-[11px] text-gray-400">× {item.returnQty} returned</p>
                                    </div>
                                    <p className="font-semibold text-gray-900 text-xs">
                                        Rs. {(item.unitPrice * item.returnQty).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 shrink-0">

                    {/* Refund method */}
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Refund Method
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                        {(['Cash', 'Card', 'Wallet'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setRefundMethod(method)}
                                className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all
                                    ${refundMethod === method
                                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Items to return</span>
                        <Badge className="bg-blue-50 text-blue-600 border-0 text-[11px]">
                            {selectedItems.length}
                        </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-gray-900">Refund Total</span>
                        <span className="text-xl font-bold text-green-600">
                            Rs. {calculatedTotal.toLocaleString()}
                        </span>
                    </div>

                    <Button
                        disabled={selectedItems.length === 0 || loading}
                        onClick={handleProcessReturn}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : '↩ Process Refund'}
                    </Button>
                </div>
            </div>
        </div>
    );
}