'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    code: string;
    description?: string;
    price: number;
    cost_price?: number;
    quantity: number;
    min_quantity: number;
    is_active: boolean;
}

export default function EditInventoryPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        price: '',
        cost_price: '',
        quantity: '',
        min_quantity: '',
        is_active: true,
    });

    const canManage =
        user?.roles?.includes('ADMIN') ||
        user?.roles?.includes('MANAGER') ||
        user?.roles?.includes('INVENTORY_MANAGER') ||
        user?.user_type === 'ADMIN';

    useEffect(() => {
        if (!canManage) {
            router.push('/inventory');
            return;
        }
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/inventory/${params.id}`);
            const p: Product = res.data.data;
            setForm({
                name: p.name,
                code: p.code,
                description: p.description || '',
                price: String(p.price),
                cost_price: String(p.cost_price || ''),
                quantity: String(p.quantity),
                min_quantity: String(p.min_quantity),
                is_active: p.is_active,
            });
        } catch {
            toast.error('Failed to load product');
            router.push('/inventory');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/inventory/${params.id}`, {
                name: form.name,
                code: form.code,
                description: form.description || undefined,
                price: parseFloat(form.price),
                cost_price: form.cost_price ? parseFloat(form.cost_price) : undefined,
                quantity: parseInt(form.quantity),
                min_quantity: parseInt(form.min_quantity),
                is_active: form.is_active,
            });
            toast.success('Product updated successfully!');
            router.push('/inventory');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#0f172a',
        background: 'white',
        outline: 'none',
        boxSizing: 'border-box' as const,
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.375rem',
    };

    if (fetching) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading product...
        </div>
    );

    return (
        <div style={{ maxWidth: '640px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => router.push('/inventory')}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '2rem', height: '2rem',
                        background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', cursor: 'pointer', color: '#64748b',
                    }}
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                        Edit Product
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Update product details
                    </p>
                </div>
            </div>

            {/* Form */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Name + Code */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Product Name *</label>
                            <input
                                name="name"
                                required
                                value={form.name}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="Product name"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Code *</label>
                            <input
                                name="code"
                                required
                                value={form.code}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="e.g. BEV001"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={2}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            placeholder="Optional description"
                        />
                    </div>

                    {/* Price + Cost Price */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Selling Price (Rs.) *</label>
                            <input
                                name="price"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Cost Price (Rs.)</label>
                            <input
                                name="cost_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.cost_price}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Quantity + Min Quantity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Current Stock *</label>
                            <input
                                name="quantity"
                                type="number"
                                required
                                min="0"
                                value={form.quantity}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Minimum Stock *</label>
                            <input
                                name="min_quantity"
                                type="number"
                                required
                                min="0"
                                value={form.min_quantity}
                                onChange={handleChange}
                                style={inputStyle}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem',
                    }}>
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                        />
                        <label htmlFor="is_active" style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>
                            Product is Active
                        </label>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => router.push('/inventory')}
                            style={{
                                flex: 1, padding: '0.625rem',
                                background: 'white', border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem', cursor: 'pointer',
                                fontSize: '0.875rem', color: '#64748b',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1, padding: '0.625rem',
                                background: loading ? '#93c5fd' : '#2563eb',
                                border: 'none', borderRadius: '0.5rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem', color: 'white', fontWeight: 500,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}
                        >
                            {loading
                                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                                : 'Save Changes'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}