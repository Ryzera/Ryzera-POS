
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';   // or whichever toast lib the project uses
import * as api from '@/api/reports-hub.api';
import type {
    SaveReportConfigPayload,
    CreateSchedulePayload,
} from '@/types/reports-hub.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const REPORTS_HUB_KEYS = {
    savedConfigs:    ['reports-hub', 'saved-configs']        as const,
    schedules:       ['reports-hub', 'schedules']            as const,
    deliveries: (scheduleId: string) =>
        ['reports-hub', 'deliveries', scheduleId]            as const,
} as const;

// ─── Saved Configs ────────────────────────────────────────────────────────────

export function useSavedConfigs() {
    return useQuery({
        queryKey: REPORTS_HUB_KEYS.savedConfigs,
        queryFn:  api.fetchSavedConfigs,
    });
}

export function useSaveConfig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: SaveReportConfigPayload) =>
            api.saveReportConfig(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: REPORTS_HUB_KEYS.savedConfigs });
            toast.success('Report configuration saved');
        },
        onError: () => toast.error('Failed to save configuration'),
    });
}

export function useDeleteSavedConfig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (configId: string) => api.deleteSavedConfig(configId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: REPORTS_HUB_KEYS.savedConfigs });
            toast.success('Configuration removed');
        },
        onError: () => toast.error('Failed to delete configuration'),
    });
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export function useSchedules() {
    return useQuery({
        queryKey: REPORTS_HUB_KEYS.schedules,
        queryFn:  api.fetchSchedules,
    });
}

export function useCreateSchedule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSchedulePayload) =>
            api.createSchedule(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: REPORTS_HUB_KEYS.schedules });
            toast.success('Schedule created');
        },
        onError: () => toast.error('Failed to create schedule'),
    });
}

export function useDeleteSchedule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (scheduleId: string) => api.deleteSchedule(scheduleId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: REPORTS_HUB_KEYS.schedules });
            toast.success('Schedule removed');
        },
        onError: () => toast.error('Failed to delete schedule'),
    });
}

// ─── Delivery History ─────────────────────────────────────────────────────────

export function useDeliveryHistory(scheduleId: string) {
    return useQuery({
        queryKey: REPORTS_HUB_KEYS.deliveries(scheduleId),
        queryFn:  () => api.fetchDeliveryHistory(scheduleId),
        enabled:  Boolean(scheduleId),
    });
}

export function useResendDelivery() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (deliveryId: string) => api.resendDelivery(deliveryId),
        onSuccess: (_data, _vars, ctx: { scheduleId?: string } = {}) => {
            if (ctx.scheduleId) {
                qc.invalidateQueries({
                    queryKey: REPORTS_HUB_KEYS.deliveries(ctx.scheduleId),
                });
            }
            toast.success('Delivery re-queued');
        },
        onError: () => toast.error('Failed to resend delivery'),
    });
}