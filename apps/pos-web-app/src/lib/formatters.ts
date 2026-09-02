export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-LK').format(value);

// ─── "5m ago" / "2h ago" / "3d ago" style relative timestamps, used by the
// notifications dropdown. Falls back to a plain date once it's over a week old.
export const formatRelativeTime = (value: string | Date): string => {
    const date = typeof value === 'string' ? new Date(value) : value;
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
};