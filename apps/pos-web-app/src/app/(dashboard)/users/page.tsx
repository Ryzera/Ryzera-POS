'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { UserPlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: number;
    username: string;
    user_type: string;
    status: string;
    created_at: string;
    userRoles: { role: { name: string } }[];
    info: { first_name: string; last_name: string; email?: string } | null;
    branch: { id: number; name: string; code: string } | null;
}

export default function UsersPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/users');
            setUsers(res.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(u => {
        const fullName = `${u.info?.first_name || ''} ${u.info?.last_name || ''}`.toLowerCase().trim();
        const searchLower = search.toLowerCase();
        const matchSearch = !search ||
            u.username.toLowerCase().includes(searchLower) ||
            fullName.includes(searchLower) ||
            (u.info?.email || '').toLowerCase().includes(searchLower);
        const matchRole = !filterRole || u.userRoles?.[0]?.role?.name === filterRole;
        const matchStatus = !filterStatus || u.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
    });

    const getStatusColor = (status: string) => {
        if (status === 'ACTIVE') return { bg: '#f0fdf4', color: '#16a34a' };
        if (status === 'SUSPENDED') return { bg: '#fef2f2', color: '#dc2626' };
        return { bg: '#f8fafc', color: '#64748b' };
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>User Management</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {filteredUsers.length} of {users.length} users
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={fetchUsers} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'white',
                        border: '1px solid #e2e8f0', borderRadius: '0.5rem',
                        cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                    }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    {isAdmin && (
                        <button onClick={() => router.push('/users/register')} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: '#2563eb', border: 'none',
                            borderRadius: '0.5rem', cursor: 'pointer',
                            fontSize: '0.875rem', color: 'white', fontWeight: 500,
                        }}>
                            <UserPlus size={14} /> Add User
                        </button>
                    )}
                </div>
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: '200px', padding: '0.5rem 0.875rem',
                        border: '1px solid #e2e8f0', borderRadius: '0.5rem',
                        fontSize: '0.875rem', outline: 'none', background: 'white',
                    }}
                />
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{
                        padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', fontSize: '0.875rem', background: 'white',
                        cursor: 'pointer',
                    }}
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', fontSize: '0.875rem', background: 'white',
                        cursor: 'pointer',
                    }}
                >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>{error}</div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No users found matching your search.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['#', 'Name', 'Username', 'Role', 'Branch', 'Type', 'Status', 'Joined', 'Actions'].map(h => (
                                <th key={h} style={{
                                    padding: '0.75rem 1rem', textAlign: 'left',
                                    fontSize: '0.75rem', fontWeight: 600, color: '#64748b',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((u, index) => {
                            const statusStyle = getStatusColor(u.status);
                            return (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        <div
                                            onClick={() => router.push(`/users/${u.id}`)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
                                        >
                                            <div style={{
                                                width: '2rem', height: '2rem', background: '#eff6ff',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '0.75rem',
                                                fontWeight: 700, color: '#2563eb', flexShrink: 0,
                                            }}>
                                                {(u.info?.first_name?.[0] || u.username[0]).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
                                                    {u.info ? `${u.info.first_name} ${u.info.last_name}` : '-'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    {u.info?.email || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569', fontFamily: 'monospace' }}>
                                        {u.username}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                                        {u.userRoles?.[0]?.role?.name || '—'}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                                        {u.branch?.name || '—'}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.7rem', fontWeight: 500,
                          background: u.user_type === 'ADMIN' ? '#eff6ff' : '#f8fafc',
                          color: u.user_type === 'ADMIN' ? '#2563eb' : '#64748b',
                      }}>
                        {u.user_type}
                      </span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.7rem', fontWeight: 500,
                          background: statusStyle.bg, color: statusStyle.color,
                      }}>
                        {u.status}
                      </span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.875rem 1rem' }}>
                                        {isAdmin && (
                                            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => router.push(`/users/edit/${u.id}`)}
                                                    style={{
                                                        padding: '0.3rem 0.625rem', background: '#eff6ff', color: '#2563eb',
                                                        border: '1px solid #bfdbfe', borderRadius: '0.375rem',
                                                        fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                                                    }}
                                                >Edit</button>
                                                <button
                                                    onClick={() => router.push(`/users/${u.id}/logs`)}
                                                    style={{
                                                        padding: '0.3rem 0.625rem', background: '#f0fdf4', color: '#16a34a',
                                                        border: '1px solid #bbf7d0', borderRadius: '0.375rem',
                                                        fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                                                    }}
                                                >Logs</button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    style={{
                                                        padding: '0.3rem 0.625rem', background: '#fef2f2', color: '#dc2626',
                                                        border: '1px solid #fecaca', borderRadius: '0.375rem',
                                                        fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                                                    }}
                                                >Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
