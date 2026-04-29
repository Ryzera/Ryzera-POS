
// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ReportType {
    SALES                = 'SALES',
    PRODUCT_PERFORMANCE  = 'PRODUCT_PERFORMANCE',
    INVENTORY_STATUS     = 'INVENTORY_STATUS',
    PROFIT_AND_LOSS      = 'PROFIT_AND_LOSS',
    CATEGORY_PERFORMANCE = 'CATEGORY_PERFORMANCE',
    DAILY_SUMMARY        = 'DAILY_SUMMARY',
}

export enum ScheduleFrequency {
    DAILY   = 'DAILY',
    WEEKLY  = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

export enum DeliveryStatus {
    PENDING   = 'PENDING',
    DELIVERED = 'DELIVERED',
    FAILED    = 'FAILED',
}

// ─── Saved Config ─────────────────────────────────────────────────────────────

export interface SavedReportConfig {
    id:         string;
    configName: string;
    reportType: ReportType;
    startDate:  string;  // YYYY-MM-DD
    endDate:    string;  // YYYY-MM-DD
    branchId:   number | null;
    categoryId: string | null;
    createdAt:  string;
}

export interface SaveReportConfigPayload {
    configName: string;
    reportType: ReportType;
    startDate:  string;
    endDate:    string;
    branchId?:  number;
    categoryId?: string;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface ReportSchedule {
    id:             string;
    scheduleName:   string;
    reportType:     ReportType;
    frequency:      ScheduleFrequency;
    recipientEmail: string;
    branchId:       number | null;
    categoryId:     string | null;
    isActive:       boolean;
    nextRunAt:      string;
    createdAt:      string;
    userId:         number;
}

export interface CreateSchedulePayload {
    scheduleName:   string;
    reportType:     ReportType;
    frequency:      ScheduleFrequency;
    recipientEmail: string;
    branchId?:      number;
    categoryId?:    string;
    isActive?:      boolean;
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export interface ReportDelivery {
    id:            string;
    scheduleId:    string;
    status:        DeliveryStatus;
    sentAt:        string;
    recipientEmail: string;
    failureReason: string | null;
}

// ─── Generate Report ──────────────────────────────────────────────────────────

export interface GenerateReportPayload {
    reportType:  ReportType;
    startDate:   string;
    endDate:     string;
    branchId?:   number;
    categoryId?: string;
}

export interface GeneratedReportResult {
    reportType:  ReportType;
    startDate:   string;
    endDate:     string;
    branchId:    number | undefined;
    categoryId:  string | undefined;
    reportUrl:   string;
    generatedAt: string;
}