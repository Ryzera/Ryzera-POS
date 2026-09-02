
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useSchedules, useDeleteSchedule } from '@/hooks/useReportsHub';
import { Skeleton } from '@/components/ui/skeleton';
import { REPORT_TYPE_META, FREQUENCY_LABELS } from '../constants/report-type.constants';
import { AddScheduleModal } from './AddScheduleModal';
import { DeliveryHistorySection } from './DeliveryHistorySection';
import type { ReportSchedule } from "@/types/reports-hub.types";
import { useAuthStore } from "@/store/auth.store";

export function ScheduledReportsSection() {
    const { data: schedules, isLoading } = useSchedules();
    const { mutate: deleteSchedule }      = useDeleteSchedule();
    const [showModal, setShowModal]       = useState(false);
    const [expandedId, setExpandedId]     = useState<string | null>(null);
    const { user } = useAuthStore();
    const isAdmin = user?.roles?.includes("ADMIN") || user?.user_type === "ADMIN";

    // Auto-expand the first schedule so delivery history is visible by default
    useEffect(() => {
        const first = schedules?.[0];
        if (first && expandedId === null) {
            setExpandedId(first.id);
        }
    }, [schedules, expandedId]);

    const toggleDeliveries = (scheduleId: string) =>
        setExpandedId(prev => (prev === scheduleId ? null : scheduleId));

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-[15px] font-bold text-gray-900">Scheduled Reports</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Automated reports sent via email
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-[#1B2559] hover:bg-[#232f6e]
                               text-white text-[12px] font-semibold rounded-xl px-3.5 py-2
                               transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Schedule
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
            ) : !schedules?.length ? (
                <p className="text-[12px] text-gray-400 py-6 text-center">
                    No schedules yet. Add one above.
                </p>
            ) : (
                <ul className="space-y-3">
                    {schedules.map((schedule: ReportSchedule) => {
                      const canDelete =
                        isAdmin || schedule.userId === Number(user?.id);
                        isAdmin || schedule.userId === Number(user?.id);
                        return (
                            <li key={schedule.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                {/* Row */}
                                <div
                                    className="flex items-start justify-between px-4 py-3
                                               cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleDeliveries(schedule.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-[13px] font-semibold text-gray-900">
                                                {schedule.scheduleName}
                                            </p>
                                            <span className="text-[10px] font-semibold bg-blue-50
                                                              text-blue-600 px-2 py-0.5 rounded-full">
                                                {REPORT_TYPE_META.find(m => m.type === schedule.reportType)?.label}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency}
                                            {' · '}{schedule.recipientEmail}
                                            {schedule.branch ? ` · ${schedule.branch.name}` : ' · All Branches'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Next run: {schedule.nextRunAt ? schedule.nextRunAt.slice(0, 10) : 'Not scheduled'}
                                        </p>
                                    </div>
                                    {canDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSchedule(schedule.id);
                                            }}
                                            className="w-7 h-7 rounded-lg border border-red-100 text-red-400
                                                       hover:bg-red-50 flex items-center justify-center
                                                       transition-colors flex-shrink-0 ml-2"
                                            aria-label={`Delete ${schedule.scheduleName}`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Expanded delivery history */}
                                {expandedId === schedule.id && (
                                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                                        <DeliveryHistorySection scheduleId={schedule.id} />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            <AddScheduleModal open={showModal} onClose={() => setShowModal(false)} />
        </section>
    );
}
