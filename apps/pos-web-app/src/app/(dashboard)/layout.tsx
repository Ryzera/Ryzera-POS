'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import NotificationBell from '@/components/NotificationBell';
import {
    LayoutDashboard,
    Users,
    Shield,
    LogOut,
    ShoppingCart,
    Menu,
    X,
    User,
    Building2,
    Package,
    Receipt,
    RefreshCw
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const canCreate = isAdmin || isManager || user?.roles?.includes('CASHIER');

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
        { href: '/users', label: 'Users', icon: Users, show: isAdmin },
        { href: '/roles', label: 'Roles', icon: Shield, show: isAdmin },
        { href: '/profile', label: 'Profile', icon: User, show: true },
        { href: '/company', label: 'Company', icon: Building2, show: isAdmin },
        { href: '/inventory', label: 'Inventory', icon: Package, show: true },
        { href: '/billing', label: 'Billing', icon: Receipt, show: canCreate },
        { href: '/sync/dashboard', label: 'Sync', icon: RefreshCw, show: isAdmin || isManager || user?.roles?.includes('CASHIER') },
    ];


    const handleLogout = () => {
        logout();
        router.push('/login');
    };


    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Sidebar */}
            <div style={{
                width: sidebarOpen ? '240px' : '64px',
                background: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s',
                flexShrink: 0,
            }}>
                {/* Logo */}
                <div style={{
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid #1e293b',
                }}>
                    <div style={{
                        width: '2rem', height: '2rem',
                        background: '#2563eb',
                        borderRadius: '0.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <ShoppingCart size={14} color="white" />
                    </div>
                    {sidebarOpen && (
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
              Ryzera POS
            </span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            cursor: 'pointer', color: '#94a3b8',
                        }}
                    >
                        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
                    {navItems.filter(i => i.show).map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '0.25rem',
                                    textDecoration: 'none',
                                    background: active ? '#2563eb' : 'transparent',
                                    color: active ? 'white' : '#94a3b8',
                                    fontSize: '0.875rem',
                                    fontWeight: active ? 600 : 400,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <item.icon size={18} style={{ flexShrink: 0 }} />
                                {sidebarOpen && item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div style={{ padding: '0.75rem', borderTop: '1px solid #1e293b' }}>
                    {sidebarOpen && (
                        <div style={{
                            padding: '0.625rem 0.75rem',
                            marginBottom: '0.5rem',
                            background: '#1e293b',
                            borderRadius: '0.5rem',
                        }}>
                            <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                                {user?.info?.first_name} {user?.info?.last_name}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                {user?.roles?.[0] || user?.user_type}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.625rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                        }}
                    >
                        <LogOut size={18} style={{ flexShrink: 0 }} />
                        {sidebarOpen && 'Logout'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {/* Top Bar */}
                <div style={{
                    background: 'white',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                        {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <NotificationBell />
                        <div style={{
                            padding: '0.375rem 0.75rem',
                            background: '#eff6ff',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            color: '#2563eb',
                            fontWeight: 500,
                        }}>
                            {user?.roles?.[0] || user?.user_type}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ padding: '1.5rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}