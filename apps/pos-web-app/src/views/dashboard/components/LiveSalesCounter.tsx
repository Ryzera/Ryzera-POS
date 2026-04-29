// ============================================================
// Live Sales Counter Card
// File: src/views/dashboard/components/LiveSalesCounter.tsx
// ============================================================

'use client';

interface LiveSalesCounterProps {
    totalSalesThisMonth: number;
    isLoading:           boolean;
    isRefreshing?:       boolean;
}

export function LiveSalesCounter({
                                     totalSalesThisMonth,
                                     isLoading,
                                     isRefreshing = false,
                                 }: LiveSalesCounterProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-bold text-gray-800">Live Sales Counter</p>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        isRefreshing ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'
                    }`} />
                    Auto-refreshes every 30s
                </span>
            </div>

            {isLoading ? (
                <div className="h-10 bg-gray-100 animate-pulse rounded-lg mt-3 w-48" />
            ) : (
                <p className={`text-[32px] font-bold mt-2 transition-all duration-300 ${
                    isRefreshing ? 'text-blue-500 scale-105' : 'text-emerald-500'
                }`}
                   style={{ transformOrigin: 'left center' }}>
                    Rs {totalSalesThisMonth.toLocaleString('en-LK', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
                </p>
            )}
            <p className="text-[11px] text-gray-400 mt-1">Total sales this month</p>
        </div>
    );
}