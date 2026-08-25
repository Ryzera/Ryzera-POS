"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Clock,
    BarChart3,
    ShoppingCart,
    ArrowLeftRight,
    Users,
    GitBranch,
    Tag,
    FileText,
    AlertTriangle,
    LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type AllowedRole = "ADMIN" | "MANAGER" | "CASHIER" | "INVENTORY_MANAGER";

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    roles: AllowedRole[];
}

interface NavSection {
    label: string;
    roles: AllowedRole[];
    items: NavItem[];
}

const ALL: AllowedRole[] = ["ADMIN", "MANAGER", "CASHIER", "INVENTORY_MANAGER"];
const ADMIN_MANAGER: AllowedRole[] = ["ADMIN", "MANAGER"];
const ADMIN_ONLY: AllowedRole[] = ["ADMIN"];
const INVENTORY_ROLES: AllowedRole[] = ["ADMIN", "MANAGER", "INVENTORY_MANAGER"];

const navSections: NavSection[] = [
    {
        label: "Overview",
        roles: ALL,
        items: [{ href: "/inventory", label: "Dashboard", icon: LayoutDashboard, roles: ALL }],
    },
    {
        label: "Inventory",
        roles: INVENTORY_ROLES,
        items: [
            { href: "/inventory/products", label: "Products", icon: Package, roles: ALL },
            { href: "/inventory/batches", label: "Batches", icon: Clock, roles: INVENTORY_ROLES },
            { href: "/inventory/inventory/stock", label: "Stock Levels", icon: BarChart3, badge: "alerts", roles: INVENTORY_ROLES },
        ],
    },
    {
        label: "Operations",
        roles: ADMIN_MANAGER,
        items: [
            { href: "/inventory/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, roles: ADMIN_MANAGER },
            { href: "/inventory/transfers", label: "Transfers", icon: ArrowLeftRight, roles: ADMIN_MANAGER },
        ],
    },
    {
        label: "Setup",
        roles: ADMIN_MANAGER,
        items: [
            { href: "/inventory/suppliers", label: "Suppliers", icon: Users, roles: ADMIN_MANAGER },
            { href: "/inventory/branches", label: "Branches", icon: GitBranch, roles: ADMIN_ONLY },
            { href: "/inventory/categories", label: "Categories", icon: Tag, roles: ADMIN_MANAGER },
        ],
    },
];

const accountItems: NavItem[] = [
    { href: "/inventory/inventory/alerts", label: "Alerts", icon: AlertTriangle, roles: ALL },
    { href: "/inventory/inventory/logs", label: "Logs", icon: FileText, roles: ALL },
];

interface SidebarProps {
    alertCount?: number;
}

export function Sidebar({ alertCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();

    // Effective role for nav purposes: ADMIN if user_type is ADMIN,
    // otherwise the first assigned Role (MANAGER / CASHIER / INVENTORY_MANAGER).
    const role = (isAdmin ? "ADMIN" : user?.roles?.[0]) as AllowedRole | undefined;

    const fullName = user?.info
        ? `${user.info.first_name} ${user.info.last_name}`
        : user?.username ?? "—";

    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const canSee = (roles: AllowedRole[]) => !!role && roles.includes(role);

    const linkClass = (active: boolean) =>
        cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors relative",
            active
                ? "bg-[var(--sidebar-active)] text-white font-semibold"
                : "text-white/60 hover:bg-[var(--sidebar-hover)] hover:text-white"
        );

    return (
        <aside className="sticky top-0 flex h-screen w-[224px] shrink-0 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)]">
            {/* Logo */}
            <div className="px-5 py-6">
                <h1 className="text-lg font-bold tracking-tight">Ryzera POS</h1>
                <p className="mt-1 text-[11px] text-white/45">Inventory Management</p>
                {user?.branch_id && !isAdmin && (
                    <span className="mt-3 inline-block rounded-md bg-[var(--sidebar-accent)]/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--sidebar-accent)]">
                        Branch #{user.branch_id}
                    </span>
                )}
            </div>
            <div className="mx-5 border-t border-white/10" />
            <div className="px-5 pt-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft size={13} />
                    Back to Dashboard
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
                {navSections.map((section) => {
                    if (!canSee(section.roles)) return null;
                    const visibleItems = section.items.filter((item) => canSee(item.roles));
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.label}>
                            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                                {section.label}
                            </p>
                            <ul className="space-y-1">
                                {visibleItems.map((item) => {
                                    const active = item.href === "/inventory" ? pathname === "/inventory" : pathname.startsWith(item.href);
                                    const Icon = item.icon;
                                    const showBadge = item.badge === "alerts" && alertCount > 0;

                                    return (
                                        <li key={item.href}>
                                            <Link href={item.href} className={linkClass(active)}>
                                                <Icon size={16} className="shrink-0" />
                                                <span>{item.label}</span>
                                                {showBadge && (
                                                    <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                        {alertCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}

                <div>
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                        Account
                    </p>
                    <ul className="space-y-1">
                        {accountItems.filter((item) => canSee(item.roles)).map((item) => {
                            const active = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link href={item.href} className={linkClass(active)}>
                                        <Icon size={16} className="shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* User footer */}
            <div className="border-t border-white/10 px-4 py-5">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sidebar-accent)] text-xs font-bold text-white">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{fullName}</p>
                        <p className="truncate text-xs capitalize text-white/45">{role?.toLowerCase() ?? ""}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <LogOut size={15} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
