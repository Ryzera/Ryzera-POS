'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
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
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

type AllowedRole = "ADMIN" | "MANAGER" | "CASHIER" | "INVENTORY_MANAGER";

const ALL_ROLES: AllowedRole[] = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "INVENTORY_MANAGER",
];
const ADMIN_MANAGER: AllowedRole[] = ["ADMIN", "MANAGER"];
const INVENTORY_REPORT_ROLES: AllowedRole[] = [
  "ADMIN",
  "MANAGER",
  "INVENTORY_MANAGER",
];

const NAV_ITEMS: {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: AllowedRole[];
}[] = [
  {
    label: "Dashboard",
    href: "/reports/dashboard",
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  {
    label: "Reports Hub",
    href: "/reports",
    icon: BarChart2,
    roles: ADMIN_MANAGER,
  },
  {
    label: "Sales Report",
    href: "/reports/sales",
    icon: TrendingUp,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    label: "Product Performance",
    href: "/reports/product-performance",
    icon: LineChart,
    roles: ADMIN_MANAGER,
  },
  {
    label: "Inventory Status",
    href: "/reports/inventory-status",
    icon: Package,
    roles: INVENTORY_REPORT_ROLES,
  },
  {
    label: "Profit & Loss",
    href: "/reports/profit-loss",
    icon: DollarSign,
    roles: ADMIN_MANAGER,
  },
  {
    label: "Category Performance",
    href: "/reports/category-performance",
    icon: Tag,
    roles: ADMIN_MANAGER,
  },
  {
    label: "Daily Summary",
    href: "/reports/daily-summary",
    icon: CalendarDays,
    roles: ADMIN_MANAGER,
  },
  {
    label: "KPI Settings",
    href: "/reports/kpi-settings",
    icon: Settings,
    roles: ADMIN_MANAGER,
  },
  {
    label: "Audit Log",
    href: "/reports/audit-log",
    icon: ClipboardList,
    roles: ADMIN_MANAGER,
  },
];

export function ReportsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  // Effective role for nav purposes: ADMIN if user_type is ADMIN,
  // otherwise the first assigned Role (MANAGER / CASHIER / INVENTORY_MANAGER).
  const role = (isAdmin ? 'ADMIN' : user?.roles?.[0]) as AllowedRole | undefined;
  const visibleItems = NAV_ITEMS.filter((item) => !!role && item.roles.includes(role));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
      <aside
          className="flex flex-col w-[240px] h-screen flex-shrink-0 select-none bg-[#0f172a] text-slate-200 border-r border-slate-800 sticky top-0 overflow-y-auto"
      >
        {/* ── Brand & Back to Dashboard ───────────────────────────────── */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
          <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 rounded-xl transition-all mb-4 border border-blue-800/40 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div>
            <p className="text-white font-bold text-[16px] leading-tight tracking-tight">
              POS System
            </p>
            <p className="text-blue-400 text-[11px] mt-0.5 font-medium">Reports &amp; Analytics</p>
          </div>
        </div>

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                        isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    )}
                >
                  <Icon
                      className={cn(
                          'h-[16px] w-[16px] flex-shrink-0',
                          isActive ? 'text-white' : 'text-slate-400'
                      )}
                  />
                  <span className="truncate">{label}</span>
                </Link>
            );
          })}
        </nav>

        {/* ── User & Logout Footer ────────────────────────────────────── */}
        <div className="p-4 border-t border-white/10 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.info?.first_name ? `${user.info.first_name} ${user.info.last_name}` : user?.username || 'User'}
              </p>
              <p className="text-[10px] text-blue-400 font-medium truncate uppercase">
                {user?.user_type || 'STAFF'}
              </p>
            </div>
          </div>

          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors border border-transparent hover:border-red-900/40"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
  );
}