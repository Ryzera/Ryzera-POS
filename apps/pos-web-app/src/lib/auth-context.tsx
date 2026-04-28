"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { authApi } from "./api";

interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "STAFF";
    branchId?: string;
    branch?: { id: string; name: string };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
    isManager: boolean;
    isStaff: boolean;
    branchId: string | null; // shortcut for user.branchId
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        window.location.href = "/login";
    }, []);

    const fetchMe = useCallback(async (tkn: string) => {
        try {
            const res = await authApi.me();
            setUser(res.data);
            setToken(tkn);
        } catch {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("token");
        if (stored) {
            fetchMe(stored).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [fetchMe]);

    const login = useCallback(
        async (email: string, password: string) => {
            const res = await authApi.login(email, password);
            const { accessToken } = res.data;
            localStorage.setItem("token", accessToken);
            await fetchMe(accessToken);
        },
        [fetchMe]
    );

    const isAdmin = user?.role === "ADMIN";
    const isManager = user?.role === "MANAGER";
    const isStaff = user?.role === "STAFF";

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                isAdmin,
                isManager,
                isStaff,
                branchId: user?.branchId ?? null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}