'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ShoppingCart, List, Receipt,
    RotateCcw, Users, GitBranch
} from 'lucide-react';

export default function BillingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItem = (
        href: string,
        icon: React.ReactNode,
        label: string,
        badge?: number
    ) => {
        const active = pathname === href;
        return (
            <Link
                href={href}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 14px',
                    margin: '0 8px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    color: active ? '#ffffff' : '#9ca3af',
                    background: active ? '#2563eb' : 'transparent',
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                    if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                    }
                }}
                onMouseLeave={e => {
                    if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                        (e.currentTarget as HTMLAnchorElement).style.color = '#9ca3af';
                    }
                }}
            >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge !== undefined && (
                    <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

            {/* SIDEBAR */}
            <div style={{ width: '220px', minWidth: '220px', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>

                {/* Logo */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Ryzera POS</div>
                    <div style={{ color: '#60a5fa', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', marginTop: '4px', textTransform: 'uppercase' }}>
                        Billing Module
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>

                    <div style={{ padding: '0 20px 8px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Sales
                    </div>
                    {navItem('/Billing', <ShoppingCart size={15} />, 'New Sale')}
                    {navItem('/Billing/all-sales', <List size={15} />, 'All Sales')}
                    {navItem('/Billing/receipts', <Receipt size={15} />, 'Receipts')}

                    <div style={{ padding: '16px 20px 8px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Returns
                    </div>
                    {navItem('/Billing/return', <RotateCcw size={15} />, 'Returns')}

                    <div style={{ padding: '16px 20px 8px', fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Setup
                    </div>
                    {navItem('/Billing/cashiers', <Users size={15} />, 'Cashiers')}
                    {navItem('/Billing/branches', <GitBranch size={15} />, 'Branches')}
                </nav>

                {/* Bottom user */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                        SA
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Super Admin</div>
                        <div style={{ color: '#9ca3af', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Administrator</div>
                    </div>
                </div>
            </div>

            {/* PAGE CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                {children}
            </div>
        </div>
    );
}