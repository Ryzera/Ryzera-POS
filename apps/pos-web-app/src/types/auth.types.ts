
// Roles that exist in the backend DB ("role" table) — see roles.constants.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'INVENTORY_MANAGER' | 'CASHIER';

export interface AuthUser {
    userId:   string;       // JWT sub field (user_id as string)
    username: string;
    role:     UserRole;
    branchId: number | null; // null for ADMIN; number for everyone else
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    role:         UserRole;
    branchId:     number | null;
    username:     string;
}
