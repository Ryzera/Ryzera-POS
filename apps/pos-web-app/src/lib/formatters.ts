// ============================================================
// Shared Formatting Utilities
// File: src/lib/formatters.ts
// ============================================================

/**
 * Formats a number as a currency string without the 'Rs' prefix.
 * The prefix is added at the call site so it can be styled separately.
 * Example: 12456.78 → '12,456.78'
 */
export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

/**
 * Formats a number with thousand separators, no decimals.
 * Example: 1274 → '1,274'
 */
export const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-LK').format(value);