'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const { user: currentUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [roles, setRoles] = useState<{id: number, name: string}[]>([]);
    const [branches, setBranches] = useState<{id: number, name: string}[]>([]);
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '',
        phone_number: '', status: 'ACTIVE', user_type: 'STAFF',
        branch_id: '',
    });

    const isAdmin = currentUser?.roles?.includes('ADMIN') || currentUser?.user_type === 'ADMIN';

    useEffect(() => {
        if (!isAdmin) { router.push('/users'); return; }
        const fetchData = async () => {
            try {
                const [userRes, rolesRes, branchRes] = await Promise.all([
                    api.get(`/users/${params.id}`),
                    api.get('/roles'),
                    api.get('/branches'),
                ]);
                const u = userRes.data.data;
                setForm({
                    first_name: u.info?.first_name || '',
                    last_name: u.info?.last_name || '',
                    email: u.info?.email || '',
                    phone_number: u.info?.phone_number || '',
                    status: u.status,
                    user_type: u.user_type,
                    branch_id: u.branch_id ? String(u.branch_id) : '',
                });

                // Backend wraps every response as { data: <payload> } via ResponseInterceptor.
                // /roles payload may be a plain array OR { items, total, page, limit }.
                const rolePayload = rolesRes.data?.data;
                setRoles(Array.isArray(rolePayload) ? rolePayload : (rolePayload?.items || []));

                // /branches payload is paginated: { items, total, page, limit } — not a plain array.
                const branchPayload = branchRes.data?.data;
                setBranches(Array.isArray(branchPayload) ? branchPayload : (branchPayload?.items || []));
            } catch {
                toast.error('Failed to load user');
                router.push('/users');
            } finally { setFetching(false); }
        };
        fetchData();
    }, [params.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/users/${params.id}`, {
                status: form.status,
                user_type: form.user_type,
                branch_id: form.branch_id ? Number(form.branch_id) : null,
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                phone_number: form.phone_number,
            });
            toast.success('User updated!');
            router.push('/users');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '0.625rem 0.875rem',
        border: '1px solid #e2e8f0', borderRadius: '0.5rem',
        fontSize: '0.875rem', color: '#0f172a', background: 'white',
        outline: 'none', boxSizing: 'border-box' as const,
    };

    const labelStyle = {
        display: 'block', fontSize: '0.8rem',
        fontWeight: 500, color: '#374151', marginBottom: '0.375rem',
    };

    if (fetching) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
    );

    return (
        <div style={{ maxWidth: '640px' }}>
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
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Edit User</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Update user details</p>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>First Name</label>
                            <input name="first_name" value={form.first_name} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name</label>
                            <input name="last_name" value={form.last_name} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone</label>
                        <input name="phone_number" value={form.phone_number} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>User Type</label>
                            <select name="user_type" value={form.user_type} onChange={handleChange} style={inputStyle}>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Branch</label>
                        <select name="branch_id" value={form.branch_id} onChange={handleChange} style={inputStyle}>
                            <option value="">All Branches</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                        <button type="button" onClick={() => router.push('/users')} style={{
                            flex: 1, padding: '0.625rem', background: 'white',
                            border: '1px solid #e2e8f0', borderRadius: '0.5rem',
                            cursor: 'pointer', fontSize: '0.875rem', color: '#64748b',
                        }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{
                            flex: 1, padding: '0.625rem',
                            background: loading ? '#93c5fd' : '#2563eb',
                            border: 'none', borderRadius: '0.5rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem', color: 'white', fontWeight: 500,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}>
                            {loading ? <><Loader2 size={14} />Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
