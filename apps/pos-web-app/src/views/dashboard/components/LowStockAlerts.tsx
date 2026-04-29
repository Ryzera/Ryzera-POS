
import { TriangleAlert } from 'lucide-react';
import type { LowStockItem } from '@/types/dashboard.types';

interface LowStockAlertsProps {
    items:     LowStockItem[];
    isLoading: boolean;
}

export function LowStockAlerts({ items, isLoading }: LowStockAlertsProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
                <TriangleAlert className="h-4 w-4 text-orange-500" />
                <p className="text-[14px] font-bold text-gray-800">Low Stock Alerts</p>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">Products below minimum stock level</p>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-6">All stock levels are healthy</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-orange-100 bg-orange-50/30"
                        >
                            <div>
                                <p className="text-[13px] font-semibold text-gray-800">{item.productName}</p>
                                <p className="text-[11px] text-gray-400">{item.category ?? '—'}</p>
                            </div>
                            <span className="text-[12px] font-bold text-white bg-orange-500 px-3 py-1 rounded-full">
                                {item.stockAmount} units
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}