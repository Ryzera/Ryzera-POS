export interface JwtPayload {
    userId:   number;
    username: string;
    role:     string;
    branchId: number | null;
}