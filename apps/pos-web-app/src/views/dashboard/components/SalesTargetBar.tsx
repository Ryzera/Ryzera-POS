
interface SalesTargetBarProps {
    currentRevenue: number;  // month-to-date revenue
    target:         number;  // set by SUPER_ADMIN
}

export function SalesTargetBar({ currentRevenue, target }: SalesTargetBarProps) {
    const now             = new Date();
    const lastDay         = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining   = lastDay - now.getDate();
    const percentage      = target > 0 ? Math.min((currentRevenue / target) * 100, 100) : 0;
    const dailyNeeded     = daysRemaining > 0
        ? Math.max(0, (target - currentRevenue) / daysRemaining)
        : 0;

    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-1">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-base">📈</span>
                        <p className="text-[14px] font-bold text-gray-800">
                            Monthly Sales Target — {monthLabel}
                        </p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                        {dailyNeeded > 0 && ` — needs Rs. ${dailyNeeded.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day to hit target`}
                    </p>
                </div>
                <span className="text-[20px] font-bold text-blue-600">
                    {percentage.toFixed(1)}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full mt-3 mb-3">
                <div
                    className="h-2.5 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between text-[11px] text-gray-400">
                <span>Current: Rs. {currentRevenue.toLocaleString('en-IN')}</span>
                <span>Target: Rs. {target.toLocaleString('en-IN')}</span>
            </div>
        </div>
    );
}