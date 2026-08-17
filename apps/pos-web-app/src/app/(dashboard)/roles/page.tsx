'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Shield } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description?: string;
    authorities: { authority: { id: number; name: string } }[];
    _count?: { userRoles: number };
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/roles')
            .then(res => setRoles(res.data.data || []))
            .finally(() => setLoading(false));
    }, []);

    const roleColors: Record<string, { bg: string; color: string }> = {
        ADMIN: { bg: '#eff6ff', color: '#2563eb' },
        MANAGER: { bg: '#f0fdf4', color: '#16a34a' },
        CASHIER: { bg: '#fffbeb', color: '#d97706' },
        INVENTORY_MANAGER: { bg: '#f5f3ff', color: '#7c3aed' },
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Roles & Authorities</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {roles.length} roles configured
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {roles.map(role => {
                        const colors = roleColors[role.name] || { bg: '#f8fafc', color: '#64748b' };
                        return (
                            <div key={role.id} style={{
                                background: 'white',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                padding: '1.25rem',
                            }}>
                                {/* Role Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '2.5rem', height: '2.5rem',
                                        background: colors.bg,
                                        borderRadius: '0.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Shield size={18} color={colors.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{role.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{role.description || 'No description'}</div>
                                    </div>
                                </div>

                                {/* Authorities */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                        AUTHORITIES ({role.authorities?.length || 0})
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                        {role.authorities?.slice(0, 6).map(a => (
                                            <span key={a.authority.id} style={{
                                                padding: '0.2rem 0.5rem',
                                                background: colors.bg,
                                                color: colors.color,
                                                borderRadius: '0.25rem',
                                                fontSize: '0.65rem',
                                                fontWeight: 500,
                                            }}>
                        {a.authority.name}
                      </span>
                                        ))}
                                        {(role.authorities?.length || 0) > 6 && (
                                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', padding: '0.2rem 0.5rem' }}>
                        +{role.authorities.length - 6} more
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}