"use client";

import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const hasHydrated = useAuthStore((s) => s.hasHydrated);
    const setAuth = useAuthStore((s) => s.setAuth);
    const logout = useAuthStore((s) => s.logout);

    return {
        user,
        token,
        isAuthenticated,
        loading: !hasHydrated,
        setAuth,
        logout,
        isAdmin: user?.user_type === "ADMIN",
        isManager: user?.roles?.includes("MANAGER") ?? false,
        branchId: user?.branch_id ?? null,
    };
}