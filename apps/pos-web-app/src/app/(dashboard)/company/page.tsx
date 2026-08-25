'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Building2, GitBranch, Phone, Mail, MapPin, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
    id: number;
    name: string;
    code: string;
    city?: string;
    manager_name?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
}

interface Company {
    id: number;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
    branches: Branch[];
}

export default function CompanyPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddBranch, setShowAddBranch] = useState(false);
    const [showEditCompany, setShowEditCompany] = useState(false);
    const [branchForm, setBranchForm] = useState({
        name: '', code: '', city: '', manager_name: '', phone: '', email: '',
    });
    const [companyForm, setCompanyForm] = useState({
        name: '', email: '', phone: '', address: '',
    });
    const [saving, setSaving] = useState(false);

    const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await api.get('/companies');
            const companies = res.data.data || [];
            if (companies.length > 0) {
                const detail = await api.get(`/companies/${companies[0].id}`);
                const c = detail.data.data;
                setCompany(c);
                setCompanyForm({
                    name: c.name, email: c.email || '',
                    phone: c.phone || '', address: c.address || '',
                });
            }
        } catch (err) {
            toast.error('Failed to load company');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;
        setSaving(true);
        try {
            await api.post('/branches', {
                ...branchForm,
                company_id: company.id,
            });
            toast.success('Branch added successfully!');
            setShowAddBranch(false);
            setBranchForm({ name: '', code: '', city: '', manager_name: '', phone: '', email: '' });
            fetchCompany();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add branch');
        } finally {
            setSaving(false);
        }
    };

    const handleEditCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;
        setSaving(true);
        try {
            await api.put(`/companies/${company.id}`, companyForm);
            toast.success('Company updated!');
            setShowEditCompany(false);
            fetchCompany();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.625rem 0.875rem',
        border: '1px solid #e2e8f0', borderRadius: '0.5rem',
        fontSize: '0.875rem', outline: 'none',
        boxSizing: 'border-box' as const, background: 'white',
    };

    const labelStyle = {
        display: 'block', fontSize: '0.8rem',
        fontWeight: 500 as const, color: '#374151', marginBottom: '0.375rem',
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' as const, color: '#64748b' }}>Loading...</div>;
    if (!company) return <div style={{ padding: '3rem', textAlign: 'center' as const, color: '#64748b' }}>No company found.</div>;

    return (
        <div>
            {/* Company Card */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', background: '#eff6ff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={24} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{company.name}</h2>
                        <span style={{ padding: '0.2rem 0.625rem', background: '#eff6ff', color: '#2563eb', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>
              {company.code}
            </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ padding: '0.3rem 0.75rem', background: company.is_active ? '#f0fdf4' : '#fef2f2', color: company.is_active ? '#16a34a' : '#dc2626', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
              {company.is_active ? 'Active' : 'Inactive'}
            </span>
                        {isAdmin && (
                            <button onClick={() => setShowEditCompany(!showEditCompany)} style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 0.875rem', background: '#eff6ff', color: '#2563eb',
                                border: '1px solid #bfdbfe', borderRadius: '0.5rem',
                                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
                            }}>
                                <Edit size={14} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit Company Form */}
                {showEditCompany && isAdmin && (
                    <form onSubmit={handleEditCompany} style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>Edit Company</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>Company Name</label>
                                <input value={companyForm.name} onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" value={companyForm.email} onChange={e => setCompanyForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input value={companyForm.phone} onChange={e => setCompanyForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Address</label>
                                <input value={companyForm.address} onChange={e => setCompanyForm(p => ({ ...p, address: e.target.value }))} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <button type="button" onClick={() => setShowEditCompany(false)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {company.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <Mail size={14} color="#94a3b8" />{company.email}
                        </div>
                    )}
                    {company.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <Phone size={14} color="#94a3b8" />{company.phone}
                        </div>
                    )}
                    {company.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <MapPin size={14} color="#94a3b8" />{company.address}
                        </div>
                    )}
                </div>
            </div>

            {/* Branches Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GitBranch size={18} color="#2563eb" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        Branches ({company.branches?.length || 0})
                    </h3>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowAddBranch(!showAddBranch)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: '#2563eb', color: 'white',
                        border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                        fontSize: '0.875rem', fontWeight: 500,
                    }}>
                        <Plus size={14} /> Add Branch
                    </button>
                )}
            </div>

            {/* Add Branch Form */}
            {showAddBranch && isAdmin && (
                <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#0f172a' }}>Add New Branch</h4>
                    <form onSubmit={handleAddBranch}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>Branch Name *</label>
                                <input required value={branchForm.name} onChange={e => setBranchForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Colombo Branch" />
                            </div>
                            <div>
                                <label style={labelStyle}>Code *</label>
                                <input required value={branchForm.code} onChange={e => setBranchForm(p => ({ ...p, code: e.target.value }))} style={inputStyle} placeholder="COL" />
                            </div>
                            <div>
                                <label style={labelStyle}>City</label>
                                <input value={branchForm.city} onChange={e => setBranchForm(p => ({ ...p, city: e.target.value }))} style={inputStyle} placeholder="Colombo" />
                            </div>
                            <div>
                                <label style={labelStyle}>Manager Name</label>
                                <input value={branchForm.manager_name} onChange={e => setBranchForm(p => ({ ...p, manager_name: e.target.value }))} style={inputStyle} placeholder="John Silva" />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input value={branchForm.phone} onChange={e => setBranchForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} placeholder="+94771234567" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" value={branchForm.email} onChange={e => setBranchForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="branch@ryzera.com" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setShowAddBranch(false)} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                                {saving ? 'Adding...' : 'Add Branch'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Branches Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {company.branches?.map(branch => (
                    <div key={branch.id} style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{branch.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{branch.code}</div>
                            </div>
                            <span style={{ padding: '0.2rem 0.5rem', background: branch.is_active ? '#f0fdf4' : '#fef2f2', color: branch.is_active ? '#16a34a' : '#dc2626', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 500 }}>
                {branch.is_active ? 'Active' : 'Inactive'}
              </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {branch.city && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}><MapPin size={12} color="#94a3b8" />{branch.city}</div>}
                            {branch.manager_name && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}><Building2 size={12} color="#94a3b8" />{branch.manager_name}</div>}
                            {branch.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}><Phone size={12} color="#94a3b8" />{branch.phone}</div>}
                            {branch.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}><Mail size={12} color="#94a3b8" />{branch.email}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}