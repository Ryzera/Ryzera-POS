import apiClient from '@/lib/axios';
import type {
    SavedReportConfig,
    SaveReportConfigPayload,
    ReportSchedule,
    CreateSchedulePayload,
    ReportDelivery,
    GenerateReportPayload,
    GeneratedReportResult,
} from '@/types/reports-hub.types';

// ─── Generate ─────────────────────────────────────────────────────────────────

export const generateReport = async (
    payload: GenerateReportPayload,
): Promise<GeneratedReportResult> => {
    const { data } = await apiClient.post<GeneratedReportResult>(
        '/reports/generate',
        payload,
    );
    return data;
};

// ─── Saved Configs ────────────────────────────────────────────────────────────

export const fetchSavedConfigs = async (): Promise<SavedReportConfig[]> => {
    const { data } = await apiClient.get<SavedReportConfig[]>('/reports/saved-configs');
    return data;
};

export const saveReportConfig = async (
    payload: SaveReportConfigPayload,
): Promise<SavedReportConfig> => {
    const { data } = await apiClient.post<SavedReportConfig>(
        '/reports/saved-configs',
        payload,
    );
    return data;
};

export const deleteSavedConfig = async (configId: string): Promise<void> => {
    await apiClient.delete(`/reports/saved-configs/${configId}`);
};

// ─── Schedules ────────────────────────────────────────────────────────────────

export const fetchSchedules = async (): Promise<ReportSchedule[]> => {
    const { data } = await apiClient.get<ReportSchedule[]>('/reports/schedules');
    return data;
};

export const createSchedule = async (
    payload: CreateSchedulePayload,
): Promise<ReportSchedule> => {
    const { data } = await apiClient.post<ReportSchedule>(
        '/reports/schedules',
        payload,
    );
    return data;
};

export const updateScheduleStatus = async (
    scheduleId: string,
    isActive:   boolean,
): Promise<ReportSchedule> => {
    const { data } = await apiClient.patch<ReportSchedule>(
        `/reports/schedules/${scheduleId}/status`,
        { isActive },
    );
    return data;
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
    await apiClient.delete(`/reports/schedules/${scheduleId}`);
};

// ─── Delivery History ─────────────────────────────────────────────────────────

export const fetchDeliveryHistory = async (
    scheduleId: string,
): Promise<ReportDelivery[]> => {
    const { data } = await apiClient.get<ReportDelivery[]>(
        `/reports/schedules/${scheduleId}/deliveries`,
    );
    return data;
};

export const resendDelivery = async (
    deliveryId: string,
): Promise<ReportDelivery> => {
    const { data } = await apiClient.post<ReportDelivery>(
        `/reports/deliveries/${deliveryId}/resend`,
    );
    return data;
};