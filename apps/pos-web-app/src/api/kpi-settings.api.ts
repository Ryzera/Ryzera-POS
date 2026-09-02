import api from "@/lib/api";
import type {
  KpiSettingsResponse,
  SaveAllKpiSettingsPayload,
  SaveAllKpiSettingsResponse,
} from "@/types/kpi-settings.types";

// ─── GET /kpi-settings?branchId= ─────────────────────────────────────────────
export const fetchKpiSettings = async (
  branchId?: number,
): Promise<KpiSettingsResponse> => {
  const res = await api.get("/kpi-settings", {
    params: branchId != null ? { branchId: String(branchId) } : undefined,
  });
  return res.data.data;
};

// ─── POST /kpi-settings/save-all ─────────────────────────────────────────────
export const saveAllKpiSettings = async (
  payload: SaveAllKpiSettingsPayload,
): Promise<SaveAllKpiSettingsResponse> => {
  const res = await api.post("/kpi-settings/save-all", payload);
  return res.data.data;
};

export interface KpiTargetProgress {
  current: number;
  targetAmount: number;
  percentage: number;
  daysRemaining: number;
  amountRemaining: number;
  dailyRequired: number;
}

export const fetchKpiTargetProgress = async (
  branchId?: number,
): Promise<KpiTargetProgress> => {
  const res = await api.get("/kpi-settings/progress", {
    params: branchId != null ? { branchId: String(branchId) } : undefined,
  });
  return res.data.data;
};

