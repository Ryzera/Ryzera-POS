'use client';

import { useState, useEffect } from 'react';
import { 
  Gavel, ShieldCheck, Zap, Info, 
  Save, X, Clock, Server, Database, Activity, GitCommit, GitMerge
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConflictPolicy {
  id: string;
  entity: string;
  strategy: string;
  active: boolean;
  icon: any;
}

export default function RulesPage() {
  const [mounted, setMounted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    setMounted(true);
    const loadPolicies = async () => {
      try {
        const token = typeof window !== 'undefined'
          ? (localStorage.getItem('access_token') || localStorage.getItem('token'))
          : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/sync/settings`, { headers });
        if (!res.ok) throw new Error(`Settings request failed (${res.status})`);
        const response = await res.json();
        const data = Array.isArray(response) ? response : (response.data || []);
        if (Array.isArray(data)) {
          const cpSetting = data.find((s: any) => s.key === 'conflictPolicies');
          if (cpSetting) {
            try {
              const parsed = JSON.parse(cpSetting.value);
              if (Array.isArray(parsed)) {
                setConflictPolicies(parsed.map(p => ({
                  ...p,
                  icon: p.entity === 'INVENTORY' ? GitMerge : (p.entity === 'PRICING' || p.entity === 'TAX_CONFIG' ? Server : Clock)
                })));
              }
            } catch (e) {}
          }
          const npSetting = data.find((s: any) => s.key === 'networkPolicy');
          if (npSetting) {
            try { setNetworkPolicy(JSON.parse(npSetting.value)); } catch (e) {}
          }
          const rpSetting = data.find((s: any) => s.key === 'retentionPolicy');
          if (rpSetting) {
            try { setRetentionPolicy(JSON.parse(rpSetting.value)); } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to load rules from server', err);
      }
    };
    loadPolicies();
  }, []);

  // Initial State Data
  const [conflictPolicies, setConflictPolicies] = useState<ConflictPolicy[]>([
    { id: '1', entity: 'INVENTORY', strategy: 'ADDITIVE_MERGE', active: true, icon: GitMerge },
    { id: '2', entity: 'PRICING', strategy: 'SERVER_WINS', active: true, icon: Server },
    { id: '3', entity: 'CUSTOMER_DATA', strategy: 'TIMESTAMP_WINS', active: true, icon: Clock },
    { id: '4', entity: 'TAX_CONFIG', strategy: 'SERVER_WINS', active: true, icon: ShieldCheck },
    { id: '5', entity: 'EMPLOYEE_LOGS', strategy: 'BRANCH_WINS', active: false, icon: GitCommit },
  ]);

  const [networkPolicy, setNetworkPolicy] = useState({
    syncMode: 'REALTIME', // REALTIME or BATCH
    throttlePeak: true,
    batchInterval: '15',
  });

  const [retentionPolicy, setRetentionPolicy] = useState({
    logRetentionDays: '7',
    autoPurgeSuccess: true,
  });

  const handleConflictChange = (id: string, field: keyof ConflictPolicy, value: any) => {
    setConflictPolicies(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setIsDirty(true);
  };

  const handleNetworkChange = (field: string, value: any) => {
    setNetworkPolicy(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleRetentionChange = (field: string, value: any) => {
    setRetentionPolicy(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading('Saving policy configurations to database...');
    try {
      const token = typeof window !== 'undefined'
          ? (localStorage.getItem('access_token') || localStorage.getItem('token'))
          : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = [
        {
          key: 'conflictPolicies',
          value: JSON.stringify(conflictPolicies.map(({ icon, ...rest }) => rest)),
        },
        {
          key: 'networkPolicy',
          value: JSON.stringify(networkPolicy),
        },
        {
          key: 'retentionPolicy',
          value: JSON.stringify(retentionPolicy),
        },
      ];

      const res = await fetch(`${API_BASE}/sync/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Policy save failed (${res.status})`);

      setIsSaving(false);
      setIsDirty(false);
      toast.dismiss(tid);
      toast.success('Policies persisted to database successfully');
    } catch (err) {
      setIsSaving(false);
      toast.dismiss(tid);
      toast.error('Failed to save policies');
    }
  };

  const handleDiscard = () => {
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-24" suppressHydrationWarning>
      {/* Sticky Header for Unsaved Changes */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isDirty ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'}`}>
        <div className="bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Unsaved changes detected</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDiscard} className="px-4 py-2 hover:bg-slate-800 rounded-full text-xs font-bold transition text-slate-300">
              Discard
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-xs font-bold transition shadow-lg shadow-blue-500/20">
              {isSaving ? <Activity className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Policies'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sync Policies</h2>
          <p className="text-sm text-slate-500 mt-1">Configure automated conflict resolution and system behavior</p>
        </div>
      </div>

      {/* ── Section 1: Conflict Resolution ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Gavel className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Conflict Resolution Engine</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Define how the system resolves collisions when records are edited simultaneously.</p>
        
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {conflictPolicies.map((rule) => (
            <div key={rule.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition group">
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${rule.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                   <rule.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{rule.entity}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                    {rule.entity === 'INVENTORY' && 'Handle simultaneous stock adjustments across branches.'}
                    {rule.entity === 'PRICING' && 'Handle product price changes made offline.'}
                    {rule.entity === 'CUSTOMER_DATA' && 'Handle profile updates for loyalty members.'}
                    {rule.entity === 'TAX_CONFIG' && 'Handle modifications to tax rate policies.'}
                    {rule.entity === 'EMPLOYEE_LOGS' && 'Handle shift and attendance record updates.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex flex-col items-start sm:items-end">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Strategy</label>
                  <select 
                    value={rule.strategy}
                    disabled={!rule.active}
                    onChange={(e) => handleConflictChange(rule.id, 'strategy', e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <option value="SERVER_WINS">HQ Server Wins</option>
                    <option value="BRANCH_WINS">Branch Wins</option>
                    <option value="ADDITIVE_MERGE">Additive Merge (+)</option>
                    <option value="TIMESTAMP_WINS">Most Recent Wins</option>
                    <option value="MANUAL_REVIEW">Flag for Manual Review</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12 text-right">{rule.active ? 'ON' : 'OFF'}</span>
                  <button 
                    onClick={() => handleConflictChange(rule.id, 'active', !rule.active)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${rule.active ? 'bg-blue-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${rule.active ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Network & Bandwidth ── */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Network & Bandwidth</h3>
        </div>
        
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Synchronization Mode</h4>
            <p className="text-xs text-slate-400 mb-4">Choose how data flows between branches.</p>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${networkPolicy.syncMode === 'REALTIME' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                <div>
                  <p className="text-sm font-bold text-slate-900">Real-time WebSocket</p>
                  <p className="text-xs text-slate-500 mt-0.5">Instant updates, higher network load</p>
                </div>
                <input type="radio" name="syncMode" value="REALTIME" checked={networkPolicy.syncMode === 'REALTIME'} onChange={(e) => handleNetworkChange('syncMode', e.target.value)} className="w-4 h-4 text-blue-600" />
              </label>
              
              <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${networkPolicy.syncMode === 'BATCH' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                <div>
                  <p className="text-sm font-bold text-slate-900">Batch Interval</p>
                  <p className="text-xs text-slate-500 mt-0.5">Consolidated periodic updates</p>
                </div>
                <div className="flex items-center gap-3">
                  {networkPolicy.syncMode === 'BATCH' && (
                    <select 
                      value={networkPolicy.batchInterval} 
                      onChange={(e) => handleNetworkChange('batchInterval', e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                    >
                      <option value="5">5 mins</option>
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="60">1 hour</option>
                    </select>
                  )}
                  <input type="radio" name="syncMode" value="BATCH" checked={networkPolicy.syncMode === 'BATCH'} onChange={(e) => handleNetworkChange('syncMode', e.target.value)} className="w-4 h-4 text-blue-600" />
                </div>
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Traffic Shaping</h4>
            <p className="text-xs text-slate-400 mb-4">Optimize POS performance during peak hours.</p>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-800">Peak Hour Throttling</span>
                </div>
                <button 
                  onClick={() => handleNetworkChange('throttlePeak', !networkPolicy.throttlePeak)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${networkPolicy.throttlePeak ? 'bg-blue-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-200 ${networkPolicy.throttlePeak ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">Automatically switch to Batch Mode (15 min intervals) and compress payloads between 10:00 AM - 2:00 PM and 5:00 PM - 8:00 PM.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Database Cleanup Rules ── */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800">Database Cleanup Rules</h3>
        </div>
        
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h4 className="text-sm font-bold text-slate-900">Sync Log Retention</h4>
             <p className="text-xs text-slate-400 mt-1 max-w-md">How long should the HQ database retain detailed synchronization logs and telemetry payloads?</p>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Auto-Purge Success:</span>
                <button 
                  onClick={() => handleRetentionChange('autoPurgeSuccess', !retentionPolicy.autoPurgeSuccess)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${retentionPolicy.autoPurgeSuccess ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-200 ${retentionPolicy.autoPurgeSuccess ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="h-8 w-px bg-slate-100 hidden md:block"></div>

              <select 
                value={retentionPolicy.logRetentionDays}
                onChange={(e) => handleRetentionChange('logRetentionDays', e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
           </div>
        </div>
      </div>

    </div>
  );
}
