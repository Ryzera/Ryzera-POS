"use client";

import Link from "next/link";
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
    User,
    FileText,
    AlertTriangle,
    LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

// Role-based visibility:
// ADMIN     → sees everything
// MANAGER   → no Branches page; sees Suppliers, Categories, POs, Transfers
// STAFF     → only Dashboard, Products, Stock, Alerts, Logs, Profile
type AllowedRole = "ADMIN" | "MANAGER" | "STAFF";

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    roles: AllowedRole[]; // which roles can see this item
}

interface NavSection {
    label: string;
    roles: AllowedRole[]; // section only shown if user role is in this list
    items: NavItem[];
}

const ALL: AllowedRole[] = ["ADMIN", "MANAGER", "STAFF"];
const ADMIN_MANAGER: AllowedRole[] = ["ADMIN", "MANAGER"];
const ADMIN_ONLY: AllowedRole[] = ["ADMIN"];

const navSections: NavSection[] = [
    {
        label: "OVERVIEW",
        roles: ALL,
        items: [
            { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
        ],
    },
    {
        label: "INVENTORY",
        roles: ALL,
        items: [
            { href: "/products", label: "Products", icon: Package, roles: ALL },
            { href: "/batches", label: "Batches", icon: Clock, roles: ALL },
            {
                href: "/inventory/stock",
                label: "Stock Levels",
                icon: BarChart3,
                badge: "alerts",
                roles: ALL,
            },
        ],
    },
    {
        label: "OPERATIONS",
        roles: ADMIN_MANAGER,
        items: [
            {
                href: "/purchase-orders",
                label: "Purchase Orders",
                icon: ShoppingCart,
                roles: ADMIN_MANAGER,
            },
            {
                href: "/transfers",
                label: "Transfers",
                icon: ArrowLeftRight,
                roles: ADMIN_MANAGER,
            },
        ],
    },
    {
        label: "SETUP",
        roles: ADMIN_MANAGER,
        items: [
            {
                href: "/suppliers",
                label: "Suppliers",
                icon: Users,
                roles: ADMIN_MANAGER,
            },
            {
                href: "/branches",
                label: "Branches",
                icon: GitBranch,
                roles: ADMIN_ONLY,   // MANAGER cannot manage branches
            },
            {
                href: "/categories",
                label: "Categories",
                icon: Tag,
                roles: ADMIN_MANAGER,
            },
        ],
    },
];

const accountItems: NavItem[] = [
    {
        href: "/inventory/alerts",
        label: "Alerts",
        icon: AlertTriangle,
        roles: ALL,
    },
    {
        href: "/inventory/logs",
        label: "Logs",
        icon: FileText,
        roles: ALL,
    },
    {
        href: "/profile",
        label: "Profile",
        icon: User,
        roles: ALL,
    },
];

interface SidebarProps {
    alertCount?: number;
}

export function Sidebar({ alertCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const role = (user?.role ?? "STAFF") as AllowedRole;

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    const canSee = (roles: AllowedRole[]) => roles.includes(role);

    return (
        <aside className="w-[220px] min-h-screen bg-[#1e2a4a] flex flex-col text-white shrink-0">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/10">
                <h1 className="text-xl font-bold tracking-tight">Ryzera POS</h1>
                <p className="text-xs text-white/50 mt-0.5">Inventory Management</p>
                {/* Show branch badge for Manager / Staff */}
                {user?.branch && role !== "ADMIN" && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4A8FD4]/30 text-[#4A8FD4]">
                        {user.branch.name}
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
                {navSections.map((section) => {
                    // Hide entire section if user role not allowed
                    if (!canSee(section.roles)) return null;

                    // Filter items within the section
                    const visibleItems = section.items.filter((item) =>
                        canSee(item.roles)
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.label}>
                            <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-white/40">
                                {section.label}
                            </p>
                            <ul className="space-y-0.5">
                                {visibleItems.map((item) => {
                                    const active =
                                        item.href === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(item.href);
                                    const Icon = item.icon;
                                    const showBadge =
                                        item.badge === "alerts" && alertCount > 0;

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative",
                                                    active
                                                        ? "bg-white/15 text-white font-medium"
                                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                <Icon size={16} />
                                                <span>{item.label}</span>
                                                {showBadge && (
                                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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

                {/* Account section — visible to all roles */}
                <div>
                    <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-white/40">
                        ACCOUNT
                    </p>
                    <ul className="space-y-0.5">
                        {accountItems
                            .filter((item) => canSee(item.roles))
                            .map((item) => {
                                const active = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                                active
                                                    ? "bg-white/15 text-white font-medium"
                                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </nav>

            {/* User footer */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#4A8FD4] flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user?.name ?? "—"}</p>
                        <p className="text-xs text-white/50 truncate capitalize">
                            {user?.role?.toLowerCase() ?? ""}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <LogOut size={15} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}