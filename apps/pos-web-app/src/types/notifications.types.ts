export interface NotificationItem {
    id:         number;
    branch_id:  number | null;
    type:       string;
    title:      string;
    message:    string;
    is_read:    boolean;
    user_id:    number | null;
    created_at: string;
    updated_at: string;
}

export interface UnreadCountResponse {
    count: number;
}