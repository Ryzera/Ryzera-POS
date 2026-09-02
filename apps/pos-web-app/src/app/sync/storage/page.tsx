'use client';

import { useState, useEffect } from 'react';
import { 
  Database, HardDrive, ShieldCheck, AlertTriangle, 
  Trash2, RefreshCw, Layers, CheckCircle2,
  Settings2, Download, TerminalSquare, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';

const API_BASE = 'http://localhost:3000/api';

export default function StorageManagerPage() {
  const { user } = useAuthStore();
  const { branches, getBranchName } = useBranches();
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';

  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('ALL');

  useEffect(() => {
    // If not admin, lock branch filter to user's branch
    if (!isAdmin && user?.branch_id) {
      setBranchFilter(String(user.branch_id));
    }
  }, [isAdmin, user]);

  // Storage metrics must be supplied by the backend/device heartbeat.
  // Do not generate storage sizes, fragmentation, or record counts in the UI.
  const injectMockStorageData = (d: any) => d;

  const fetchDevices = async () => {
    setLoading(true);
    try {
      // Fetch devices to see their remote storage stats
      const token = localStorage.getItem('access_token') || useAuthStore.getState().token;
      const res = await fetch(`${API_BASE}/sync/devices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const responseJson = await res.json();
      const data = responseJson.data || responseJson;
      setDevices(Array.isArray(data) ? data.map(injectMockStorageData) : []);
    } catch (err) {
      toast.error('Failed to load device storage metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRemoteVacuum = (deviceName: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    toast.promise(
      fetch(`${API_BASE}/sync/storage/vacuum`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ deviceName }),
      }),
      {
        loading: `Sending VACUUM command to ${deviceName}...`,
        success: `${deviceName} database optimized successfully!`,
        error: 'Failed to optimize',
      }
    );
  };

  const handleGlobalPurge = () => {
    if (window.confirm(`Are you sure you want to trigger a global purge for branch ${branchFilter === 'ALL' ? 'ALL BRANCHES' : getBranchName(branchFilter)}? This will delete all synced records older than 30 days on the remote terminals.`)) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      toast.promise(
        fetch(`${API_BASE}/sync/storage/purge`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ branchId: branchFilter === 'ALL' ? undefined : parseInt(branchFilter, 10) }),
        }),
        {
          loading: 'Dispatching global purge command...',
          success: 'Global purge completed. Storage reclaimed.',
          error: 'Purge failed',
        }
      );
    }
  };

  const filteredDevices = devices.filter(d => {
    const bid = d.branch_id || d.branchId;
    if (branchFilter === 'ALL') return true;
    return String(bid) === branchFilter;
  });

  const totalStorageMB = filteredDevices.reduce((acc, d) => acc + d.dbSizeMB, 0);
  const avgFragmentation = filteredDevices.length > 0 
    ? (filteredDevices.reduce((acc, d) => acc + d.fragmentation, 0) / filteredDevices.length).toFixed(1) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Remote Storage Manager</h2>
            <p className="text-xs text-slate-500 mt-1">Monitor and optimize SQLite databases on remote POS terminals</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <select 
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition shadow-sm"
              >
                <option value="ALL">All Branches Fleet</option>
                {branches.map(b => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            )}

            <button onClick={fetchDevices} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl transition shadow-sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 p-8 rounded-xl shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Fleet Storage Used</p>
                 <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-white leading-none">{(totalStorageMB / 1024).toFixed(2)}</p>
                    <span className="text-xl font-bold text-slate-400 mb-1">GB</span>
                 </div>
              </div>
              <HardDrive className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
           </div>

           <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Average Fragmentation</p>
              <div className="flex items-end gap-2">
                 <p className="text-4xl font-black text-slate-900 leading-none">{avgFragmentation}</p>
                 <span className="text-xl font-bold text-slate-400 mb-1">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium">Over 20% requires a vacuum operation.</p>
           </div>

           <div className="bg-blue-600 p-8 rounded-xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Automated Cleanup</h3>
                <p className="text-xs font-medium opacity-90 leading-relaxed">
                  Purge offline data older than 30 days across {branchFilter === 'ALL' ? 'all branches' : 'this branch'} to instantly reclaim space.
                </p>
              </div>
              <button onClick={handleGlobalPurge} className="mt-4 w-full py-3 bg-white text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition shadow-sm flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" /> Trigger Global Purge
              </button>
           </div>
        </div>

        {/* Terminals Storage List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Terminal Storage Health</h3>
                <TerminalSquare className="h-5 w-5 text-slate-300" />
            </div>
            
            <div className="divide-y divide-slate-50">
                {filteredDevices.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">No terminals found for this branch.</div>
                ) : (
                  filteredDevices.map(device => (
                    <div key={device.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition">
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-slate-900">{device.name || 'Unnamed Terminal'}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              device.status === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                              device.status === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {device.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                            ID: {device.id} • Branch: {getBranchName(device.branch_id || device.branchId)}
                          </p>
                        </div>

                        <div className="flex-1 w-full max-w-xs space-y-3">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Database Size</span>
                            <span className="text-slate-900">{device.dbSizeMB} MB</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${device.dbSizeMB > 1000 ? 'bg-red-500' : device.dbSizeMB > 500 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                              style={{ width: `${Math.min(100, (device.dbSizeMB / 1500) * 100)}%` }} 
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Frag: {device.fragmentation}%</span>
                            <span>{device.oldRecords.toLocaleString()} old records</span>
                          </div>
                        </div>

                        <div className="flex shrink-0">
                          <button 
                            onClick={() => handleRemoteVacuum(device.name || 'Terminal')}
                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm flex items-center gap-2"
                          >
                            <Settings2 className="h-4 w-4" /> Remote Vacuum
                          </button>
                        </div>

                    </div>
                  ))
                )}
            </div>
        </div>

      </div>
  );
}
