import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    user_type: string;
    company_id: number;
    branch_id: number | null;
    roles: string[];
    authorities: string[]; // flattened permission names from JWT payload, e.g. 'SALES_REPORT_VIEW'
    info: { first_name: string; last_name: string; email?: string } | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
    hasAuthority: (authority: string) => boolean;
}

// Cookie helper
function setCookie(name: string, value: string, days = 1) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: false,

            setAuth: (user, token) => {
                // save on both localStorage and cookie
                localStorage.setItem('access_token', token);
                setCookie('access_token', token, 1); // 1 day
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('access_token');
                deleteCookie('access_token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            setHasHydrated: (state) => {
                set({ hasHydrated: state });
            },

            // e.g. hasAuthority('COMPANY_SETTINGS_MANAGE')
            hasAuthority: (authority) => {
                const { user } = get();
                return user?.authorities?.includes(authority) ?? false;
            },
        }),
        {
            name: 'ryzera-auth',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);