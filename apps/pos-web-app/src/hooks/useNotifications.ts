import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchUnreadCount,
    fetchUnreadNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from '@/api/notifications.api';
import { DEFAULT_CHECK_FREQUENCY_MINUTES } from '@/constants/kpi-settings.constants';
import { useKpiSettings } from '@/hooks/useKpiSettings';

export function useNotifications(branchId?: number) {
    const queryClient = useQueryClient();
    const { data: kpiSettings } = useKpiSettings(branchId, true);
    const intervalMs =
        (kpiSettings?.notification_rules?.check_frequency_minutes ?? DEFAULT_CHECK_FREQUENCY_MINUTES) * 60_000;

    const invalidateBoth = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    };

    const list  = useQuery({ queryKey: ['notifications'], queryFn: fetchUnreadNotifications, refetchInterval: intervalMs });
    const count = useQuery({ queryKey: ['notifications', 'count'], queryFn: fetchUnreadCount, refetchInterval: intervalMs });
    const markRead    = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidateBoth });
    const markAllRead = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidateBoth });

    return { list, count, markRead, markAllRead };
}
