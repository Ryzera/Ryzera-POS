'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
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
    BarChart2,
    RefreshCw,
    UserPlus,      // ← Manager "Add Staff" icon
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router   = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    // Inventory,Reporting, Billing, and Sync have their own full-page layouts (with their own
    // sidebar + controls), so the main dashboard chrome is skipped for those routes.
    const isFullScreenModule = pathname.startsWith('/inventory') || pathname.startsWith('/billing') || pathname.startsWith('/reports') || pathname.startsWith('/sync');
    if (isFullScreenModule) {
      return <>{children}</>;
    }

    // ─── Role helpers ────────────────────────────────────────────────────────
    const isAdmin   = user?.roles?.includes('ADMIN')   || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const canCreate = isAdmin || isManager || user?.roles?.includes('CASHIER');

    // ─── Nav items ───────────────────────────────────────────────────────────
    const navItems = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        show: true,
      },
      {
        // Admin sees full Users page; Manager sees nothing here
        href: "/users",
        label: "Users",
        icon: Users,
        show: isAdmin,
      },
      {
        // Manager-only shortcut → goes straight to register page,
        // pre-filtered so they can only add staff to their own branch.
        href: "/users/register",
        label: "Add Staff",
        icon: UserPlus,
        show: isManager && !isAdmin, // hide for Admin (they use the full Users page)
      },
      {
        href: "/roles",
        label: "Roles",
        icon: Shield,
        show: isAdmin,
      },
      {
        href: "/profile",
        label: "Profile",
        icon: User,
        show: true,
      },
      {
        href: "/company",
        label: "Company",
        icon: Building2,
        show: isAdmin,
      },
      {
        href: "/inventory",
        label: "Inventory",
        icon: Package,
        show: true, // Admin sees all; Manager sees own branch (backend enforces)
      },
      {
        href: "/billing",
        label: "Billing",
        icon: Receipt,
        show: canCreate,
      },
        {
            href: '/reports/dashboard',
            label: 'Reports',
            icon: BarChart2,
            show: isAdmin || isManager || user?.roles?.includes('CASHIER') || user?.roles?.includes('INVENTORY_MANAGER'),
        },
      {
        href: "/sync",
        label: "Sync Suite",
        icon: RefreshCw,
        show: isAdmin || isManager,
      },
    ];

    // ─── Logout ──────────────────────────────────────────────────────────────
    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // ─── Role badge label ─────────────────────────────────────────────────────
    const roleBadge = user?.roles?.[0] || user?.user_type || 'USER';

    // ─── Role badge colour ────────────────────────────────────────────────────
    const roleBadgeStyle = (): React.CSSProperties => {
        if (isAdmin)   return { background: '#eff6ff', color: '#2563eb' };
        if (isManager) return { background: '#fdf4ff', color: '#9333ea' };
        return           { background: '#f0fdf4', color: '#16a34a' };
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
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
                            marginLeft: 'auto', background: 'none',
                            border: 'none', cursor: 'pointer', color: '#94a3b8',
                        }}
                    >
                        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
                    {navItems.filter(i => i.show).map((item) => {
                        const active = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        // Special highlight for "Add Staff" button
                        const isAddStaff = item.href === '/users/register';

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
                                    background: active
                                        ? '#2563eb'
                                        : isAddStaff
                                            ? '#1e293b'   // subtle highlight for Add Staff
                                            : 'transparent',
                                    color: active ? 'white' : isAddStaff ? '#a78bfa' : '#94a3b8',
                                    fontSize: '0.875rem',
                                    fontWeight: active || isAddStaff ? 600 : 400,
                                    transition: 'all 0.15s',
                                    border: isAddStaff && !active ? '1px solid #334155' : 'none',
                                }}
                            >
                                <item.icon size={18} style={{ flexShrink: 0 }} />
                                {sidebarOpen && item.label}
                            </Link>
                        );
                    })}

                    {/* Manager branch info badge */}
                    {isManager && !isAdmin && sidebarOpen && (
                        <div style={{
                            margin: '0.75rem 0.5rem 0',
                            padding: '0.5rem 0.75rem',
                            background: '#1e293b',
                            borderRadius: '0.5rem',
                            borderLeft: '3px solid #9333ea',
                        }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Your Branch
                            </div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>
                                Branch #{user?.branch_id ?? '—'}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '0.1rem' }}>
                                Inventory & staff scoped to this branch
                            </div>
                        </div>
                    )}
                </nav>

                {/* User info + Logout */}
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
                            <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.1rem' }}>
                                {roleBadge}
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

            {/* ── Main content ──────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {/* Top bar */}
                <div style={{
                    background: 'white',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                        {navItems.find(i => i.href === pathname)?.label ||
                            navItems.find(i => i.href !== '/dashboard' && pathname.startsWith(i.href))?.label ||
                            'Dashboard'}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <NotificationBell />
                        {/* Role badge */}
                        <span style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            ...roleBadgeStyle(),
                        }}>
                            {roleBadge}
                        </span>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ padding: '1.5rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}