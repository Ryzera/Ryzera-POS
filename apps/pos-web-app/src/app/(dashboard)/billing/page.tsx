'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Receipt, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Bill {
    id: number;
    bill_number: string;
    status: string;
    payment_method: string;
    total: number;
    created_at: string;
    cashier: { username: string; info: { first_name: string; last_name: string } | null };
    branch: { name: string };
    items: any[];
}

export default function BillingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const isCashier = user?.roles?.includes('CASHIER');
    const canCreate = isAdmin || isManager || isCashier;

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await api.get('/billing');
            setBills(res.data.data || []);
        } catch (err: any) {
            toast.error('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBills(); }, []);

    const handleCancel = async (id: number) => {
        if (!confirm('Cancel this bill?')) return;
        try {
            await api.patch(`/billing/${id}/cancel`);
            toast.success('Bill cancelled');
            fetchBills();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const getStatusStyle = (status: string) => {
        if (status === 'COMPLETED') return { bg: '#f0fdf4', color: '#16a34a' };
        if (status === 'CANCELLED') return { bg: '#fef2f2', color: '#dc2626' };
        if (status === 'PENDING') return { bg: '#fffbeb', color: '#d97706' };
        return { bg: '#f8fafc', color: '#64748b' };
    };

    const totalRevenue = bills
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + Number(b.total), 0);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Billing</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{bills.length} bills total</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={fetchBills} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                    }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    {canCreate && (
                        <button onClick={() => router.push('/billing/create')} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: '#2563eb', border: 'none',
                            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem',
                            color: 'white', fontWeight: 500,
                        }}>
                            <Plus size={14} /> New Bill
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Bills', value: bills.length, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Completed', value: bills.filter(b => b.status === 'COMPLETED').length, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: '#7c3aed', bg: '#f5f3ff' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem', background: stat.bg,
                            borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Receipt size={18} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bills Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading bills...</div>
                ) : bills.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No bills yet. Create your first bill!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['Bill #', 'Cashier', 'Branch', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                                <th key={h} style={{
                                    padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                                    fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {bills.map(bill => {
                            const statusStyle = getStatusStyle(bill.status);
                            return (
                                <tr key={bill.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                                        {bill.bill_number}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>
                                        {bill.cashier?.info
                                            ? `${bill.cashier.info.first_name} ${bill.cashier.info.last_name}`
                                            : bill.cashier?.username}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {bill.branch?.name}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {bill.items?.length || 0} items
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                                        Rs. {Number(bill.total).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.7rem', fontWeight: 500,
                          background: '#f8fafc', color: '#64748b',
                      }}>{bill.payment_method}</span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.7rem', fontWeight: 500,
                          background: statusStyle.bg, color: statusStyle.color,
                      }}>{bill.status}</span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {new Date(bill.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {(isAdmin || isManager) && bill.status !== 'CANCELLED' && (
                                            <button onClick={() => handleCancel(bill.id)} style={{
                                                padding: '0.3rem 0.625rem', background: '#fef2f2', color: '#dc2626',
                                                border: '1px solid #fecaca', borderRadius: '0.375rem',
                                                fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                                            }}>Cancel</button>
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