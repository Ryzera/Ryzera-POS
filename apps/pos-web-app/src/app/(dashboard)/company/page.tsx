'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Building2, GitBranch, Phone, Mail, MapPin } from 'lucide-react';

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
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/companies')
            .then(res => {
                const companies = res.data.data || [];
                if (companies.length > 0) {
                    return api.get(`/companies/${companies[0].id}`);
                }
            })
            .then(res => {
                if (res) setCompany(res.data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading company info...
        </div>
    );

    if (!company) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No company found.
        </div>
    );

    return (
        <div>
            {/* Company Card */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '3.5rem', height: '3.5rem',
                        background: '#eff6ff',
                        borderRadius: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Building2 size={24} color="#2563eb" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                            {company.name}
                        </h2>
                        <span style={{
                            padding: '0.2rem 0.625rem',
                            background: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                        }}>
              {company.code}
            </span>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
            <span style={{
                padding: '0.3rem 0.75rem',
                background: company.is_active ? '#f0fdf4' : '#fef2f2',
                color: company.is_active ? '#16a34a' : '#dc2626',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
            }}>
              {company.is_active ? 'Active' : 'Inactive'}
            </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {company.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <Mail size={14} color="#94a3b8" />
                            {company.email}
                        </div>
                    )}
                    {company.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <Phone size={14} color="#94a3b8" />
                            {company.phone}
                        </div>
                    )}
                    {company.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <MapPin size={14} color="#94a3b8" />
                            {company.address}
                        </div>
                    )}
                </div>
            </div>

            {/* Branches */}
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitBranch size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Branches ({company.branches?.length || 0})
                </h3>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
            }}>
                {company.branches?.map(branch => (
                    <div key={branch.id} style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                                    {branch.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                    {branch.code}
                                </div>
                            </div>
                            <span style={{
                                padding: '0.2rem 0.5rem',
                                background: branch.is_active ? '#f0fdf4' : '#fef2f2',
                                color: branch.is_active ? '#16a34a' : '#dc2626',
                                borderRadius: '9999px',
                                fontSize: '0.65rem',
                                fontWeight: 500,
                            }}>
                {branch.is_active ? 'Active' : 'Inactive'}
              </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {branch.city && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                    <MapPin size={12} color="#94a3b8" />
                                    {branch.city}
                                </div>
                            )}
                            {branch.manager_name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Building2 size={12} color="#94a3b8" />
                                    {branch.manager_name}
                                </div>
                            )}
                            {branch.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Phone size={12} color="#94a3b8" />
                                    {branch.phone}
                                </div>
                            )}
                            {branch.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Mail size={12} color="#94a3b8" />
                                    {branch.email}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}