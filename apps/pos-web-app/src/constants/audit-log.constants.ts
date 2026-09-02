import type { AuditAction } from '@/types/audit-log.types';

// ─── Matches AuditAction in audit-log.schema.ts exactly ──────────────────────
export const AUDIT_ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
    { value: 'Generated',    label: 'Generated'    },
    { value: 'Exported PDF', label: 'Exported PDF' },
    { value: 'Exported CSV', label: 'Exported CSV' },
];

export const AUDIT_LOG_PAGE_SIZE = 50;

export const ACTION_BADGE_STYLES: Record<AuditAction, string> = {
    Generated:      'bg-blue-50 text-blue-700 border-blue-100',
    'Exported PDF': 'bg-rose-50 text-rose-700 border-rose-100',
    'Exported CSV': 'bg-emerald-50 text-emerald-700 border-emerald-100',
};