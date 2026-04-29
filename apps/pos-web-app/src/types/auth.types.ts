
// Roles that exist in the backend DB (ryzera_pos_role table)
export type UserRole = 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER';

export interface AuthUser {
    userId:   string;       // JWT sub field (user_id as string)
    username: string;
    role:     UserRole;
    branchId: number | null; // null for SUPER_ADMIN; number for others
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