import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    user_type: string;
    company_id: number;
    branch_id: number | null;
    roles: string[];
    info: { first_name: string; last_name: string; email?: string } | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
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
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

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
        }),
        { name: 'ryzera-auth' },
    ),
);