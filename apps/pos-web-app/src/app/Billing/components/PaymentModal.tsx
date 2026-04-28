'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartstore';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { X, Printer, CheckCircle } from 'lucide-react';
import { createSale, processPayment } from '@/lib/api';

interface Props {
    onClose: () => void;
}

export default function PaymentModal({ onClose }: Props) {
    const {
        items, invoiceNo, discount, taxRate, paymentMethod,
        getSubtotal, getDiscountAmount, getTaxAmount, getTotal,
        clearCart,
    } = useCartStore();

    const [cashReceived, setCashReceived] = useState('');
    const [confirmed, setConfirmed]       = useState(false);
    const [processing, setProcessing]     = useState(false);
    const [apiError, setApiError]         = useState('');

    const total    = getTotal();
    const subtotal = getSubtotal();
    const discAmt  = getDiscountAmount();
    const taxAmt   = getTaxAmount();
    const change   = paymentMethod === 'Cash'
        ? (parseFloat(cashReceived) || 0) - total
        : 0;
    const canConfirm = paymentMethod !== 'Cash' || parseFloat(cashReceived) >= total;

    async function handleConfirm() {
        setProcessing(true);
        setApiError('');

        try {
            // ── Step 1: Sale create ──
            const salePayload = {
                branch_id:             '550e8400-e29b-41d4-a716-446655440001',
                user_id:               '550e8400-e29b-41d4-a716-446655440002',
                discount_type:         discount > 0 ? 'bill' : 'item',
                bill_discount_percent: discount > 0 ? discount : undefined,
                items: items.map(({ product, quantity }) => ({
                    product_id:       product.id,
                    product_name:     product.name,
                    quantity:         quantity,
                    unit:             'pcs',
                    unit_price:       product.price,
                    cost_price:       product.price,
                    discount_percent: 0,
                    tax_percent:      taxRate,
                })),
            };

            const sale = await createSale(salePayload);

            // ── Step 2: Payment process ──
            await processPayment({
                sale_id:               sale.sale_id,
                payment_method:        paymentMethod,
                amount_paid:           paymentMethod === 'Cash'
                    ? parseFloat(cashReceived)
                    : total,
                transaction_reference: '',
            });

            setConfirmed(true);

        } catch (err: any) {
            setApiError(err.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    }

    function handleNewSale() {
        clearCart();
        onClose();
    }

    function handlePrint() {
        window.print();
    }

    if (confirmed) {
        return (
            <ModalWrapper onClose={handleNewSale}>
                <ReceiptView
                    invoiceNo={invoiceNo}
                    items={items}
                    subtotal={subtotal}
                    discAmt={discAmt}
                    taxAmt={taxAmt}
                    taxRate={taxRate}
                    discount={discount}
                    total={total}
                    paymentMethod={paymentMethod}
                    cashReceived={parseFloat(cashReceived) || 0}
                    change={change}
                    onNewSale={handleNewSale}
                    onPrint={handlePrint}
                />
            </ModalWrapper>
        );
    }

    return (
        <ModalWrapper onClose={onClose}>
            <div className="w-[420px] bg-white rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-semibold text-base">Complete Payment</h2>
                        <p className="text-blue-200 text-xs mt-0.5">{invoiceNo}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="text-blue-200 hover:text-white cursor-pointer disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-4">

                    {/* Order summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Order Summary
                        </p>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {items.map(({ product, quantity }) => (
                                <div key={product.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{product.name} × {quantity}</span>
                                    <span className="font-medium text-gray-900">
                    Rs. {(product.price * quantity).toLocaleString()}
                  </span>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            {discAmt > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({discount}%)</span>
                                    <span>− Rs. {discAmt.toLocaleString()}</span>
                                </div>
                            )}
                            {taxAmt > 0 && (
                                <div className="flex justify-between">
                                    <span>Tax ({taxRate}%)</span>
                                    <span>Rs. {taxAmt.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <span className="font-semibold text-gray-900 text-sm">Total</span>
                            <span className="font-bold text-blue-600 text-xl">
                Rs. {total.toLocaleString()}
              </span>
                        </div>
                    </div>

                    {/* Payment method */}
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Payment Method
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Cash', 'Card', 'Split'] as const).map(m => (
                                <div
                                    key={m}
                                    className={`py-2 rounded-lg text-sm font-semibold text-center border
                    ${paymentMethod === m
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'text-gray-400 border-gray-200'
                                    }`}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cash received */}
                    {paymentMethod === 'Cash' && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Cash Received
                            </p>
                            <Input
                                type="number"
                                placeholder={`Minimum Rs. ${total.toLocaleString()}`}
                                value={cashReceived}
                                onChange={e => setCashReceived(e.target.value)}
                                className="text-sm"
                                autoFocus
                                disabled={processing}
                            />
                            {parseFloat(cashReceived) > 0 && (
                                <div className={`flex justify-between mt-2 px-1 text-sm font-semibold
                  ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    <span>Change</span>
                                    <span>
                    Rs. {change >= 0
                                        ? change.toLocaleString()
                                        : `${Math.abs(change).toLocaleString()} short`}
                  </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* API Error */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600 mb-3 flex items-center gap-2">
                            <X size={13} className="shrink-0" />
                            {apiError}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!canConfirm || processing}
                            onClick={handleConfirm}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing...
                </span>
                            ) : (
                                <>
                                    <CheckCircle size={15} className="mr-1.5" />
                                    Confirm Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}

// ── Receipt View ──────────────────────────────────────
interface ReceiptProps {
    invoiceNo: string;
    items: { product: { id: string; name: string; price: number }; quantity: number }[];
    subtotal: number;
    discAmt: number;
    taxAmt: number;
    taxRate: number;
    discount: number;
    total: number;
    paymentMethod: string;
    cashReceived: number;
    change: number;
    onNewSale: () => void;
    onPrint: () => void;
}

function ReceiptView({
                         invoiceNo, items, subtotal, discAmt, taxAmt, taxRate,
                         discount, total, paymentMethod, cashReceived, change,
                         onNewSale, onPrint,
                     }: ReceiptProps) {
    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="w-[380px] bg-white rounded-2xl overflow-hidden">

            {/* Success header */}
            <div className="bg-green-500 px-6 py-5 text-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle size={26} className="text-white" />
                </div>
                <h2 className="text-white font-bold text-lg">Payment Successful!</h2>
                <p className="text-green-100 text-xs mt-0.5">{invoiceNo}</p>
            </div>

            {/* Receipt body */}
            <div className="px-6 py-4">
                <div className="text-center mb-4">
                    <p className="font-bold text-gray-900 text-base">Ryzera POS</p>
                    <p className="text-gray-500 text-xs">Colombo Main Branch</p>
                    <p className="text-gray-400 text-xs mt-0.5">{dateStr} · {timeStr}</p>
                </div>

                <Separator className="mb-3" />

                <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-[1fr_40px_70px] text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        <span>Item</span>
                        <span className="text-center">Qty</span>
                        <span className="text-right">Amount</span>
                    </div>
                    {items.map(({ product, quantity }) => (
                        <div key={product.id} className="grid grid-cols-[1fr_40px_70px] text-xs">
                            <span className="text-gray-700">{product.name}</span>
                            <span className="text-center text-gray-500">{quantity}</span>
                            <span className="text-right font-medium text-gray-900">
                Rs. {(product.price * quantity).toLocaleString()}
              </span>
                        </div>
                    ))}
                </div>

                <Separator className="mb-3" />

                <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    {discAmt > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount ({discount}%)</span>
                            <span>− Rs. {discAmt.toLocaleString()}</span>
                        </div>
                    )}
                    {taxAmt > 0 && (
                        <div className="flex justify-between">
                            <span>Tax ({taxRate}%)</span>
                            <span>Rs. {taxAmt.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-gray-900 pt-1">
                        <span>Total</span>
                        <span>Rs. {total.toLocaleString()}</span>
                    </div>
                    {paymentMethod === 'Cash' && (
                        <>
                            <div className="flex justify-between">
                                <span>Cash Received</span>
                                <span>Rs. {cashReceived.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Change</span>
                                <span>Rs. {change.toLocaleString()}</span>
                            </div>
                        </>
                    )}
                </div>

                <Separator className="mb-3" />

                <p className="text-center text-gray-400 text-xs">
                    Payment: <span className="font-medium text-gray-600">{paymentMethod}</span>
                </p>
                <p className="text-center text-gray-400 text-[11px] mt-2">
                    Thank you for your purchase! 🙏
                </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-2">
                <Button
                    variant="outline"
                    onClick={onPrint}
                    className="flex-1 cursor-pointer"
                >
                    <Printer size={14} className="mr-1.5" />
                    Print
                </Button>
                <Button
                    onClick={onNewSale}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                    New Sale
                </Button>
            </div>
        </div>
    );
}

// ── Modal Wrapper ─────────────────────────────────────
function ModalWrapper({
                          children,
                          onClose,
                      }: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}