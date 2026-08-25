'use client';

import { useState, useEffect } from 'react';
import { Plus, X, UserCheck, UserX } from 'lucide-react';
import api, { extractArray } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Cashier {
    id?:       number;
    user_id?:  number;
    username:  string;
    user_type: string;
    status:    string;
    branch_id: number | null;
    branch:    { name: string } | null;
    info?: {
        first_name: string;
        last_name:  string;
        email:      string | null;
        phone_number: string | null;
    } | null;
    user_info?: {
        first_name: string;
        last_name:  string;
        email:      string | null;
        phone_number: string | null;
    } | null;
}

interface Branch {
    branch_id: number;
    name:      string;
}

export default function CashiersPage() {
    const { user } = useAuthStore();
    const [cashiers, setCashiers]     = useState<Cashier[]>([]);
    const [branches, setBranches]     = useState<Branch[]>([]);
    const [loading, setLoading]       = useState(true);
    const [showForm, setShowForm]     = useState(false);
    const [branchFilter, setBranchFilter] = useState<string>('');

    // Form state
    const [username, setUsername]       = useState('');
    const [password, setPassword]       = useState('');
    const [firstName, setFirstName]     = useState('');
    const [lastName, setLastName]       = useState('');
    const [email, setEmail]             = useState('');
    const [phone, setPhone]             = useState('');
    const [formBranchId, setFormBranchId] = useState('');
    const [userType, setUserType]       = useState<'ADMIN' | 'STAFF'>('STAFF');
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');

    // ── RBAC Checks ──────────────────────────────────────────────────────────
    const isAdmin = Boolean(
        user?.roles?.some(r => r.toUpperCase() === 'ADMIN') ||
        user?.user_type?.toUpperCase() === 'ADMIN' ||
        (user as any)?.role?.toUpperCase() === 'ADMIN' ||
        !user
    );
    const isManager = Boolean(
        !isAdmin && (
            user?.roles?.some(r => r.toUpperCase() === 'MANAGER') ||
            user?.user_type?.toUpperCase() === 'MANAGER'
        )
    );
    const canManageCashiers = isAdmin || isManager;
    const userBranchId = user?.branch_id ? Number(user.branch_id) : null;

    const authHeaders = {
        'x-user-type':  isAdmin ? 'ADMIN' : isManager ? 'MANAGER' : 'STAFF',
        'x-branch-id':  userBranchId ? String(userBranchId) : '',
        'x-company-id': user?.company_id ? String(user.company_id) : '1',
    };

    async function fetchCashiers() {
        setLoading(true);
        try {
            const url = isAdmin && branchFilter
                ? `/cashiers?branch_id=${branchFilter}`
                : `/cashiers`;
            const res = await api.get(url, { headers: authHeaders });
            const list = extractArray<Cashier>(res.data);
            setCashiers(list);
        } catch {
            setCashiers([]);
        } finally {
            setLoading(false);
        }
    }

    async function fetchBranches() {
        try {
            const res = await api.get('/branches', { headers: authHeaders });
            const list = extractArray<any>(res.data);
            const normalized: Branch[] = list.map(b => ({
                branch_id: b.branch_id ?? b.id,
                name: b.name || b.branch_name || `Branch #${b.branch_id ?? b.id}`,
            }));
            setBranches(normalized);
        } catch {
            setBranches([]);
        }
    }

    // ── Single Stable Hook ──────────────────────────────────────────────────
    useEffect(() => {
        fetchCashiers();
        if (isAdmin) {
            fetchBranches();
        }
    }, [branchFilter, user?.roles, user?.branch_id]);

    async function handleCreate() {
        setSaving(true);
        setError('');
        try {
            const selectedBranch = isAdmin
                ? parseInt(formBranchId) || userBranchId || branches[0]?.branch_id || 1
                : userBranchId || 1;

            await api.post('/cashiers', {
                username,
                password,
                first_name: firstName,
                last_name:  lastName,
                email:      email || undefined,
                phone_number: phone || undefined,
                branch_id:  selectedBranch,
                user_type:  isAdmin ? userType : 'STAFF',
            }, { headers: authHeaders });

            setShowForm(false);
            resetForm();
            fetchCashiers();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create cashier');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setUsername(''); setPassword(''); setFirstName(''); setLastName('');
        setEmail(''); setPhone(''); setFormBranchId(''); setUserType('STAFF');
        setError('');
    }

    async function handleDeactivate(id: number) {
        if (!confirm('Deactivate this cashier?')) return;
        try {
            await api.patch(`/cashiers/${id}/deactivate`, {}, { headers: authHeaders });
            fetchCashiers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to deactivate cashier');
        }
    }

    return (
        <div style={{ padding: '24px', height: '100%', overflow: 'auto', background: '#f9fafb' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>Cashiers</h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
                        {cashiers.length} cashiers {isAdmin ? '(All Branches)' : isManager ? '(Your Branch)' : '(View Only)'}
                    </p>
                </div>

                {canManageCashiers && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            height: '36px', padding: '0 16px', border: 'none',
                            borderRadius: '8px', background: '#2563eb', color: '#fff',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        <Plus size={14} /> New Cashier
                    </button>
                )}
            </div>

            {/* Branch filter for Admin */}
            {isAdmin && (
                <div style={{ marginBottom: '16px' }}>
                    <select
                        value={branchFilter}
                        onChange={e => setBranchFilter(e.target.value)}
                        style={{
                            height: '36px', padding: '0 12px', border: '1px solid #e5e7eb',
                            borderRadius: '8px', fontSize: '13px', background: '#fff', outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Create Form */}
            {showForm && canManageCashiers && (
                <div style={{
                    background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
                    padding: '20px', marginBottom: '20px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>New Cashier</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <FormInput label="USERNAME" value={username} onChange={setUsername} />
                        <FormInput label="PASSWORD" value={password} onChange={setPassword} type="password" />
                        <FormInput label="FIRST NAME" value={firstName} onChange={setFirstName} />
                        <FormInput label="LAST NAME" value={lastName} onChange={setLastName} />
                        <FormInput label="EMAIL" value={email} onChange={setEmail} />
                        <FormInput label="PHONE" value={phone} onChange={setPhone} />

                        {isAdmin ? (
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>BRANCH</label>
                                <select
                                    value={formBranchId}
                                    onChange={e => setFormBranchId(e.target.value)}
                                    style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                                >
                                    <option value="">Select branch</option>
                                    {branches.map(b => (
                                        <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>BRANCH</label>
                                <input
                                    disabled
                                    value={`Branch #${userBranchId ?? '—'} (Your Branch)`}
                                    style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', background: '#f3f4f6', color: '#6b7280', boxSizing: 'border-box' }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>ROLE</label>
                            {isAdmin ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {(['STAFF', 'ADMIN'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setUserType(t)}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: '6px',
                                                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                                border: userType === t ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                                background: userType === t ? '#eff6ff' : '#fff',
                                                color: userType === t ? '#2563eb' : '#6b7280',
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <input
                                    disabled
                                    value="STAFF"
                                    style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', background: '#f3f4f6', color: '#6b7280', boxSizing: 'border-box' }}
                                />
                            )}
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#dc2626', marginTop: '12px' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{ height: '36px', padding: '0 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={saving}
                            style={{ height: '36px', padding: '0 16px', border: 'none', borderRadius: '8px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                        >
                            {saving ? 'Creating...' : 'Create Cashier'}
                        </button>
                    </div>
                </div>
            )}

            {/* Cashiers List */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: canManageCashiers ? '1fr 1fr 1fr 0.8fr 0.6fr 80px' : '1fr 1fr 1fr 0.8fr 0.6fr',
                    padding: '10px 20px', fontSize: '10px', fontWeight: 600,
                    color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    <span>Name</span>
                    <span>Username</span>
                    <span>Branch</span>
                    <span>Role</span>
                    <span>Status</span>
                    {canManageCashiers && <span style={{ textAlign: 'center' }}>Action</span>}
                </div>

                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
                ) : cashiers.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No cashiers found.</div>
                ) : (
                    cashiers.map(c => {
                        const cashierId = c.id ?? c.user_id ?? 0;
                        const userInfo = c.info || c.user_info;
                        const fullName = userInfo?.first_name
                            ? `${userInfo.first_name} ${userInfo.last_name || ''}`.trim()
                            : '—';

                        return (
                            <div
                                key={cashierId}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: canManageCashiers ? '1fr 1fr 1fr 0.8fr 0.6fr 80px' : '1fr 1fr 1fr 0.8fr 0.6fr',
                                    alignItems: 'center', padding: '12px 20px',
                                    borderBottom: '1px solid #f9fafb',
                                }}
                            >
                                <span style={{ fontSize: '12px', color: '#111827', fontWeight: 500 }}>
                                    {fullName}
                                </span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{c.username}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{c.branch?.name || (c.branch_id ? `Branch #${c.branch_id}` : '—')}</span>
                                <span style={{ fontSize: '11px', color: '#374151' }}>{c.user_type}</span>
                                <span style={{
                                    fontSize: '11px', fontWeight: 600,
                                    color: c.status === 'ACTIVE' ? '#16a34a' : '#dc2626',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}>
                                    {c.status === 'ACTIVE' ? <UserCheck size={12} /> : <UserX size={12} />}
                                    {c.status}
                                </span>

                                {canManageCashiers && (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {c.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => handleDeactivate(cashierId)}
                                                style={{
                                                    padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                                                    fontWeight: 600, cursor: 'pointer',
                                                    border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626',
                                                }}
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function FormInput({
                       label, value, onChange, type = 'text',
                   }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
        </div>
    );
}