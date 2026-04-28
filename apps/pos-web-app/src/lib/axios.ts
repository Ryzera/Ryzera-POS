// ============================================================
// Axios Instance
// File: apps/pos-web-app/src/lib/axios.ts
//
// Centralises base URL, auth header injection, and error handling.
// ============================================================

import axios from 'axios';

const TOKEN_KEY = 'access_token';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request interceptor — attach JWT on every outgoing request ───────────────
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ─── Response interceptor — redirect to login on 401 ─────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default apiClient;