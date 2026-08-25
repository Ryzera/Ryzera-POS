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

const STAFF_TYPE_ROLE_NAMES = ['CASHIER', 'INVENTORY_MANAGER'];

export default function RegisterUserPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const [roles,    setRoles]    = useState<Role[]>([]);
    const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
    const [loading,  setLoading]  = useState(false);
    const [ready,    setReady]    = useState(false); // ← hydration guard

    const [form, setForm] = useState({
        username:     '',
        password:     '',
        first_name:   '',
        last_name:    '',
        email:        '',
        phone_number: '',
        user_type:    'STAFF',
        roleId:       '',
        branch_id:    '',
    });

    // ─── Role helpers ─────────────────────────────────────────────────────────
    const isAdmin   = user?.roles?.includes('ADMIN')   || user?.user_type === 'ADMIN';
    const isManager = user?.roles?.includes('MANAGER');
    const canRegister = isAdmin || isManager;

    const assignableRoles = isManager && !isAdmin
        ? roles.filter(r => STAFF_TYPE_ROLE_NAMES.includes(r.name))
        : roles;

    // Back destination — Manager has no /users page
    const backPath = isAdmin ? '/users' : '/dashboard';

    // ─── Hydration-safe auth + data fetch ────────────────────────────────────
    useEffect(() => {
        // Wait until auth store is hydrated (user object is available)
        if (!isAuthenticated) return;   // still loading auth
        setReady(true);

        if (!canRegister) {
            router.push('/dashboard');
            return;
        }

        if (isManager) {
            setForm(prev => ({ ...prev, user_type: 'STAFF' }));
        }

        const fetchData = async () => {
            try {
                const [branchRes, roleRes] = await Promise.all([
                    api.get('/branches'),
                    api.get('/roles'),
                ]);

                // Backend wraps every response as { data: <payload> } via ResponseInterceptor.
                // /branches payload is paginated: { items, total, page, limit }.
                const branchPayload = branchRes.data?.data;
                setBranches(Array.isArray(branchPayload) ? branchPayload : (branchPayload?.items || []));

                // /roles payload — adjust if it's also paginated with an `items` key.
                const rolePayload = roleRes.data?.data;
                setRoles(Array.isArray(rolePayload) ? rolePayload : (rolePayload?.items || []));
            } catch {
                toast.error('Failed to load form data');
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, canRegister]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { roleId, branch_id, ...userData } = form;

            const effectiveBranchId = isManager && !isAdmin
                ? user?.branch_id
                : (branch_id ? Number(branch_id) : undefined);

            const res = await api.post('/users', {
                ...userData,
                company_id: user?.company_id,
                branch_id:  effectiveBranchId,
            });

            if (roleId) {
                await api.post(`/users/${res.data.data.id}/roles`, {
                    roleId: Number(roleId),
                });
            }

            toast.success('User created successfully!');
            router.push(backPath);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    // ─── Styles ───────────────────────────────────────────────────────────────
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.625rem 0.875rem',
        border: '1px solid #e2e8f0', borderRadius: '0.5rem',
        fontSize: '0.875rem', color: '#0f172a',
        background: 'white', outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.8rem',
        fontWeight: 500, color: '#374151',
        marginBottom: '0.375rem',
    };

    // ─── Loading state (before hydration) ────────────────────────────────────
    if (!ready) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                Loading...
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: '640px' }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center',
                gap: '0.75rem', marginBottom: '1.5rem',
            }}>
                <button
                    onClick={() => router.push(backPath)}
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
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                        {isManager && !isAdmin ? 'Add Staff Member' : 'Register New User'}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {isManager && !isAdmin
                            ? 'Add a new staff member to your branch'
                            : 'Add a new user to the system'}
                    </p>
                </div>
            </div>

            {/* Manager branch notice */}
            {isManager && !isAdmin && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: '#fdf4ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    color: '#7c3aed',
                }}>
                    ℹ️ Staff will be automatically assigned to your branch (Branch #{user?.branch_id})
                </div>
            )}

            {/* Form */}
            <div style={{
                background: 'white', borderRadius: '0.75rem',
                border: '1px solid #e2e8f0', padding: '1.5rem',
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Name */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>First Name *</label>
                            <input name="first_name" required value={form.first_name}
                                   onChange={handleChange} style={inputStyle} placeholder="John" />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name *</label>
                            <input name="last_name" required value={form.last_name}
                                   onChange={handleChange} style={inputStyle} placeholder="Silva" />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label style={labelStyle}>Username *</label>
                        <input name="username" required value={form.username}
                               onChange={handleChange} style={inputStyle} placeholder="john_silva" />
                    </div>

                    {/* Password */}
                    <div>
                        <label style={labelStyle}>Password *</label>
                        <input name="password" type="password" required value={form.password}
                               onChange={handleChange} style={inputStyle} placeholder="Min 6 characters" />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input name="email" type="email" value={form.email}
                               onChange={handleChange} style={inputStyle} placeholder="john@example.com" />
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input name="phone_number" value={form.phone_number}
                               onChange={handleChange} style={inputStyle} placeholder="+94771234567" />
                    </div>

                    {/* User Type + Role */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>User Type *</label>
                            <select
                                name="user_type"
                                value={form.user_type}
                                onChange={handleChange}
                                style={{
                                    ...inputStyle,
                                    background: isManager && !isAdmin ? '#f8fafc' : 'white',
                                    color: isManager && !isAdmin ? '#94a3b8' : '#0f172a',
                                }}
                                disabled={isManager && !isAdmin}
                            >
                                <option value="STAFF">Staff</option>
                                {isAdmin && <option value="ADMIN">Admin</option>}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Role *</label>
                            <select name="roleId" required value={form.roleId}
                                    onChange={handleChange} style={inputStyle}>
                                <option value="">Select Role</option>
                                {assignableRoles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Branch */}
                    {isManager && !isAdmin ? (
                        <div>
                            <label style={labelStyle}>Branch</label>
                            <div style={{
                                ...inputStyle,
                                background: '#f8fafc', color: '#64748b',
                                display: 'flex', alignItems: 'center',
                            }}>
                                {branches.find(b => b.id === user?.branch_id)?.name || `Branch #${user?.branch_id}`}
                                <span style={{ marginLeft: '0.5rem', color: '#9333ea', fontSize: '0.75rem' }}>
                                    (auto-assigned)
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={labelStyle}>
                                Branch {form.user_type !== 'ADMIN' ? '*' : '(Optional)'}
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
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => router.push(backPath)}
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
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.5rem',
                            }}
                        >
                            {loading
                                ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                                : isManager && !isAdmin ? 'Add Staff Member' : 'Create User'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}