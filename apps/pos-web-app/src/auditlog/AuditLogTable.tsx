'use client';

// apps/pos-web-app/src/auditlog/AuditLogTable.tsx
// REPLACE existing AuditLogTable.tsx with this file

import { useState } from 'react';
import { RefreshCw, Monitor, Globe, MapPin } from 'lucide-react';
import { useAuditLogs, LogAction, LogStatus } from './useAuditLogs';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<LogAction, string> = {
    LOGIN:            'Login',
    LOGOUT:           'Logout',
    CREATE_USER:      'Create User',
    UPDATE_USER:      'Update User',
    DELETE_USER:      'Delete User',
    ROLE_ASSIGNED:    'Role Assigned',
    PASSWORD_CHANGED: 'Password Changed',
};

const ACTION_COLORS: Record<LogAction, { bg: string; color: string }> = {
    LOGIN:            { bg: '#eff6ff', color: '#2563eb' },
    LOGOUT:           { bg: '#f8fafc', color: '#64748b' },
    CREATE_USER:      { bg: '#f0fdf4', color: '#16a34a' },
    UPDATE_USER:      { bg: '#fefce8', color: '#ca8a04' },
    DELETE_USER:      { bg: '#fef2f2', color: '#dc2626' },
    ROLE_ASSIGNED:    { bg: '#fdf4ff', color: '#9333ea' },
    PASSWORD_CHANGED: { bg: '#fff7ed', color: '#ea580c' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LogStatus }) {
    const isSuccess = status === 'SUCCESS';
    return (
        <span style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: isSuccess ? '#f0fdf4' : '#fef2f2',
            color: isSuccess ? '#16a34a' : '#dc2626',
        }}>
            {status}
        </span>
    );
}

function ActionBadge({ action }: { action: LogAction }) {
    const style = ACTION_COLORS[action] ?? { bg: '#f8fafc', color: '#64748b' };
    return (
        <span style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: style.bg,
            color: style.color,
        }}>
            {ACTION_LABELS[action] ?? action}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    userId: number;
    userName?: string;
}

export default function AuditLogTable({ userId, userName }: Props) {
    const [action, setAction]   = useState<LogAction | ''>('');
    const [status, setStatus]   = useState<LogStatus | ''>('');
    const [from,   setFrom]     = useState('');
    const [to,     setTo]       = useState('');
    const [page,   setPage]     = useState(1);

    const { result, loading, error, refetch } = useAuditLogs(userId, {
        action: action || undefined,
        status: status || undefined,
        from:   from   || undefined,
        to:     to     || undefined,
        page,
        limit: 10,
    });

    const resetFilters = () => {
        setAction('');
        setStatus('');
        setFrom('');
        setTo('');
        setPage(1);
    };

    const selectStyle: React.CSSProperties = {
        padding: '0.45rem 0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '0.8rem',
        background: 'white',
        color: '#374151',
        outline: 'none',
    };

    const inputStyle: React.CSSProperties = {
        ...selectStyle,
        minWidth: '130px',
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
        }}>
            {/* ── Card Header ── */}
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
            }}>
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        Activity Log {userName ? `— ${userName}` : ''}
                    </h3>
                    {result && (
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {result.total} records found
                        </p>
                    )}
                </div>
                <button
                    onClick={() => { resetFilters(); refetch(); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.45rem 0.875rem',
                        background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', cursor: 'pointer',
                        fontSize: '0.8rem', color: '#64748b',
                    }}
                >
                    <RefreshCw size={13} />
                    Refresh
                </button>
            </div>

            {/* ── Filters ── */}
            <div style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                gap: '0.625rem',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                {/* Action filter */}
                <select
                    value={action}
                    style={selectStyle}
                    onChange={e => { setAction(e.target.value as LogAction | ''); setPage(1); }}
                >
                    <option value="">All Actions</option>
                    {Object.entries(ACTION_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>

                {/* Status filter */}
                <select
                    value={status}
                    style={selectStyle}
                    onChange={e => { setStatus(e.target.value as LogStatus | ''); setPage(1); }}
                >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                </select>

                {/* Date range */}
                <input
                    type="date"
                    value={from}
                    style={inputStyle}
                    onChange={e => { setFrom(e.target.value); setPage(1); }}
                />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>to</span>
                <input
                    type="date"
                    value={to}
                    style={inputStyle}
                    onChange={e => { setTo(e.target.value); setPage(1); }}
                />

                {/* Clear button — only show when filters active */}
                {(action || status || from || to) && (
                    <button
                        onClick={resetFilters}
                        style={{
                            padding: '0.45rem 0.75rem',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '0.5rem', cursor: 'pointer',
                            fontSize: '0.75rem', color: '#dc2626',
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* ── Body ── */}
            {loading && (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Loading activity logs...
                </div>
            )}

            {error && (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['Date & Time', 'Action', 'Status', 'IP Address', 'Device', 'Branch'].map(h => (
                                    <th key={h} style={{
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {result?.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#94a3b8',
                                        fontSize: '0.875rem',
                                    }}>
                                        No activity found.
                                    </td>
                                </tr>
                            )}
                            {result?.data.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {/* Date */}
                                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <ActionBadge action={log.action} />
                                    </td>

                                    {/* Status */}
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <StatusBadge status={log.status} />
                                    </td>

                                    {/* IP Address */}
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {log.ip_address ? (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace',
                                            }}>
                                                    <Globe size={11} color="#94a3b8" />
                                                {log.ip_address}
                                                </span>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>

                                    {/* Device */}
                                    <td style={{ padding: '0.875rem 1rem', maxWidth: '200px' }}>
                                        {log.device_info ? (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                fontSize: '0.75rem', color: '#64748b',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}
                                                  title={log.device_info}
                                            >
                                                    <Monitor size={11} color="#94a3b8" />
                                                {log.device_info}
                                                </span>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>

                                    {/* Branch */}
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {log.branch_name ? (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                fontSize: '0.8rem', color: '#475569',
                                            }}>
                                                    <MapPin size={11} color="#94a3b8" />
                                                {log.branch_name}
                                                </span>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {result && result.totalPages > 1 && (
                        <div style={{
                            padding: '0.875rem 1.25rem',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                        }}>
                            <span style={{ color: '#64748b' }}>
                                Page {result.page} of {result.totalPages}
                                <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                                    ({result.total} total)
                                </span>
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.375rem',
                                        background: 'white',
                                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                        opacity: page <= 1 ? 0.4 : 1,
                                        color: '#374151',
                                    }}
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page >= result.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.375rem',
                                        background: 'white',
                                        cursor: page >= result.totalPages ? 'not-allowed' : 'pointer',
                                        opacity: page >= result.totalPages ? 0.4 : 1,
                                        color: '#374151',
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}