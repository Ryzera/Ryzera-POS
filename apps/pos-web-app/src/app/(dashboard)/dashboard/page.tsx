'use client';

import { useAuthStore } from '@/store/auth.store';
import { Users, Shield, Building2, GitBranch } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ users: 0, roles: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, rolesRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/roles'),
                ]);
                setStats({
                    users: usersRes.data.data?.length || 0,
                    roles: rolesRes.data.data?.length || 0,
                });
            } catch {}
        };
        fetchStats();
    }, []);

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

    const cards = [
        { label: 'Total Users', value: stats.users, icon: Users, color: '#2563eb', bg: '#eff6ff' },
        { label: 'Total Roles', value: stats.roles, icon: Shield, color: '#16a34a', bg: '#f0fdf4' },
        { label: 'Company', value: 'Ryzera Holdings', icon: Building2, color: '#d97706', bg: '#fffbeb' },
        { label: 'Branch', value: user?.branch_id ? `Branch #${user.branch_id}` : 'All', icon: GitBranch, color: '#7c3aed', bg: '#f5f3ff' },
    ];

    return (
        <div>
            {/* Welcome */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                color: 'white',
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Welcome back, {user?.info?.first_name || user?.username}! 👋
                </h2>
                <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>
                    {isAdmin ? 'You have full admin access to the system.' : 'You are logged in as ' + (user?.roles?.[0] || user?.user_type)}
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                {cards.map((card) => (
                    <div key={card.label} style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem',
                            background: card.bg,
                            borderRadius: '0.5rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <card.icon size={18} color={card.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                {card.value}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {card.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Role Info */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid #e2e8f0',
            }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                    Your Access Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { label: 'Username', value: user?.username },
                        { label: 'User Type', value: user?.user_type },
                        { label: 'Roles', value: user?.roles?.join(', ') || 'No roles assigned' },
                        { label: 'Company ID', value: user?.company_id },
                        { label: 'Branch ID', value: user?.branch_id || 'All Branches' },
                    ].map((item) => (
                        <div key={item.label} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '0.875rem',
                        }}>
                            <span style={{ color: '#64748b' }}>{item.label}</span>
                            <span style={{ color: '#0f172a', fontWeight: 500 }}>{String(item.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}