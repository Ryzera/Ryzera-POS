'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ShoppingCart,
    ClipboardList,
    Receipt,
    RotateCcw,
    Users,
    GitBranch,
    type LucideIcon,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────
interface NavItem {
    label: string;
    href:  string;
    icon:  LucideIcon;
    badge?: number;
}

interface NavGroup {
    group: string;
    items: NavItem[];
}

// ── Nav data ──────────────────────────────────────────
const NAV: NavGroup[] = [
    {
        group: 'SALES',
        items: [
            { label: 'New Sale',  href: '/Billing',            icon: ShoppingCart  },
            { label: 'All Sales', href: '/Billing/all-sales',  icon: ClipboardList },
            { label: 'Receipts',  href: '/Billing/receipts',   icon: Receipt       },
        ],
    },
    {
        group: 'RETURNS',
        items: [
            { label: 'Returns', href: '/return', icon: RotateCcw },
        ],
    },
    {
        group: 'SETUP',
        items: [
            { label: 'Cashiers', href: '/Billing/cashiers', icon: Users     },
            { label: 'Branches', href: '/Billing/branches', icon: GitBranch },
        ],
    },
];

export default function ReturnLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen overflow-hidden">

            {/* ── Sidebar ── */}
            <aside className="w-48 bg-gray-900 flex flex-col shrink-0">

                {/* Logo */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-700">
                    <p className="text-white font-bold text-base leading-tight">Ryzera POS</p>
                    <p className="text-blue-400 text-[11px] font-semibold tracking-widest uppercase mt-0.5">
                        Billing Module
                    </p>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {NAV.map(({ group, items }) => (
                        <div key={group}>
                            <p className="text-gray-500 text-[10px] font-semibold tracking-widest uppercase px-2 mb-1.5">
                                {group}
                            </p>
                            <div className="space-y-0.5">
                                {items.map(({ label, href, icon: Icon, badge }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`
                                                flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                                                ${isActive
                                                ? 'bg-blue-600 text-white font-medium'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }
                                            `}
                                        >
                                            <Icon size={15} className="shrink-0" />
                                            <span className="flex-1 truncate">{label}</span>
                                            {badge && (
                                                <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                                                    {badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom user info */}
                <div className="px-3 py-4 border-t border-gray-700 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            SA
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-xs font-medium truncate">Super Admin</p>
                            <p className="text-gray-500 text-[11px] truncate">Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Page content ── */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}