'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartstore';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import PaymentModal from './PaymentModal';

export default function CartPanel() {
    const {
        items, invoiceNo, discount, taxRate, paymentMethod,
        updateQuantity, removeItem, setDiscount, setTaxRate,
        setPaymentMethod, clearCart,
        getSubtotal, getDiscountAmount, getTaxAmount, getTotal,
    } = useCartStore();

    const [discountInput, setDiscountInput] = useState('');
    const [showModal, setShowModal]         = useState(false);

    // Hydration fix — client side only invoice generate
    useEffect(() => {
        if (!invoiceNo) {
            const year = new Date().getFullYear();
            const num  = Math.floor(Math.random() * 9000) + 1000;
            useCartStore.getState().setInvoiceNo(
                `INV-${year}-${String(num).padStart(4, '0')}`
            );
        }
    }, [invoiceNo]);

    const subtotal = getSubtotal();
    const discAmt  = getDiscountAmount();
    const taxAmt   = getTaxAmount();
    const total    = getTotal();

    return (
        <>
            {showModal && <PaymentModal onClose={() => setShowModal(false)} />}

            <div className="w-[340px] bg-white border-l border-gray-200 flex flex-col h-screen shrink-0">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <span className="text-sm font-semibold text-gray-900">Transaction Process</span>
                    <Badge className="bg-blue-50 text-blue-600 border-0 text-[11px] font-semibold">
                        {invoiceNo}
                    </Badge>
                </div>

                {/* Column headers */}
                {items.length > 0 && (
                    <div className="grid grid-cols-[1fr_80px_65px] px-5 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 shrink-0">
                        <span>Item</span>
                        <span className="text-center">Qty</span>
                        <span className="text-right">Price</span>
                    </div>
                )}

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto px-5">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm mt-12">
                            <p className="text-3xl mb-3">🛒</p>
                            <p>No items added yet.</p>
                            <p className="text-xs mt-1">Click a product to add.</p>
                        </div>
                    ) : (
                        items.map(({ product, quantity }) => (
                            <div
                                key={product.id}
                                className="grid grid-cols-[1fr_80px_65px] items-center py-2.5 border-b border-gray-50"
                            >
                                <div>
                                    <p className="text-xs font-medium text-gray-900 leading-snug">{product.name}</p>
                                    <p className="text-[11px] text-gray-400">Rs. {product.price.toLocaleString()} each</p>
                                </div>

                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        onClick={() => updateQuantity(product.id, quantity - 1)}
                                        className="w-5 h-5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                                    >−</button>
                                    <span className="text-xs font-semibold text-gray-900 w-4 text-center">{quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(product.id, quantity + 1)}
                                        className="w-5 h-5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                                    >+</button>
                                </div>

                                <div className="flex items-center justify-end gap-1">
                  <span className="text-xs font-semibold text-gray-900">
                    Rs.{(product.price * quantity).toLocaleString()}
                  </span>
                                    <button
                                        onClick={() => removeItem(product.id)}
                                        className="text-gray-300 hover:text-red-400 text-xs cursor-pointer ml-0.5"
                                    >✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Discount + Tax */}
                <div className="px-5 pt-4 pb-2 border-t border-gray-100 shrink-0">
                    <div className="flex gap-2 mb-3">
                        <Input
                            placeholder="Discount"
                            value={discountInput}
                            onChange={e => {
                                setDiscountInput(e.target.value);
                                setDiscount(parseFloat(e.target.value) || 0);
                            }}
                            className="flex-1 h-8 text-xs"
                        />
                        <span className="h-8 px-2.5 bg-gray-100 rounded-md text-xs text-gray-500 flex items-center">%</span>
                        <Select
                            value={String(taxRate)}
                            onValueChange={v => setTaxRate(parseFloat(v))}
                        >
                            <SelectTrigger className="h-8 text-xs w-[95px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">No Tax</SelectItem>
                                <SelectItem value="8">VAT 8%</SelectItem>
                                <SelectItem value="10">VAT 10%</SelectItem>
                                <SelectItem value="15">VAT 15%</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Summary */}
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

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                        <span className="text-lg font-bold text-gray-900">
              Rs. {total.toLocaleString()}
            </span>
                    </div>
                </div>

                {/* Payment method */}
                <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Payment Method
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                        {(['Cash', 'Card', 'Split'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all
                  ${paymentMethod === method
                                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-6 pt-3 flex flex-col gap-2 shrink-0">
                    <Button
                        variant="outline"
                        onClick={clearCart}
                        className="w-full text-gray-500 text-sm h-9 cursor-pointer"
                    >
                        Void / Clear Sale
                    </Button>
                    <Button
                        disabled={items.length === 0}
                        onClick={() => setShowModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-11 rounded-xl tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ✓ CONFIRM
                    </Button>
                </div>
            </div>
        </>
    );
}