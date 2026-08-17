'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Package, AlertTriangle, RefreshCw } from 'lucide-react';

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
    branch?: { name: string };
}

export default function InventoryPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const canManage = isAdmin || isManager || user?.roles?.includes('INVENTORY_MANAGER');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params: any = { companyId: user?.company_id };

            // Staff/Cashier/Manager → own branch only
            // Admin → all branches
            if (!isAdmin && user?.branch_id) {
                params.branchId = user.branch_id;
            }

            const res = await api.get('/inventory', { params });
            setProducts(res.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const lowStock = products.filter(p => p.quantity <= p.min_quantity);
    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.quantity), 0);

    const stats = [
        { label: 'Total Products', value: products.length, color: '#2563eb', bg: '#eff6ff', icon: Package },
        { label: 'Low Stock Items', value: lowStock.length, color: '#dc2626', bg: '#fef2f2', icon: AlertTriangle },
        { label: 'Total Stock Value', value: `Rs. ${totalValue.toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4', icon: Package },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Inventory Management</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{products.length} products total</p>
                </div>
                <button onClick={fetchProducts} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{
                        background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem', background: stat.bg,
                            borderRadius: '0.5rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                        }}>
                            <stat.icon size={18} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Low Stock Warning */}
            {lowStock.length > 0 && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem',
                    padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#dc2626' }}>Low Stock Alert</div>
                        <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                            {lowStock.map(p => p.name).join(', ')} — reorder needed
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading inventory...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['#', 'Product', 'Code', 'Price', 'Stock', 'Min Stock', 'Status', 'Action'].map(h => (
                                <th key={h} style={{
                                    padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                                    fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product, index) => {
                            const isLow = product.quantity <= product.min_quantity;
                            return (
                                <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>{index + 1}</td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                            <div style={{
                                                width: '2rem', height: '2rem', background: '#f1f5f9',
                                                borderRadius: '0.375rem', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <Package size={12} color="#64748b" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>{product.name}</div>
                                                {product.description && (
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{product.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>{product.code}</td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
                                        Rs. {Number(product.price).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                          padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem',
                          fontWeight: 600, background: isLow ? '#fef2f2' : '#f0fdf4',
                          color: isLow ? '#dc2626' : '#16a34a',
                      }}>{product.quantity}</span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>{product.min_quantity}</td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 500,
                          background: product.is_active ? '#f0fdf4' : '#f8fafc',
                          color: product.is_active ? '#16a34a' : '#64748b',
                      }}>{product.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {canManage && (
                                            <button
                                                onClick={() => router.push(`/inventory/edit/${product.id}`)}
                                                style={{
                                                    padding: '0.3rem 0.75rem', background: '#eff6ff', color: '#2563eb',
                                                    border: '1px solid #bfdbfe', borderRadius: '0.375rem',
                                                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}