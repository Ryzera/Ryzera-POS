'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
}

export default function RegisterUserPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [roles, setRoles] = useState<Role[]>([]);
    const [branches, setBranches] = useState<{id: number, name: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        user_type: 'STAFF',
        roleId: '',
        branch_id: '',
    });

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard');
            return;
        }

        // async function inside useEffect
        const fetchData = async () => {
            const [branchRes, roleRes] = await Promise.all([
                api.get('/branches'),
                api.get('/roles'),
            ]);
            setBranches(branchRes.data.data || []);
            setRoles(roleRes.data.data || []);
        };

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { roleId, ...userData } = form;
            const res = await api.post('/users', {
                ...userData,
                company_id: user?.company_id,
                branch_id: user?.branch_id,
            });

            if (roleId) {
                await api.post(`/users/${res.data.data.id}/roles`, { roleId: Number(roleId) });
            }

            toast.success('User created successfully!');
            router.push('/users');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create user');
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
        color: '#0f172a',
        background: 'white',
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
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => router.push('/users')}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '2rem', height: '2rem',
                        background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem', cursor: 'pointer', color: '#64748b',
                    }}
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Register New User</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Add a new user to the system</p>
                </div>
            </div>

            {/* Form */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Name Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>First Name *</label>
                            <input name="first_name" required value={form.first_name} onChange={handleChange} style={inputStyle} placeholder="John" />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name *</label>
                            <input name="last_name" required value={form.last_name} onChange={handleChange} style={inputStyle} placeholder="Silva" />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label style={labelStyle}>Username *</label>
                        <input name="username" required value={form.username} onChange={handleChange} style={inputStyle} placeholder="john_silva" />
                    </div>

                    {/* Password */}
                    <div>
                        <label style={labelStyle}>Password *</label>
                        <input name="password" type="password" required value={form.password} onChange={handleChange} style={inputStyle} placeholder="Min 6 characters" />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="john@example.com" />
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input name="phone_number" value={form.phone_number} onChange={handleChange} style={inputStyle} placeholder="+94771234567" />
                    </div>

                    {/* User Type + Role */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>User Type *</label>
                            <select name="user_type" value={form.user_type} onChange={handleChange} style={inputStyle}>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Role</label>
                            <select name="roleId" value={form.roleId} onChange={handleChange} style={inputStyle}>
                                <option value="">Select Role</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}

                    <div>
                        <label style={labelStyle}>
                            Branch {form.user_type !== 'ADMIN' ? '*' : '(Optional — Admin has all branch access)'}
                        </label>
                        <select
                            name="branch_id"
                            required={form.user_type !== 'ADMIN'}
                            value={form.branch_id || ''}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="">
                                {form.user_type === 'ADMIN' ? 'All Branches (Admin Access)' : 'Select Branch'}
                            </option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        {form.user_type === 'ADMIN' && (
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Admin users have access to all branches
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => router.push('/users')}
                            style={{
                                flex: 1, padding: '0.625rem',
                                background: 'white', border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem', cursor: 'pointer',
                                fontSize: '0.875rem', color: '#64748b',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1, padding: '0.625rem',
                                background: loading ? '#93c5fd' : '#2563eb',
                                border: 'none', borderRadius: '0.5rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem', color: 'white', fontWeight: 500,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}
                        >
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create User'}
                        </button>
                    </div>


                </form>
            </div>
        </div>
    );
}