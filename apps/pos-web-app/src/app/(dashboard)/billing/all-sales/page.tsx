'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, XCircle, RefreshCw } from 'lucide-react';
import { useSalesStore, Sale } from '@/store/cartstore';
import api, { extractArray } from '@/lib/api';
import { toast } from 'sonner';

const PAYMENT_STYLE: Record<string, { background: string; color: string }> = {
    Cash:  { background: '#f0fdf4', color: '#15803d' },
    Card:  { background: '#eff6ff', color: '#1d4ed8' },
    Split: { background: '#faf5ff', color: '#7e22ce' },
};

export default function AllSalesPage() {
    const { sales: localSales, cancelSale: cancelLocalSale } = useSalesStore();
    const [dbSales, setDbSales]       = useState<Sale[]>([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState<'all' | 'completed' | 'cancelled'>('all');
    const [selectedSale, setSelected] = useState<Sale | null>(null);
    const [cancelling, setCancelling] = useState<number | null>(null);

    // ── Fetch all sales from database ────────────────────────────────────────
    async function fetchSales() {
        setLoading(true);
        try {
            const res = await api.get('/billing/sales');
            const list = extractArray<any>(res.data);

            const normalized: Sale[] = list.map((s: any) => {
                const invoice = s.invoice_number || s.invoice_no || s.bill_number || `INV-${s.sale_id || s.id}`;
                const total = Number(s.grand_total ?? s.total_amount ?? s.total ?? 0);
                const discount = Number(s.discount_amount ?? s.discount_total ?? 0);
                const tax = Number(s.tax_amount ?? s.tax_total ?? 0);

                // sale_status from the backend is 'Pending' | 'Completed' | 'Cancelled'.
                // Previously any missing/unrecognized status silently defaulted to
                // 'COMPLETED', which hid genuinely Pending sales (e.g. payment that
                // never actually processed) behind a false "Completed" badge.
                const rawStatus = (s.sale_status || s.status || '').toLowerCase();
                const status =
                    rawStatus === 'completed' ? 'completed' :
                        rawStatus === 'cancelled' ? 'cancelled' :
                            rawStatus === 'pending'   ? 'pending' :
                                rawStatus || 'unknown';

                const rawPm = s.payment_method || s.paymentMethod || 'Cash';
                const formattedPm = rawPm.charAt(0).toUpperCase() + rawPm.slice(1).toLowerCase();

                const items = Array.isArray(s.items) ? s.items.map((it: any, idx: number) => ({
                    id: it.id ?? idx + 1,
                    product_name: it.product_name || it.name || it.product?.name || `Item #${idx + 1}`,
                    quantity: Number(it.quantity || 1),
                    unit_price: Number(it.unit_price ?? it.price ?? 0),
                    subtotal: Number(it.subtotal ?? (Number(it.unit_price ?? it.price ?? 0) * Number(it.quantity || 1))),
                })) : [];

                return {
                    id: s.sale_id ?? s.id,
                    invoice_no: invoice,
                    total_amount: total,
                    discount_amount: discount,
                    tax_amount: tax,
                    payment_method: formattedPm,
                    status: status as any,
                    created_at: s.created_at || s.createdAt || new Date().toISOString(),
                    cashier_name: s.cashier?.info ? `${s.cashier.info.first_name} ${s.cashier.info.last_name || ''}`.trim() : (s.cashier?.username || 'Cashier'),
                    items,
                };
            });

            setDbSales(normalized);
        } catch {
            // Non-fatal: fallback to local store if DB is unreachable
            setDbSales([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSales();
    }, []);

    // Combine DB sales with any recent local sales that aren't yet in DB list
    const combinedSales: Sale[] = (() => {
        const dbInvoiceSet = new Set(dbSales.map(s => s.invoice_no));
        const uniqueLocal = localSales.filter(s => !dbInvoiceSet.has(s.invoice_no));
        return [...dbSales, ...uniqueLocal].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    })();

    const filtered = combinedSales.filter(s => {
        const matchSearch = s.invoice_no.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const completedSales = combinedSales.filter(s => s.status.toLowerCase() === 'completed');
    const totalRevenue   = completedSales.reduce((sum, s) => sum + s.total_amount, 0);
    const cancelledCount = combinedSales.filter(s => s.status.toLowerCase() === 'cancelled').length;

    async function handleCancel(id: number) {
        if (!confirm('Cancel this sale?')) return;
        setCancelling(id);
        try {
            await api.patch(`/billing/sales/${id}/cancel`);
            toast.success('Sale cancelled successfully');
        } catch {
            // Local fallback
        }
        cancelLocalSale(id);
        setDbSales(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
        if (selectedSale?.id === id) {
            setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null);
        }
        setCancelling(null);
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    return (
        <div style={{ display: 'flex', height: '100%', background: '#f9fafb', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>All Sales</h2>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>{combinedSales.length} total transactions</p>
                    </div>
                    <button
                        onClick={fetchSales}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', background: '#fff', border: '1px solid #e5e7eb',
                            borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#6b7280',
                        }}
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: '#2563eb' },
                        { label: 'Completed',     value: String(completedSales.length),          color: '#15803d' },
                        { label: 'Cancelled',     value: String(cancelledCount),                 color: '#dc2626' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '12px 16px' }}>
                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 4px' }}>{label}</p>
                            <p style={{ fontSize: '18px', fontWeight: 700, color, margin: 0 }}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by invoice number..."
                            style={{ width: '100%', height: '36px', paddingLeft: '36px', paddingRight: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px' }}>
                        {(['all', 'completed', 'cancelled'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                style={{
                                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                                    cursor: 'pointer', border: 'none', textTransform: 'capitalize',
                                    background: statusFilter === s ? '#2563eb' : 'transparent',
                                    color: statusFilter === s ? '#fff' : '#6b7280',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.7fr 80px', padding: '10px 20px', fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6' }}>
                        <span>Invoice</span><span>Date & Time</span><span>Payment</span><span>Amount</span><span>Status</span><span style={{ textAlign: 'center' }}>Actions</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: '#9ca3af', fontSize: '13px' }}>
                                Loading transactions...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: '#9ca3af', fontSize: '13px' }}>
                                {combinedSales.length === 0 ? 'No sales yet. Complete a sale to see it here.' : 'No sales found.'}
                            </div>
                        ) : filtered.map(sale => {
                            const isSelected = selectedSale?.id === sale.id;
                            const pmStyle = PAYMENT_STYLE[sale.payment_method] ?? { background: '#f3f4f6', color: '#4b5563' };
                            const isCompleted = sale.status.toLowerCase() === 'completed';
                            const stStyle = isCompleted ? { background: '#f0fdf4', color: '#15803d' } : { background: '#fef2f2', color: '#dc2626' };

                            return (
                                <div
                                    key={sale.id}
                                    onClick={() => setSelected(sale)}
                                    style={{
                                        display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.7fr 80px',
                                        alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f9fafb',
                                        cursor: 'pointer', background: isSelected ? 'rgba(37,99,235,0.04)' : 'transparent',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                                >
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>{sale.invoice_no}</span>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(sale.created_at)}</span>
                                    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, width: 'fit-content', ...pmStyle }}>{sale.payment_method}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>Rs. {sale.total_amount.toLocaleString()}</span>
                                    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', width: 'fit-content', ...stStyle }}>{sale.status}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => setSelected(sale)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#2563eb'} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'}><Eye size={15} /></button>
                                        {isCompleted && (
                                            <button onClick={() => handleCancel(sale.id)} disabled={cancelling === sale.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, opacity: cancelling === sale.id ? 0.4 : 1 }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'}><XCircle size={15} /></button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right detail panel */}
            <div style={{ width: '300px', minWidth: '300px', background: '#fff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {selectedSale ? (
                    <>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{selectedSale.invoice_no}</p>
                                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>{formatDate(selectedSale.created_at)}</p>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}><XCircle size={16} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Items ({selectedSale.items.length})</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedSale.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', fontWeight: 500, color: '#111827', margin: 0 }}>{item.product_name}</p>
                                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>Rs. {item.unit_price.toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0 }}>Rs. {item.subtotal.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                                    <span>Subtotal</span>
                                    <span>Rs. {(selectedSale.total_amount + (selectedSale.discount_amount || 0) - (selectedSale.tax_amount || 0)).toLocaleString()}</span>
                                </div>
                                {(selectedSale.discount_amount || 0) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#16a34a' }}>
                                        <span>Discount</span>
                                        <span>− Rs. {selectedSale.discount_amount.toLocaleString()}</span>
                                    </div>
                                )}
                                {(selectedSale.tax_amount || 0) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                                        <span>Tax</span>
                                        <span>Rs. {selectedSale.tax_amount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#111827', paddingTop: '4px', borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
                                    <span>Total</span>
                                    <span>Rs. {selectedSale.total_amount.toLocaleString()}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                {[selectedSale.payment_method, selectedSale.status].map((val, i) => {
                                    const style = i === 0
                                        ? PAYMENT_STYLE[val] ?? { background: '#f3f4f6', color: '#4b5563' }
                                        : val.toLowerCase() === 'completed'
                                            ? { background: '#f0fdf4', color: '#15803d' }
                                            : { background: '#fef2f2', color: '#dc2626' };
                                    return (
                                        <span key={i} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', ...style }}>
                                            {val}
                                        </span>
                                    );
                                })}
                            </div>
                            {selectedSale.status.toLowerCase() === 'completed' && (
                                <button
                                    onClick={() => handleCancel(selectedSale.id)}
                                    disabled={cancelling === selectedSale.id}
                                    style={{ width: '100%', height: '36px', border: '1px solid #fecaca', borderRadius: '8px', background: '#fff', color: '#dc2626', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: cancelling === selectedSale.id ? 0.5 : 1 }}
                                >
                                    <XCircle size={13} />
                                    {cancelling === selectedSale.id ? 'Cancelling...' : 'Cancel Sale'}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                            <Eye size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>Select a sale</p>
                            <p style={{ fontSize: '11px', margin: '4px 0 0' }}>Click any row to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
