// ============================================================
// Auth — API Functions
// File: apps/pos-web-app/src/api/auth.api.ts
// ============================================================

import apiClient from '@/lib/axios';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return data;
};