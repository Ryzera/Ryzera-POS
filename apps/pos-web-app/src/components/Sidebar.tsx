'use client';

// ============================================================
// Sidebar Component — UPDATED
// File: pos-web-app/src/components/Sidebar.tsx
//
// Dark navy sidebar (#1e293b) matching expected UI.
// Active item: white/14% background + white text + blue-400 icon.
// Moon icon top-right of brand area (dark mode toggle placeholder).
// ============================================================

import Link            from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart2,
    TrendingUp,
    LineChart,
    Package,
    DollarSign,
    Tag,
    CalendarDays,
    Settings,
    ClipboardList,
    Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: 'Dashboard',            href: '/dashboard',                    icon: LayoutDashboard },
    { label: 'Reports Hub',          href: '/reports',                      icon: BarChart2       },
    { label: 'Sales Report',         href: '/reports/sales',                icon: TrendingUp      },
    { label: 'Product Performance',  href: '/reports/product-performance',  icon: LineChart       },
    { label: 'Inventory Status',     href: '/reports/inventory-status',     icon: Package         },
    { label: 'Profit & Loss',        href: '/reports/profit-loss',          icon: DollarSign      },
    { label: 'Category Performance', href: '/reports/category-performance', icon: Tag             },
    { label: 'Daily Summary',        href: '/reports/daily-summary',        icon: CalendarDays    },
    { label: 'KPI Settings',         href: '/reports/kpi-settings',         icon: Settings        },
    { label: 'Audit Log',            href: '/reports/audit-log',            icon: ClipboardList   },
] as const;

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="flex flex-col w-[230px] min-h-screen flex-shrink-0 select-none"
            style={{ backgroundColor: '#1e293b' }}
        >
            {/* ── Brand ──────────────────────────────────────────── */}
            <div className="px-5 pt-6 pb-5 border-b border-white/10 flex items-start justify-between">
                <div>
                    <p className="text-white font-bold text-[15px] leading-tight tracking-tight">
                        POS System
                    </p>
                    <p className="text-white/40 text-[11px] mt-0.5 font-medium">Reports &amp; Analytics</p>
                </div>
                {/* Moon icon — matches expected UI top-right */}
                <button
                    title="Toggle dark mode"
                    className="mt-0.5 p-1.5 rounded-lg text-white/30 hover:text-white/60
                               hover:bg-white/10 transition-colors"
                >
                    <Moon className="h-4 w-4" />
                </button>
            </div>

            {/* ── Navigation ─────────────────────────────────────── */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    // Exact match for /reports hub to avoid it matching sub-routes
                    const isActive =
                        href === '/reports'
                            ? pathname === href
                            : pathname === href || pathname.startsWith(href + '/');

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium',
                                'transition-all duration-150',
                                isActive
                                    ? 'bg-white/[0.14] text-white'
                                    : 'text-white/55 hover:text-white/85 hover:bg-white/[0.07]',
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-[16px] w-[16px] flex-shrink-0',
                                    isActive ? 'text-blue-400' : 'text-white/35',
                                )}
                            />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Footer ─────────────────────────────────────────── */}
            <div className="px-5 py-4 border-t border-white/10">
                <p className="text-white/25 text-[11px]">© 2026 POS System</p>
            </div>
        </aside>
    );
}