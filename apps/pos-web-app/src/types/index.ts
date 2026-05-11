export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

export interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        user_type: string;
        company_id: number;
        branch_id: number | null;
        roles: string[];
        info: { first_name: string; last_name: string; email?: string } | null;
    };
}