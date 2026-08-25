'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Activity } from 'lucide-react';

interface Log {
    id: number;
    action: string;
    status: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
    LOGIN: '🔑 Login',
    LOGOUT: '🚪 Logout',
    CREATE_USER: '👤 Create User',
    UPDATE_USER: '✏️ Update User',
    DELETE_USER: '🗑️ Delete User',
    ROLE_ASSIGNED: '🛡️ Role Assigned',
    PASSWORD_CHANGED: '🔒 Password Changed',
};

export default function UserLogsPage() {
    const router = useRouter();
    const params = useParams();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logsRes, userRes] = await Promise.all([
                    api.get(`/users/${params.id}/logs`),
                    api.get(`/users/${params.id}`),
                ]);
                setLogs(logsRes.data.data || []);
                setUsername(userRes.data.data?.username || '');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const getStatusStyle = (status: string) => ({
        background: status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2',
        color: status === 'SUCCESS' ? '#16a34a' : '#dc2626',
    });

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => router.push('/users')} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '2rem', height: '2rem', background: 'white',
                    border: '1px solid #e2e8f0', borderRadius: '0.5rem',
                    cursor: 'pointer', color: '#64748b',
                }}>
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Activity Logs</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>@{username} — {logs.length} activities</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total', value: logs.length, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Success', value: logs.filter(l => l.status === 'SUCCESS').length, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Failed', value: logs.filter(l => l.status === 'FAILED').length, color: '#dc2626', bg: '#fef2f2' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem', background: stat.bg,
                            borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Activity size={16} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No activity logs</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['Date & Time', 'Action', 'Status', 'IP Address'].map(h => (
                                <th key={h} style={{
                                    padding: '0.75rem 1rem', textAlign: 'left',
                                    fontSize: '0.75rem', fontWeight: 600, color: '#64748b',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>
                                    {ACTION_LABELS[log.action] || log.action}
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{
                        padding: '0.2rem 0.625rem', borderRadius: '9999px',
                        fontSize: '0.7rem', fontWeight: 600,
                        ...getStatusStyle(log.status),
                    }}>
                      {log.status}
                    </span>
                                </td>
                                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                                    {log.ip_address || '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}