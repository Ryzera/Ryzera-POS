'use client';

import { useState } from 'react';
import { Search, Printer, Eye, FileText } from 'lucide-react';
import { useSalesStore } from '@/store/cartstore';

const PAYMENT_STYLE: Record<string, { background: string; color: string }> = {
    Cash:  { background: '#f0fdf4', color: '#15803d' },
    Card:  { background: '#eff6ff', color: '#1d4ed8' },
    Split: { background: '#faf5ff', color: '#7e22ce' },
};

export default function ReceiptsPage() {
    const { sales } = useSalesStore();
    const completedSales = sales.filter(s => s.status === 'completed');

    const [search, setSearch]     = useState('');
    const [selected, setSelected] = useState<typeof completedSales[0] | null>(null);

    const filtered = completedSales.filter(r =>
        r.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
        r.cashier_name.toLowerCase().includes(search.toLowerCase())
    );

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <>
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #receipt-print-area { display: block !important; }
                }
                #receipt-print-area { display: none; }
            `}</style>

            {selected && (
                <div id="receipt-print-area" style={{ padding: '32px', maxWidth: '320px', margin: '0 auto', fontFamily: 'monospace', fontSize: '13px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 2px' }}>Ryzera POS</p>
                        <p style={{ fontSize: '11px', margin: '0 0 2px' }}>Colombo Main Branch</p>
                        <p style={{ fontSize: '11px', margin: '0 0 2px' }}>{formatDate(selected.created_at)}</p>
                        <p style={{ fontSize: '11px', margin: '4px 0 0' }}>Invoice: {selected.invoice_no}</p>
                        <p style={{ fontSize: '11px', margin: '0' }}>Cashier: {selected.cashier_name}</p>
                    </div>
                    <hr style={{ borderStyle: 'dashed', borderColor: '#9ca3af', margin: '8px 0' }} />
                    {selected.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                            <span>{item.product_name} x{item.quantity}</span>
                            <span>Rs. {item.subtotal.toLocaleString()}</span>
                        </div>
                    ))}
                    <hr style={{ borderStyle: 'dashed', borderColor: '#9ca3af', margin: '8px 0' }} />
                    {selected.discount_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>Discount</span><span>- Rs. {selected.discount_amount.toLocaleString()}</span></div>}
                    {selected.tax_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span>Tax</span><span>Rs. {selected.tax_amount.toLocaleString()}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '4px' }}><span>TOTAL</span><span>Rs. {selected.total_amount.toLocaleString()}</span></div>
                    <hr style={{ borderStyle: 'dashed', borderColor: '#9ca3af', margin: '8px 0' }} />
                    <p style={{ textAlign: 'center', fontSize: '11px', margin: '4px 0 0' }}>Payment: {selected.payment_method}</p>
                    <p style={{ textAlign: 'center', fontSize: '11px', margin: '6px 0 0' }}>Thank you! 🙏</p>
                </div>
            )}

            <div style={{ display: 'flex', height: '100%', background: '#f9fafb', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={18} color="#2563eb" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>Receipts</h2>
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>{completedSales.length} receipts available</p>
                        </div>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice or cashier name..." style={{ width: '100%', height: '36px', paddingLeft: '36px', paddingRight: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ flex: 1, background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.7fr 60px', padding: '10px 20px', fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6' }}>
                            <span>Invoice</span><span>Date & Time</span><span>Cashier</span><span>Payment</span><span>Amount</span><span style={{ textAlign: 'center' }}>View</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {filtered.length === 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: '#9ca3af', fontSize: '13px' }}>
                                    {completedSales.length === 0 ? 'No receipts yet. Complete a sale to see receipts.' : 'No receipts found.'}
                                </div>
                            ) : filtered.map(receipt => {
                                const isSelected = selected?.id === receipt.id;
                                const pmStyle = PAYMENT_STYLE[receipt.payment_method];
                                return (
                                    <div key={receipt.id} onClick={() => setSelected(receipt)}
                                         style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.7fr 60px', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', background: isSelected ? 'rgba(37,99,235,0.04)' : 'transparent' }}
                                         onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                                         onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                                    >
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>{receipt.invoice_no}</span>
                                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(receipt.created_at)}</span>
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>{receipt.cashier_name}</span>
                                        <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, width: 'fit-content', ...pmStyle }}>{receipt.payment_method}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>Rs. {receipt.total_amount.toLocaleString()}</span>
                                        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setSelected(receipt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#2563eb'} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'}><Eye size={15} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div style={{ width: '300px', minWidth: '300px', background: '#fff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {selected ? (
                        <>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{selected.invoice_no}</p>
                                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, ...PAYMENT_STYLE[selected.payment_method] }}>{selected.payment_method}</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>{formatDate(selected.created_at)}</p>
                                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>Cashier: {selected.cashier_name}</p>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Items ({selected.items.length})</p>
                                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
                                    <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '14px', color: '#111827', margin: '0 0 2px' }}>Ryzera POS</p>
                                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '10px', margin: '0 0 12px' }}>Colombo Main Branch</p>
                                    <hr style={{ borderStyle: 'dashed', borderColor: '#d1d5db', margin: '8px 0' }} />
                                    {selected.items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                            <span style={{ color: '#374151', flex: 1, paddingRight: '8px', lineHeight: 1.4 }}>{item.product_name}</span>
                                            <span style={{ color: '#6b7280', marginRight: '8px' }}>×{item.quantity}</span>
                                            <span style={{ color: '#111827', fontWeight: 500 }}>Rs.{item.subtotal.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <hr style={{ borderStyle: 'dashed', borderColor: '#d1d5db', margin: '8px 0' }} />
                                    {selected.discount_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}><span>Discount</span><span>- Rs.{selected.discount_amount.toLocaleString()}</span></div>}
                                    {selected.tax_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}><span>Tax</span><span>Rs.{selected.tax_amount.toLocaleString()}</span></div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', color: '#111827', paddingTop: '4px' }}><span>TOTAL</span><span>Rs.{selected.total_amount.toLocaleString()}</span></div>
                                    <hr style={{ borderStyle: 'dashed', borderColor: '#d1d5db', margin: '8px 0' }} />
                                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '10px', margin: 0 }}>Thank you! 🙏</p>
                                </div>
                            </div>
                            <div style={{ padding: '12px 20px 20px', flexShrink: 0 }}>
                                <button onClick={() => window.print()} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'}>
                                    <Printer size={14} /> Print Receipt
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>Select a receipt</p>
                                <p style={{ fontSize: '11px', margin: '4px 0 0' }}>Click any row to preview</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}