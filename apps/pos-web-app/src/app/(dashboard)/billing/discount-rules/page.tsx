'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '@/lib/api';

interface DiscountRule {
    id:          number;
    name:        string;
    scope:       string;
    type:        string;
    value:       string;
    max_value:   string | null;
    description: string | null;
    valid_from:  string;
    valid_until: string | null;
    status:      string;
    branch_id:   number | null;
}

export default function DiscountRulesPage() {
    const [rules, setRules]       = useState<DiscountRule[]>([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [ruleName, setRuleName]       = useState('');
    const [ruleValue, setRuleValue]     = useState('');
    const [scope, setScope]             = useState<'GLOBAL' | 'BRANCH'>('GLOBAL');
    const [maxPercent, setMaxPercent]   = useState('');
    const [description, setDescription] = useState('');
    const [validFrom, setValidFrom]     = useState('');
    const [validUntil, setValidUntil]   = useState('');
    const [branchId, setBranchId]       = useState('');
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');

    async function fetchRules() {
        setLoading(true);
        try {
            const res = await api.get('/discount-rules');
            const data = res.data;
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.rules)
                        ? data.rules
                        : [];
            setRules(list);
        } catch {
            try {
                const res = await fetch('http://localhost:3000/api/discount-rules');
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.data)
                            ? data.data
                            : Array.isArray(data?.rules)
                                ? data.rules
                                : [];
                    setRules(list);
                } else {
                    setRules([]);
                }
            } catch {
                setRules([]);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchRules(); }, []);

    function resetForm() {
        setRuleName('');
        setRuleValue('');
        setScope('GLOBAL');
        setMaxPercent('');
        setDescription('');
        setValidFrom('');
        setValidUntil('');
        setBranchId('');
        setError('');
    }

    async function handleCreate() {
        setSaving(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3000/api/discount-rules', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:          ruleName,
                    value:         parseFloat(ruleValue),
                    scope,
                    discount_type: 'PERCENTAGE',
                    max_percent:   parseFloat(maxPercent),
                    description,
                    valid_from:    new Date(validFrom).toISOString(),
                    valid_until:   new Date(validUntil).toISOString(),
                    branch_id:     scope === 'BRANCH' ? parseInt(branchId) : undefined,
                    created_by:    1,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(
                    Array.isArray(err.message)
                        ? err.message.map((m: any) => m.message).join(', ')
                        : err.message || 'Failed to create rule'
                );
            }
            setShowForm(false);
            resetForm();
            fetchRules();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(id: number) {
        if (!confirm('Deactivate this rule?')) return;
        try {
            await api.patch(`/discount-rules/${id}/deactivate`);
        } catch {
            await fetch(
                `http://localhost:3000/api/discount-rules/${id}/deactivate`,
                { method: 'PATCH' },
            );
        }
        fetchRules();
    }

    const safeRules = Array.isArray(rules) ? rules : [];

    return (
        <div style={{ padding: '24px', height: '100%', overflow: 'auto', background: '#f9fafb' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                        Discount Rules
                    </h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
                        {safeRules.length} rules configured
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        height: '36px', padding: '0 16px', border: 'none',
                        borderRadius: '8px', background: '#2563eb', color: '#fff',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    <Plus size={14} /> New Rule
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div style={{
                    background: '#fff', borderRadius: '12px',
                    border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '16px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                            Create Discount Rule
                        </h3>
                        <button
                            onClick={() => { setShowForm(false); resetForm(); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                        {/* Rule Name — full width */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                RULE NAME
                            </label>
                            <input
                                placeholder="e.g. New Year Sale Discount"
                                value={ruleName}
                                onChange={e => setRuleName(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Scope */}
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                SCOPE
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {(['GLOBAL', 'BRANCH'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setScope(s)}
                                        style={{
                                            flex: 1, padding: '8px', borderRadius: '6px',
                                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                            border: scope === s ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                            background: scope === s ? '#eff6ff' : '#fff',
                                            color: scope === s ? '#2563eb' : '#6b7280',
                                        }}
                                    >
                                        {s === 'GLOBAL' ? '🌐 Global' : '🏪 Branch'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Discount Value % */}
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                DISCOUNT VALUE %
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 10"
                                value={ruleValue}
                                onChange={e => setRuleValue(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Max Percent */}
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                MAX ALLOWED %
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 10"
                                value={maxPercent}
                                onChange={e => setMaxPercent(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Branch ID (BRANCH scope only) */}
                        {scope === 'BRANCH' && (
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                    BRANCH ID
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={branchId}
                                    onChange={e => setBranchId(e.target.value)}
                                    style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div style={{ gridColumn: scope === 'BRANCH' ? '2' : '1 / -1' }}>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                DESCRIPTION
                            </label>
                            <input
                                placeholder="e.g. New Year Sale"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Valid From */}
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                VALID FROM
                            </label>
                            <input
                                type="datetime-local"
                                value={validFrom}
                                onChange={e => setValidFrom(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Valid Until */}
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                                VALID UNTIL
                            </label>
                            <input
                                type="datetime-local"
                                value={validUntil}
                                onChange={e => setValidUntil(e.target.value)}
                                style={{ width: '100%', height: '36px', padding: '0 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '8px', padding: '10px 12px',
                            fontSize: '12px', color: '#dc2626', marginTop: '12px',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                        <button
                            onClick={() => { setShowForm(false); resetForm(); }}
                            style={{
                                height: '36px', padding: '0 16px',
                                border: '1px solid #e5e7eb', borderRadius: '8px',
                                background: '#fff', color: '#374151',
                                fontSize: '13px', cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={saving || !ruleName || !ruleValue || !maxPercent || !validFrom || !validUntil}
                            style={{
                                height: '36px', padding: '0 16px', border: 'none',
                                borderRadius: '8px',
                                background: saving ? '#93c5fd' : '#2563eb',
                                color: '#fff', fontSize: '13px', fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Creating...' : 'Create Rule'}
                        </button>
                    </div>
                </div>
            )}

            {/* Rules List */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.8fr 80px',
                    padding: '10px 20px', fontSize: '10px', fontWeight: 600,
                    color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    <span>Name</span>
                    <span>Scope</span>
                    <span>Description</span>
                    <span>Value %</span>
                    <span>Valid From</span>
                    <span>Valid Until</span>
                    <span style={{ textAlign: 'center' }}>Status</span>
                </div>

                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        Loading...
                    </div>
                ) : safeRules.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        No discount rules yet. Click "New Rule" to create one.
                    </div>
                ) : (
                    safeRules.map(rule => (
                        <div
                            key={rule.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 0.8fr 0.8fr 0.6fr 0.8fr 0.8fr 80px',
                                alignItems: 'center', padding: '12px 20px',
                                borderBottom: '1px solid #f9fafb',
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                                {rule.name}
                            </span>

                            <span style={{
                                display: 'inline-flex', padding: '2px 8px', borderRadius: '6px',
                                fontSize: '11px', fontWeight: 600, width: 'fit-content',
                                background: rule.scope === 'GLOBAL' ? '#eff6ff' : '#f0fdf4',
                                color: rule.scope === 'GLOBAL' ? '#1d4ed8' : '#15803d',
                            }}>
                                {rule.scope === 'GLOBAL' ? '🌐 Global' : '🏪 Branch'}
                            </span>

                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                {rule.description || '—'}
                            </span>

                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                                {Number(rule.value)}%
                            </span>

                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {new Date(rule.valid_from).toLocaleDateString()}
                            </span>

                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {rule.valid_until
                                    ? new Date(rule.valid_until).toLocaleDateString()
                                    : '—'}
                            </span>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {rule.status === 'ACTIVE' ? (
                                    <button
                                        onClick={() => handleDeactivate(rule.id)}
                                        style={{
                                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px',
                                            fontWeight: 600, cursor: 'pointer',
                                            border: '1px solid #fecaca',
                                            background: '#fef2f2', color: '#dc2626',
                                        }}
                                    >
                                        Deactivate
                                    </button>
                                ) : (
                                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}