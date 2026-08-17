'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { toast } from 'sonner';
import { User, Lock, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword,
            });
            toast.success('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        outline: 'none',
        boxSizing: 'border-box' as const,
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.375rem',
    };

    return (
        <div style={{ maxWidth: '640px' }}>

            {/* Profile Info Card */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                marginBottom: '1.25rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <User size={18} color="#2563eb" />
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                        Profile Information
                    </h3>
                </div>

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '4rem', height: '4rem',
                        background: '#eff6ff',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 700, color: '#2563eb',
                    }}>
                        {(user?.info?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                            {user?.info ? `${user.info.first_name} ${user.info.last_name}` : user?.username}
                        </div>
                        <div style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            padding: '0.2rem 0.625rem',
                            background: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                        }}>
                            {user?.roles?.[0] || user?.user_type}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                        { label: 'Username', value: user?.username },
                        { label: 'Email', value: user?.info?.email || '—' },
                        { label: 'User Type', value: user?.user_type },
                        { label: 'Company ID', value: user?.company_id },
                        { label: 'Branch ID', value: user?.branch_id || 'All Branches' },
                        { label: 'Roles', value: user?.roles?.join(', ') || 'No roles' },
                    ].map((item) => (
                        <div key={item.label} style={{
                            padding: '0.75rem',
                            background: '#f8fafc',
                            borderRadius: '0.5rem',
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
                                {String(item.value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Change Password Card */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <Lock size={18} color="#2563eb" />
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                        Change Password
                    </h3>
                </div>

                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Current Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.currentPassword}
                            onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                            style={inputStyle}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>New Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.newPassword}
                            onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                            style={inputStyle}
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.confirmPassword}
                            onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                            style={inputStyle}
                            placeholder="Repeat new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.625rem',
                            background: loading ? '#93c5fd' : '#2563eb',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Updating...</>
                        ) : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}