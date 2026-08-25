'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartstore';
import { useSalesStore } from '@/store/cartstore';
import { useAuthStore } from '@/store/auth.store';
import { X, Printer, CheckCircle } from 'lucide-react';
import { createSale, processPayment } from '@/lib/api';

interface Props {
    onClose: () => void;
    itemDiscounts?: Record<string, number>;
}

export default function PaymentModal({ onClose, itemDiscounts = {} }: Props) {
    const { user } = useAuthStore();
    const {
        items, invoiceNo, discount, taxRate, paymentMethod,
        getSubtotal, getDiscountAmount, getTaxAmount, getTotal, clearCart,
    } = useCartStore();

    const addSale = useSalesStore(s => s.addSale);

    const [cashReceived, setCashReceived] = useState('');
    const [confirmed, setConfirmed]       = useState(false);
    const [processing, setProcessing]     = useState(false);
    const [apiError, setApiError]         = useState('');

    const hasItemDiscounts = Object.keys(itemDiscounts).length > 0;

    const total_    = getTotal();
    const subtotal  = getSubtotal();
    const itemDiscountTotal = items.reduce((sum, { product, quantity }) => {
        const pct = itemDiscounts[product.id] ?? 0;
        return sum + (product.price * quantity * pct) / 100;
    }, 0);
    const discAmt   = hasItemDiscounts ? itemDiscountTotal : getDiscountAmount();
    const taxAmt    = hasItemDiscounts
        ? ((subtotal - itemDiscountTotal) * taxRate) / 100
        : getTaxAmount();
    const total     = hasItemDiscounts ? subtotal - itemDiscountTotal + taxAmt : total_;
    const change    = paymentMethod === 'Cash' ? (parseFloat(cashReceived) || 0) - total : 0;
    const canConfirm = paymentMethod !== 'Cash' || parseFloat(cashReceived) >= total;

    // Real dynamic user & branch
    const currentBranchId = user?.branch_id ? Number(user.branch_id) : 1;
    const currentUserId   = (user as any)?.id ?? (user as any)?.user_id ?? 1;
    const cashierName     = user?.info?.first_name
        ? `${user.info.first_name} ${user.info.last_name || ''}`.trim()
        : user?.username || 'Cashier';

    async function handleConfirm() {
        setProcessing(true);
        setApiError('');
        try {
            // 1. Save sale to database
            const sale = await createSale({
                branch_id: currentBranchId,
                user_id: currentUserId,
                invoice_number: invoiceNo,
                discount_type: hasItemDiscounts ? 'item' : (discount > 0 ? 'bill' : 'item'),
                bill_discount_percent: hasItemDiscounts
                    ? undefined
                    : (discount > 0 ? discount : undefined),
                items: items.map(({ product, quantity }) => ({
                    product_id: parseInt(product.id, 10) || 1,
                    product_name: product.name,
                    quantity,
                    unit: 'pcs',
                    unit_price: product.price,
                    cost_price: product.price,
                    discount_percent: hasItemDiscounts ? (itemDiscounts[product.id] ?? 0) : 0,
                    tax_percent: taxRate,
                })),
            });

            const saleId = sale?.sale_id ?? sale?.id ?? Math.floor(Math.random() * 9000) + 1000;

            // 2. Process payment in database
            await processPayment({
                sale_id: saleId,
                payment_method: paymentMethod.toUpperCase(),
                amount_paid: paymentMethod === 'Cash' ? parseFloat(cashReceived) : total,
                transaction_reference: '',
            });

            // 3. Record in local store for immediate UI update
            addSale({
                id: saleId,
                invoice_no: invoiceNo,
                total_amount: total,
                discount_amount: discAmt,
                tax_amount: taxAmt,
                payment_method: paymentMethod,
                status: 'completed',
                created_at: new Date().toISOString(),
                cashier_name: cashierName,
                items: items.map(({ product, quantity }, idx) => ({
                    id: idx + 1,
                    product_name: product.name,
                    quantity,
                    unit_price: product.price,
                    subtotal: product.price * quantity,
                })),
            });

            setConfirmed(true);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ??
                err?.message ??
                'Payment failed. Please try again.';
            setApiError(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setProcessing(false);
        }
    }

    function handleNewSale() {
        clearCart();
        onClose();
    }

    if (confirmed) {
        return (
            <ModalWrapper onClose={handleNewSale}>
                <ReceiptView
                    invoiceNo={invoiceNo} items={items}
                    subtotal={subtotal} discAmt={discAmt} taxAmt={taxAmt}
                    taxRate={taxRate} discount={discount} total={total}
                    paymentMethod={paymentMethod}
                    cashReceived={parseFloat(cashReceived) || 0}
                    change={change}
                    onNewSale={handleNewSale} onPrint={() => window.print()}
                />
            </ModalWrapper>
        );
    }

    return (
        <ModalWrapper onClose={onClose}>
            <div style={{ width: '420px', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ background: '#2563eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: '15px', margin: 0 }}>Complete Payment</h2>
                        <p style={{ color: '#bfdbfe', fontSize: '11px', margin: '2px 0 0' }}>{invoiceNo}</p>
                    </div>
                    <button onClick={onClose} disabled={processing} style={{ background: 'none', border: 'none', color: '#bfdbfe', cursor: 'pointer', padding: 0 }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '20px 24px' }}>
                    {/* Order summary */}
                    <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Order Summary</p>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {items.map(({ product, quantity }) => (
                                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: '#4b5563' }}>{product.name} × {quantity}</span>
                                    <span style={{ fontWeight: 500, color: '#111827' }}>Rs. {(product.price * quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                                <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            {discAmt > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16a34a' }}>
                                    <span>{hasItemDiscounts ? 'Item Discount(s)' : `Discount (${discount}%)`}</span><span>− Rs. {discAmt.toLocaleString()}</span>
                                </div>
                            )}
                            {taxAmt > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                                    <span>Tax ({taxRate}%)</span><span>Rs. {taxAmt.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>Total</span>
                            <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '20px' }}>Rs. {total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment method */}
                    <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Payment Method</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            {(['Cash', 'Card', 'Split'] as const).map(m => (
                                <div key={m} style={{ padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, border: paymentMethod === m ? '2px solid #2563eb' : '1px solid #e5e7eb', background: paymentMethod === m ? '#2563eb' : '#fff', color: paymentMethod === m ? '#fff' : '#9ca3af' }}>
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cash received */}
                    {paymentMethod === 'Cash' && (
                        <div style={{ marginBottom: '14px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Cash Received</p>
                            <input
                                type="number"
                                placeholder={`Minimum Rs. ${total.toLocaleString()}`}
                                value={cashReceived}
                                onChange={e => setCashReceived(e.target.value)}
                                autoFocus
                                disabled={processing}
                                style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                            />
                            {parseFloat(cashReceived) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', fontWeight: 600, color: change >= 0 ? '#16a34a' : '#dc2626' }}>
                                    <span>Change</span>
                                    <span>Rs. {change >= 0 ? change.toLocaleString() : `${Math.abs(change).toLocaleString()} short`}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {apiError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <X size={13} />{apiError}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onClose} disabled={processing} style={{ flex: 1, height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button
                            disabled={!canConfirm || processing}
                            onClick={handleConfirm}
                            style={{ flex: 1, height: '40px', border: 'none', borderRadius: '8px', background: !canConfirm || processing ? '#93c5fd' : '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: !canConfirm || processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            {processing ? 'Processing...' : <><CheckCircle size={15} /> Confirm Payment</>}
                        </button>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}

interface ReceiptProps {
    invoiceNo: string;
    items: { product: { id: string; name: string; price: number }; quantity: number }[];
    subtotal: number; discAmt: number; taxAmt: number; taxRate: number;
    discount: number; total: number; paymentMethod: string;
    cashReceived: number; change: number;
    onNewSale: () => void; onPrint: () => void;
}

function ReceiptView({ invoiceNo, items, subtotal, discAmt, taxAmt, taxRate, discount, total, paymentMethod, cashReceived, change, onNewSale, onPrint }: ReceiptProps) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ width: '380px', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#22c55e', padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <CheckCircle size={26} color="#fff" />
                </div>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '17px', margin: 0 }}>Payment Successful!</h2>
                <p style={{ color: '#dcfce7', fontSize: '11px', margin: '4px 0 0' }}>{invoiceNo}</p>
            </div>
            <div style={{ padding: '20px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: '15px', margin: 0 }}>Ryzera POS</p>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0' }}>Colombo Main Branch</p>
                    <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>{dateStr} · {timeStr}</p>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {items.map(({ product, quantity }) => (
                        <div key={product.id} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 70px', fontSize: '12px' }}>
                            <span style={{ color: '#374151' }}>{product.name}</span>
                            <span style={{ textAlign: 'center', color: '#6b7280' }}>{quantity}</span>
                            <span style={{ textAlign: 'right', fontWeight: 500, color: '#111827' }}>Rs. {(product.price * quantity).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                    {discAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16a34a' }}><span>Discount ({discount}%)</span><span>− Rs. {discAmt.toLocaleString()}</span></div>}
                    {taxAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}><span>Tax ({taxRate}%)</span><span>Rs. {taxAmt.toLocaleString()}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#111827', paddingTop: '4px' }}><span>Total</span><span>Rs. {total.toLocaleString()}</span></div>
                    {paymentMethod === 'Cash' && <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}><span>Cash Received</span><span>Rs. {cashReceived.toLocaleString()}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500, color: '#16a34a' }}><span>Change</span><span>Rs. {change.toLocaleString()}</span></div>
                    </>}
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>Payment: <span style={{ fontWeight: 500, color: '#4b5563' }}>{paymentMethod}</span></p>
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', marginTop: '6px' }}>Thank you for your purchase! 🙏</p>
            </div>
            <div style={{ padding: '0 24px 20px', display: 'flex', gap: '8px' }}>
                <button onClick={onPrint} style={{ flex: 1, height: '40px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Printer size={14} /> Print
                </button>
                <button onClick={onNewSale} style={{ flex: 1, height: '40px', border: 'none', borderRadius: '8px', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    New Sale
                </button>
            </div>
        </div>
    );
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()}>{children}</div>
        </div>
    );
}