import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchKpiSettings, saveAllKpiSettings } from '@/api/kpi-settings.api';
import type {
    KpiValidationErrorResponse,
    SaveAllKpiSettingsPayload,
} from '@/types/kpi-settings.types';

export const kpiSettingsKeys = {
    all:    ['kpi-settings'] as const,
    detail: (branchId?: number) => [...kpiSettingsKeys.all, branchId ?? 'global'] as const,
};

export function useKpiSettings(branchId: number | undefined, enabled: boolean) {
    return useQuery({
        queryKey:  kpiSettingsKeys.detail(branchId),
        queryFn:   () => fetchKpiSettings(branchId),
        enabled,
        staleTime: 1000 * 60,
        retry:     1,
    });
}

// ─── Flattens the { errors: { field: string[] } } shape from ZodValidationPipe
function extractErrorMessage(err: unknown, fallback: string): string {
    const response = (err as { response?: { data?: KpiValidationErrorResponse } })?.response;
    const data = response?.data;
    if (data?.errors) {
        const firstField = Object.values(data.errors)[0];
        if (firstField?.[0]) return firstField[0];
    }
    return data?.message ?? fallback;
}

export function useSaveAllKpiSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: SaveAllKpiSettingsPayload) => saveAllKpiSettings(payload),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: kpiSettingsKeys.all });
            if (data.branch_sum_warning) {
                toast.warning(data.branch_sum_warning);
            } else {
                toast.success(data.message ?? 'KPI settings saved successfully');
            }
        },
        onError: (err) => {
            toast.error(extractErrorMessage(err, 'Failed to save KPI settings'));
        },
    });
}