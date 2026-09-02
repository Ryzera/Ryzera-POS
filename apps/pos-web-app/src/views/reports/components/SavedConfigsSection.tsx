
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';
import { useSavedConfigs, useDeleteSavedConfig } from '@/hooks/useReportsHub';
import { Skeleton } from '@/components/ui/skeleton';
import { REPORT_TYPE_META } from '../constants/report-type.constants';
import { SaveConfigModal } from './SaveConfigModal';
import type { SavedReportConfig } from "@/types/reports-hub.types";
import { useAuthStore } from "@/store/auth.store";

export function SavedConfigsSection() {
    const router  = useRouter();
    const { data: configs, isLoading } = useSavedConfigs();
    const { mutate: deleteConfig, isPending: isDeleting } = useDeleteSavedConfig();
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuthStore();
    const isAdmin = user?.roles?.includes("ADMIN") || user?.user_type === "ADMIN";

    // Navigate to the correct report page with pre-filled filters via search params
  const handleLoad = (config: SavedReportConfig) => {
    const meta = REPORT_TYPE_META.find((m) => m.type === config.reportType);
    if (!meta) return;

    const params = new URLSearchParams({
      dateFrom: config.startDate,
      dateTo: config.endDate,
      date: config.startDate, // Added for Daily Summary report compatibility
      ...(config.branchId ? { branchId: String(config.branchId) } : {}),
      ...(config.categoryId ? { categoryId: config.categoryId } : {}),
    });

    router.push(`${meta.route}?${params.toString()}`);
  };

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-[15px] font-bold text-gray-900">
                        Saved Report Configurations
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        Quickly reload your common report setups
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-[#1B2559] hover:bg-[#232f6e]
                               text-white text-[12px] font-semibold rounded-xl px-3.5 py-2 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Save Current
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
            ) : !configs?.length ? (
                <p className="text-[12px] text-gray-400 py-6 text-center">
                    No saved configurations yet.
                </p>
            ) : (
                <ul className="space-y-2">
                    {configs.map(config => {
                        const isOwner = config.userId === Number(user?.id);
                        const canAccess = isAdmin || isOwner;   // controls both click-to-load and delete

                        return (
                            <li
                                key={config.id}
                                onClick={() => canAccess && handleLoad(config)}
                                className={`flex items-center justify-between border border-gray-100
                        rounded-xl px-4 py-3 transition-colors group
                        ${canAccess ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default opacity-70'}`}
                            >
                                <div>
                                    <p className="text-[13px] font-semibold text-gray-900">
                                        {config.configName}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {REPORT_TYPE_META.find(m => m.type === config.reportType)?.label}
                                        {' · '}{config.startDate} – {config.endDate}
                                        {config.branch ? ` · ${config.branch.name}` : ' · All Branches'}
                                        {config.categoryId ? ` · Cat ${config.categoryId}` : ' · All Categories'}
                                        {!canAccess && ' · Created by another user'}
                                    </p>
                                </div>
                                {canAccess && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConfig(config.id);
                                        }}
                                        disabled={isDeleting}
                                        className="w-7 h-7 rounded-lg border border-red-100 text-red-400
                               hover:bg-red-50 flex items-center justify-center
                               transition-colors flex-shrink-0"
                                        aria-label={`Delete ${config.configName}`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Modal */}
            <SaveConfigModal open={showModal} onClose={() => setShowModal(false)} />
        </section>
    );
}
