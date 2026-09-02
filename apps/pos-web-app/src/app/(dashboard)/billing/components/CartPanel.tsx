'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartstore';
import PaymentModal from './PaymentModal';
import { CURRENT_BRANCH_ID } from '@/lib/constants';
import api, { extractArray } from '@/lib/api';

interface DiscountRule {
    discount_rule_id: number;
    scope: 'GLOBAL' | 'BRANCH';
    scope_label: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    max_percent: number | null;
    max_amount: number | null;
    description: string | null;
    valid_until: string;
}

interface CartPanelProps {
    onPaymentSuccess?: () => void;
    // Explicit branch to check out against — set by the admin's branch
    // filter on the billing page. When undefined, PaymentModal falls back
    // to the logged-in user's own assigned branch.
    checkoutBranchId?: string | number;
    // True when an admin has "All Branches" selected — checkout is
    // ambiguous in that state, so PaymentModal should block it with a
    // clear message rather than silently guessing a branch.
    requireBranchSelection?: boolean;
}

export default function CartPanel({ onPaymentSuccess, checkoutBranchId, requireBranchSelection }: CartPanelProps) {
    const {
        items, invoiceNo, discount, taxRate, paymentMethod,
        updateQuantity, removeItem, setDiscount, setTaxRate,
        setPaymentMethod, clearCart,
        getSubtotal, getDiscountAmount, getTaxAmount, getTotal,
    } = useCartStore();

    const [discountInput, setDiscountInput] = useState('');
    const [showModal, setShowModal]         = useState(false);

    const [availableDiscounts, setAvailableDiscounts] = useState<DiscountRule[]>([]);
    const [discountsLoading, setDiscountsLoading]       = useState(true);
    const [selectedRuleId, setSelectedRuleId]           = useState<number | null>(null);

    // Per-item discount % keyed by product.id.
    const [itemDiscounts, setItemDiscounts] = useState<Record<string, number>>({});

    function setItemDiscount(productId: string, value: string) {
        const pct = parseFloat(value);
        setItemDiscounts(prev => {
            const next = { ...prev };
            if (!value || isNaN(pct) || pct <= 0) {
                delete next[productId];
            } else {
                next[productId] = pct;
            }
            return next;
        });
    }

    const hasItemDiscounts = Object.keys(itemDiscounts).length > 0;

    useEffect(() => {
        if (!invoiceNo) {
            const year = new Date().getFullYear();
            const num  = Math.floor(Math.random() * 9000) + 1000;
            useCartStore.getState().setInvoiceNo(
                `INV-${year}-${String(num).padStart(4, '0')}`
            );
        }
    }, [invoiceNo]);

    // Fetch active GLOBAL + BRANCH discount rules safely
    useEffect(() => {
        let cancelled = false;

        async function loadDiscounts() {
            setDiscountsLoading(true);
            try {
                // Try via unified axios client with auth
                const res = await api.get(`/billing/discounts/branch/${CURRENT_BRANCH_ID}`);
                const rules = extractArray<DiscountRule>(res.data);
                if (!cancelled) setAvailableDiscounts(rules);
            } catch {
                try {
                    // Fallback to fetch if needed
                    const res = await fetch(
                        `http://localhost:3000/api/billing/discounts/branch/${CURRENT_BRANCH_ID}`
                    );
                    if (!res.ok) throw new Error('Failed to load discounts');
                    const json = await res.json();
                    const list = Array.isArray(json)
                        ? json
                        : Array.isArray(json?.data)
                            ? json.data
                            : Array.isArray(json?.discounts)
                                ? json.discounts
                                : [];
                    if (!cancelled) setAvailableDiscounts(list);
                } catch {
                    if (!cancelled) setAvailableDiscounts([]);
                }
            } finally {
                if (!cancelled) setDiscountsLoading(false);
            }
        }

        loadDiscounts();
        return () => { cancelled = true; };
    }, []);

    function applyRule(rule: DiscountRule) {
        if (rule.max_percent == null) return;
        setSelectedRuleId(rule.discount_rule_id);
        setDiscountInput(String(rule.max_percent));
        setDiscount(rule.max_percent);
    }

    function handleManualDiscountChange(value: string) {
        setSelectedRuleId(null);
        setDiscountInput(value);
        setDiscount(parseFloat(value) || 0);
    }

    const subtotal = getSubtotal();

    const itemDiscountTotal = items.reduce((sum, { product, quantity }) => {
        const pct = itemDiscounts[product.id] ?? 0;
        return sum + (product.price * quantity * pct) / 100;
    }, 0);

    const discAmt  = hasItemDiscounts ? itemDiscountTotal : getDiscountAmount();
    const taxAmt   = hasItemDiscounts
        ? ((subtotal - itemDiscountTotal) * taxRate) / 100
        : getTaxAmount();
    const total    = hasItemDiscounts
        ? subtotal - itemDiscountTotal + taxAmt
        : getTotal();

    const safeDiscounts = Array.isArray(availableDiscounts) ? availableDiscounts : [];

    function handleModalClose() {
        setShowModal(false);
    }

    return (
        <>
            {showModal && (
                <PaymentModal
                    onClose={() => {
                        handleModalClose();
                        onPaymentSuccess?.();
                    }}
                    itemDiscounts={itemDiscounts}
                    checkoutBranchId={checkoutBranchId}
                    requireBranchSelection={requireBranchSelection}
                />
            )}

            <div style={{
                width: '340px', minWidth: '340px', background: '#fff',
                borderLeft: '1px solid #e5e7eb',
                display: 'flex', flexDirection: 'column',
                height: '100%', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        Transaction Process
                    </span>
                    <span style={{
                        fontSize: '11px', fontWeight: 600, color: '#2563eb',
                        background: '#eff6ff', padding: '2px 8px', borderRadius: '6px',
                    }}>
                        {invoiceNo}
                    </span>
                </div>

                {/* Column headers */}
                {items.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 70px',
                        padding: '6px 20px',
                        fontSize: '10px', fontWeight: 600,
                        color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em',
                        borderBottom: '1px solid #f3f4f6',
                        flexShrink: 0,
                    }}>
                        <span>Item</span>
                        <span style={{ textAlign: 'center' }}>Qty</span>
                        <span style={{ textAlign: 'right' }}>Price</span>
                    </div>
                )}

                {/* Cart items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '48px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛒</div>
                            <p style={{ fontSize: '13px' }}>No items added yet.</p>
                            <p style={{ fontSize: '11px', marginTop: '4px' }}>Click a product to add.</p>
                        </div>
                    ) : (
                        items.map(({ product, quantity }) => (
                            <div key={product.id} style={{
                                padding: '10px 0',
                                borderBottom: '1px solid #f9fafb',
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 80px 70px',
                                    alignItems: 'center',
                                }}>
                                    <div>
                                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#111827', lineHeight: 1.3 }}>
                                            {product.name}
                                        </p>
                                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                                            Rs. {product.price.toLocaleString()} each
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <button
                                            onClick={() => updateQuantity(product.id, quantity - 1)}
                                            style={{
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                border: '1px solid #e5e7eb', background: '#f9fafb',
                                                color: '#374151', fontSize: '14px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >−</button>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827', width: '16px', textAlign: 'center' }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(product.id, quantity + 1)}
                                            style={{
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                border: '1px solid #e5e7eb', background: '#f9fafb',
                                                color: '#374151', fontSize: '14px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >+</button>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                                            Rs.{(product.price * quantity).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => removeItem(product.id)}
                                            style={{ color: '#d1d5db', fontSize: '11px', cursor: 'pointer', background: 'none', border: 'none' }}
                                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f87171'}
                                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'}
                                        >✕</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>Item discount:</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={itemDiscounts[product.id] ?? ''}
                                        onChange={e => setItemDiscount(product.id, e.target.value)}
                                        style={{
                                            width: '48px', height: '22px', padding: '0 6px',
                                            border: '1px solid #e5e7eb', borderRadius: '5px',
                                            fontSize: '11px', outline: 'none',
                                        }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>%</span>
                                    {(itemDiscounts[product.id] ?? 0) > 0 && (
                                        <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>
                                            − Rs. {(product.price * quantity * (itemDiscounts[product.id] ?? 0) / 100).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Available Discounts */}
                <div style={{ padding: '12px 20px 0', borderTop: '1px solid #f3f4f6', flexShrink: 0, opacity: hasItemDiscounts ? 0.4 : 1, pointerEvents: hasItemDiscounts ? 'none' : 'auto' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        Available Discounts {hasItemDiscounts && '(disabled — item discount in use)'}
                    </p>
                    {discountsLoading ? (
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Loading…</p>
                    ) : safeDiscounts.length === 0 ? (
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>No active discounts for this branch.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                            {safeDiscounts.map(rule => (
                                <button
                                    key={rule.discount_rule_id}
                                    onClick={() => applyRule(rule)}
                                    title={rule.description ?? undefined}
                                    style={{
                                        padding: '6px 10px', borderRadius: '999px',
                                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                        border: selectedRuleId === rule.discount_rule_id
                                            ? '1.5px solid #16a34a' : '1px solid #e5e7eb',
                                        background: selectedRuleId === rule.discount_rule_id
                                            ? '#f0fdf4' : '#fff',
                                        color: selectedRuleId === rule.discount_rule_id
                                            ? '#16a34a' : '#374151',
                                    }}
                                >
                                    {rule.scope === 'GLOBAL' ? '🌐' : '🏪'} {rule.max_percent}%
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Discount + Tax */}
                <div style={{ padding: '4px 20px 8px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', opacity: hasItemDiscounts ? 0.4 : 1, pointerEvents: hasItemDiscounts ? 'none' : 'auto' }}>
                        <input
                            placeholder="Bill discount"
                            value={discountInput}
                            onChange={e => handleManualDiscountChange(e.target.value)}
                            disabled={hasItemDiscounts}
                            style={{
                                flex: 1, height: '32px', padding: '0 10px',
                                border: '1px solid #e5e7eb', borderRadius: '6px',
                                fontSize: '12px', outline: 'none',
                            }}
                        />
                        <span style={{
                            height: '32px', padding: '0 10px',
                            background: '#f3f4f6', borderRadius: '6px',
                            fontSize: '12px', color: '#6b7280',
                            display: 'flex', alignItems: 'center',
                        }}>%</span>
                        <select
                            value={String(taxRate)}
                            onChange={e => setTaxRate(parseFloat(e.target.value))}
                            style={{
                                width: '95px', height: '32px', padding: '0 8px',
                                border: '1px solid #e5e7eb', borderRadius: '6px',
                                fontSize: '12px', outline: 'none', background: '#fff',
                            }}
                        >
                            <option value="0">No Tax</option>
                            <option value="8">VAT 8%</option>
                            <option value="10">VAT 10%</option>
                            <option value="15">VAT 15%</option>
                        </select>
                    </div>

                    {/* Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                            <span>Subtotal</span>
                            <span>Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        {discAmt > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16a34a' }}>
                                <span>{hasItemDiscounts ? 'Item Discount(s)' : `Discount (${discount}%)`}</span>
                                <span>− Rs. {discAmt.toLocaleString()}</span>
                            </div>
                        )}
                        {taxAmt > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                                <span>Tax ({taxRate}%)</span>
                                <span>Rs. {taxAmt.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>Total Amount</span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                            Rs. {total.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Payment method */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        Payment Method
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                        {(['Cash', 'Card', 'Split'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                style={{
                                    padding: '8px', borderRadius: '8px',
                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                    border: paymentMethod === method ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                    background: paymentMethod === method ? '#2563eb' : '#fff',
                                    color: paymentMethod === method ? '#fff' : '#4b5563',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button
                        onClick={() => {
                            clearCart();
                            setDiscountInput('');
                            setSelectedRuleId(null);
                            setItemDiscounts({});
                        }}
                        style={{
                            width: '100%', height: '36px',
                            border: '1px solid #e5e7eb', borderRadius: '8px',
                            background: '#fff', color: '#6b7280',
                            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        }}
                    >
                        Void / Clear Sale
                    </button>
                    <button
                        disabled={items.length === 0}
                        onClick={() => setShowModal(true)}
                        style={{
                            width: '100%', height: '44px',
                            border: 'none', borderRadius: '10px',
                            background: items.length === 0 ? '#93c5fd' : '#2563eb',
                            color: '#fff', fontSize: '14px', fontWeight: 700,
                            cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.05em',
                        }}
                    >
                        ✓ CONFIRM
                    </button>
                </div>
            </div>
        </>
    );
}
