
import { useDeliveryHistory, useResendDelivery } from '@/hooks/useReportsHub';
import { Skeleton } from '@/components/ui/skeleton';
import { DELIVERY_STATUS_CONFIG } from '../constants/report-type.constants';
import { DeliveryStatus } from '@/types/reports-hub.types';

interface Props {
    scheduleId: string;
}

export function DeliveryHistorySection({ scheduleId }: Props) {
    const { data: deliveries, isLoading } = useDeliveryHistory(scheduleId);
    const { mutate: resend, isPending: isResending } = useResendDelivery();

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)}
            </div>
        );
    }

    if (!deliveries?.length) {
        return (
            <p className="text-[11px] text-gray-400 py-2">No deliveries yet.</p>
        );
    }

    return (
        <div>
            <p className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Delivery History
            </p>
            <ul className="space-y-2">
                {deliveries.map(delivery => {
                    const statusCfg = DELIVERY_STATUS_CONFIG[delivery.status];

                    return (
                        <li
                            key={delivery.id}
                            className="flex items-center gap-3 text-[12px]"
                        >
                            {/* Date */}
                            <span className="text-gray-500 w-24 flex-shrink-0">
                                {delivery.sentAt.slice(0, 10)}
                            </span>

                            {/* Status badge */}
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                            ${statusCfg?.className ?? ''}`}
                            >
                                {statusCfg?.label ?? delivery.status}
                            </span>

                            {/* Recipient */}
                            <span className="text-gray-400 flex-1 truncate">
                                {delivery.recipientEmail}
                            </span>

                            {/* Time */}
                            <span className="text-gray-400 flex-shrink-0">
                                {new Date(delivery.sentAt).toLocaleTimeString([], {
                                    hour:   '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>

                            {/* Action button */}
                            {delivery.status === DeliveryStatus.FAILED ? (
                                <button
                                    onClick={() =>
                                        resend(delivery.id, {
                                            // Pass scheduleId so the hook can invalidate
                                            // the right delivery query
                                        } as never)
                                    }
                                    disabled={isResending}
                                    className="text-[11px] font-semibold text-white bg-[#1B2559]
                                               hover:bg-[#232f6e] rounded-lg px-2.5 py-1
                                               transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    Retry
                                </button>
                            ) : (
                                <button
                                    className="text-[11px] font-medium text-gray-500
                                               border border-gray-200 rounded-lg px-2.5 py-1
                                               hover:bg-gray-100 transition-colors flex-shrink-0"
                                >
                                    Resend
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}