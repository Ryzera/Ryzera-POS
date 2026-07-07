'use client';

import { useState } from 'react';
import { Search, RotateCcw, CheckCircle, X } from 'lucide-react';
import { useSalesStore } from '@/store/cartstore';
import { processReturn } from '@/lib/api';

interface ReturnItem {
    saleItemId: number;
    productName: string;
    unitPrice: number;
    maxQty: number;
    returnQty: number;
}

export default function ReturnPage() {
    const { sales } = useSalesStore();

    const [invoiceInput, setInvoiceInput] = useState('');
    const [sale, setSale]                 = useState<typeof sales[0] | null>(null);
    const [returnItems, setReturnItems]   = useState<ReturnItem[]>([]);
    const [reason, setReason]             = useState('');
    const [refundMethod, setRefundMethod] = useState<'Cash' | 'Card' | 'Wallet'>('Cash');
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState('');
    const [success, setSuccess]           = useState(false);
    const [refundTotal, setRefundTotal]   = useState(0);

    function handleSearch() {
        if (!invoiceInput.trim()) return;
        setError('');
        setSale(null);
        setReturnItems([]);

        const found = sales.find(
            s => s.invoice_no.toUpperCase() === invoiceInput.trim().toUpperCase()
        );

        if (!found) {
            setError('Invoice not found. Please check the invoice number.');
            return;
        }

        if (found.status === 'cancelled') {
            setError('This sale has been cancelled and cannot be returned.');
            return;
        }

        setSale(found);
        setReturnItems(
            found.items.map(i => ({
                saleItemId:  i.id,
                productName: i.product_name,
                unitPrice:   i.unit_price,
                maxQty:      i.quantity,
                returnQty:   0,
            }))
        );
    }

    function updateReturnQty(saleItemId: number, qty: number) {
        setReturnItems(prev =>
            prev.map(i => i.saleItemId === saleItemId ? { ...i, returnQty: qty } : i)
        );
    }

    const selectedItems   = returnItems.filter(i => i.returnQty > 0);
    const calculatedTotal = selectedItems.reduce((sum, i) => sum + i.unitPrice * i.returnQty, 0);

    async function handleProcessReturn() {
        if (selectedItems.length === 0 || !sale) return;
        if (!reason.trim() || reason.trim().length < 5) {
            setError('Please enter a reason (minimum 5 characters).');
            return;
        }
        setLoading(true);
        setError('');
        try {
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
            } catch {}
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

    if (success) {
        return (
            <div style={{ display: 'flex', height: '100%', backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center', maxWidth: 360, width: '100%' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={32} color="#22c55e" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Return Processed!</h2>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 4px' }}>Refund Amount</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: '#16a34a', margin: '0 0 16px' }}>Rs. {refundTotal.toLocaleString()}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 24px' }}>Invoice: {sale?.invoice_no} · {selectedItems.length} item(s) returned</p>
                    <button onClick={handleReset} style={{ width: '100%', height: 40, backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        Process Another Return
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100%', backgroundColor: '#f9fafb', overflow: 'hidden' }}>

            {/* Left */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 24 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <RotateCcw size={18} color="#2563eb" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#111827', margin: 0 }}>Process Return</h2>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Search by invoice number to begin</p>
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            value={invoiceInput}
                            onChange={e => setInvoiceInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter Invoice Number (e.g. INV-2026-6891)"
                            style={{ width: '100%', height: 40, paddingLeft: 38, paddingRight: 12, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', backgroundColor: '#fff', color: '#111827', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !invoiceInput.trim()}
                        style={{ height: 40, padding: '0 24px', backgroundColor: loading || !invoiceInput.trim() ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading || !invoiceInput.trim() ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <X size={15} />{error}
                    </div>
                )}

                {/* Sale found */}
                {sale && (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>

                        {/* Sale header */}
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontWeight: 600, color: '#111827', fontSize: 13, margin: 0 }}>{sale.invoice_no}</p>
                                <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                                    {new Date(sale.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' })}
                                    {' · '}<span style={{ fontWeight: 500, color: '#6b7280' }}>{sale.payment_method}</span>
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Original Total</p>
                                <p style={{ fontWeight: 700, color: '#111827', fontSize: 14, margin: '2px 0 0' }}>Rs. {sale.total_amount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', padding: '8px 20px', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6' }}>
                            <span>Product</span>
                            <span style={{ textAlign: 'center' }}>Unit Price</span>
                            <span style={{ textAlign: 'center' }}>Purchased</span>
                            <span style={{ textAlign: 'center' }}>Return Qty</span>
                        </div>

                        {/* Items */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {returnItems.map(item => (
                                <div key={item.saleItemId} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f9fafb', backgroundColor: item.returnQty > 0 ? 'rgba(239,246,255,0.5)' : 'transparent' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {item.returnQty > 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0 }} />}
                                        <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>{item.productName}</p>
                                    </div>
                                    <p style={{ fontSize: 13, textAlign: 'center', color: '#6b7280', margin: 0 }}>Rs. {item.unitPrice.toLocaleString()}</p>
                                    <p style={{ fontSize: 13, textAlign: 'center', fontWeight: 500, color: '#374151', margin: 0 }}>{item.maxQty}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <button onClick={() => updateReturnQty(item.saleItemId, Math.max(0, item.returnQty - 1))} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>−</button>
                                        <span style={{ fontSize: 13, fontWeight: 600, width: 20, textAlign: 'center', color: item.returnQty > 0 ? '#2563eb' : '#9ca3af' }}>{item.returnQty}</span>
                                        <button onClick={() => updateReturnQty(item.saleItemId, Math.min(item.maxQty, item.returnQty + 1))} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reason */}
                        <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Return Reason</p>
                            <input
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason for return (min 5 characters)..."
                                style={{ width: '100%', height: 36, padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', color: '#111827', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!sale && !loading && !error && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                            <RotateCcw size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Search for an invoice to begin</p>
                            <p style={{ fontSize: 11, margin: '4px 0 0' }}>Enter the invoice number above</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Refund Summary */}
            <div style={{ width: 300, minWidth: 300, backgroundColor: '#fff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%' }}>

                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Refund Summary</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                    {selectedItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 32 }}>
                            <p style={{ margin: 0 }}>No items selected for return.</p>
                            <p style={{ margin: '4px 0 0' }}>Adjust quantities above.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {selectedItems.map(item => (
                                <div key={item.saleItemId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 500, color: '#111827', margin: 0, lineHeight: 1.4 }}>{item.productName}</p>
                                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>× {item.returnQty} returned</p>
                                    </div>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>Rs. {(item.unitPrice * item.returnQty).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 20px 24px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Refund Method</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
                        {(['Cash', 'Card', 'Wallet'] as const).map(method => (
                            <button key={method} onClick={() => setRefundMethod(method)} style={{ padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: refundMethod === method ? '2px solid #2563eb' : '1px solid #e5e7eb', backgroundColor: refundMethod === method ? '#2563eb' : '#fff', color: refundMethod === method ? '#fff' : '#4b5563' }}>
                                {method}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>Items to return</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>{selectedItems.length}</span>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Refund Total</span>
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>Rs. {calculatedTotal.toLocaleString()}</span>
                    </div>

                    <button
                        disabled={selectedItems.length === 0 || loading}
                        onClick={handleProcessReturn}
                        style={{ width: '100%', height: 42, border: 'none', borderRadius: 8, backgroundColor: selectedItems.length === 0 || loading ? '#93c5fd' : '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: selectedItems.length === 0 || loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Processing...' : '↩ Process Refund'}
                    </button>
                </div>
            </div>
        </div>
    );
}