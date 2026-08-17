'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { dbService } from '@/services/indexedDB';

interface Product { id: number; name: string; code: string; price: number; quantity: number; }
interface CartItem { product: Product; quantity: number; unit_price: number; }

export default function CreateBillPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { saveToIndexedDB } = useOfflineSync();

    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await api.get('/inventory', { params: { companyId: user?.company_id } });
                const fetched = res.data.data?.filter((p: any) => p.is_active && p.quantity > 0) || [];
                setProducts(fetched);

                // Cache products into IndexedDB for offline access
                await dbService.init();
                for (const item of fetched) {
                    await dbService.add('products', item);
                }
            } catch (err) {
                // Fallback to IndexedDB when offline
                try {
                    await dbService.init();
                    const cached = await dbService.getAll('products');
                    if (cached && cached.length > 0) {
                        setProducts(cached as Product[]);
                        toast.info('📦 Loaded products from local offline cache');
                    }
                } catch {
                    console.error('Failed to load local offline products cache');
                }
            }
        };

        loadProducts();
    }, [user?.company_id]);

    const addToCart = (product: Product) => {
        const existing = cart.find(i => i.product.id === product.id);
        if (existing) {
            setCart(cart.map(i => i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { product, quantity: 1, unit_price: Number(product.price) }]);
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(i => i.product.id !== productId));
    };

    const updateQty = (productId: number, qty: number) => {
        if (qty <= 0) { removeFromCart(productId); return; }
        setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    };

    const subtotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const total = subtotal - discount;

    const handleSubmit = async () => {
        if (cart.length === 0) { toast.error('Add at least one item'); return; }
        setLoading(true);

        const billPayload = {
            branch_id: user?.branch_id || 1,
            payment_method: paymentMethod,
            discount,
            notes,
            items: cart.map(i => ({
                product_id: i.product.id,
                quantity: i.quantity,
                unit_price: i.unit_price,
            })),
        };

        try {
            await api.post('/billing', billPayload);
            toast.success('Bill created successfully!');
            router.push('/billing');
        } catch (err: any) {
            if (!navigator.onLine || err.code === 'ERR_NETWORK' || !err.response) {
                await saveToIndexedDB('pendingSales', {
                    ...billPayload,
                    temp_id: `OFFLINE-${Date.now()}`,
                }, 'HIGH');
                toast.success('💾 Internet disconnected! Bill saved offline and queued for sync.');
                router.push('/billing');
            } else {
                toast.error(err.response?.data?.message || 'Failed to create bill');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.5rem 0.75rem',
        border: '1px solid #e2e8f0', borderRadius: '0.5rem',
        fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => router.push('/billing')} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '2rem', height: '2rem', background: 'white',
                    border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', color: '#64748b',
                }}>
                    <ArrowLeft size={16} />
                </button>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Create New Bill</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
                {/* Products */}
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
                        Select Products
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                        {products.map(product => (
                            <div key={product.id} style={{
                                background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                                padding: '1rem', cursor: 'pointer', transition: 'border-color 0.15s',
                            }}
                                 onClick={() => addToCart(product)}
                            >
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                                    {product.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                    {product.code}
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb' }}>
                                    Rs. {Number(product.price).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    Stock: {product.quantity}
                                </div>
                                <button style={{
                                    width: '100%', marginTop: '0.625rem', padding: '0.375rem',
                                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                                    borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                                }}>
                                    <Plus size={12} /> Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart + Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Cart */}
                    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Cart ({cart.length} items)
                        </h3>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                No items added
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {cart.map(item => (
                                    <div key={item.product.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem',
                                    }}>
                                        <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: 500, color: '#0f172a' }}>
                                            {item.product.name}
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                Rs. {item.unit_price} each
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                                                    style={{ width: '1.5rem', height: '1.5rem', background: '#e2e8f0', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                                -
                                            </button>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                                            <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                                                    style={{ width: '1.5rem', height: '1.5rem', background: '#e2e8f0', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                                +
                                            </button>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', minWidth: '4rem', textAlign: 'right' }}>
                                            Rs. {(item.unit_price * item.quantity).toLocaleString()}
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                                    Payment Method
                                </label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                    <option value="ONLINE">Online</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                                    Discount (Rs.)
                                </label>
                                <input type="number" min="0" value={discount}
                                       onChange={e => setDiscount(Number(e.target.value))}
                                       style={inputStyle} placeholder="0" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                                    Notes
                                </label>
                                <input value={notes} onChange={e => setNotes(e.target.value)}
                                       style={inputStyle} placeholder="Optional notes" />
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                {[
                                    { label: 'Subtotal', value: `Rs. ${subtotal.toLocaleString()}` },
                                    { label: 'Discount', value: `- Rs. ${discount.toLocaleString()}` },
                                    { label: 'Total', value: `Rs. ${total.toLocaleString()}`, bold: true },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{row.label}</span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: row.bold ? 700 : 400, color: row.bold ? '#0f172a' : '#64748b' }}>
                      {row.value}
                    </span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleSubmit} disabled={loading || cart.length === 0} style={{
                                width: '100%', padding: '0.75rem',
                                background: loading || cart.length === 0 ? '#93c5fd' : '#2563eb',
                                border: 'none', borderRadius: '0.5rem', color: 'white',
                                fontSize: '0.875rem', fontWeight: 600,
                                cursor: loading || cart.length === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}>
                                {loading ? <><Loader2 size={14} className="animate-spin" />Processing...</> : `Complete Bill — Rs. ${total.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}