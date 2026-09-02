import api from "@/lib/api";
import type {
  SavedReportConfig,
  SaveReportConfigPayload,
  ReportSchedule,
  CreateSchedulePayload,
  ReportDelivery,
  GenerateReportPayload,
  GeneratedReportResult,
} from "@/types/reports-hub.types";

// ─── Generate ─────────────────────────────────────────────────────────────────
export const generateReport = async (
  payload: GenerateReportPayload,
): Promise<GeneratedReportResult> => {
  const res = await api.post("/reports/generate", payload);
  return res.data.data;
};

// ─── Saved Configs ────────────────────────────────────────────────────────────
export const fetchSavedConfigs = async (): Promise<SavedReportConfig[]> => {
  const res = await api.get("/reports/saved-configs");
  return res.data.data;
};

export const saveReportConfig = async (
  payload: SaveReportConfigPayload,
): Promise<SavedReportConfig> => {
  const res = await api.post("/reports/saved-configs", payload);
  return res.data.data;
};

export const deleteSavedConfig = async (configId: string): Promise<void> => {
  await api.delete(`/reports/saved-configs/${configId}`);
};

// ─── Schedules ────────────────────────────────────────────────────────────────
export const fetchSchedules = async (): Promise<ReportSchedule[]> => {
  const res = await api.get("/reports/schedules");
  return res.data.data;
};

export const createSchedule = async (
  payload: CreateSchedulePayload,
): Promise<ReportSchedule> => {
  const res = await api.post("/reports/schedules", payload);
  return res.data.data;
};

export const updateScheduleStatus = async (
  scheduleId: string,
  isActive: boolean,
): Promise<ReportSchedule> => {
  const res = await api.patch(`/reports/schedules/${scheduleId}/status`, {
    isActive,
  });
  return res.data.data;
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await api.delete(`/reports/schedules/${scheduleId}`);
};

// ─── Delivery History ─────────────────────────────────────────────────────────
export const fetchDeliveryHistory = async (
  scheduleId: string,
): Promise<ReportDelivery[]> => {
  const res = await api.get(`/reports/schedules/${scheduleId}/deliveries`);
  return res.data.data;
};

export const resendDelivery = async (
  deliveryId: string,
): Promise<ReportDelivery> => {
  const res = await api.post(`/reports/deliveries/${deliveryId}/resend`);
  return res.data.data;
};
