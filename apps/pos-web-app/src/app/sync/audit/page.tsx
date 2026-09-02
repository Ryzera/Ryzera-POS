'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, List, Database, Bell, Activity, Cpu, AlertCircle,
  RefreshCw, Search, Filter, History, User, Building, ExternalLink, Download,
  ChevronLeft, ChevronRight, Fingerprint, MapPin, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';

const API_BASE = 'http://localhost:3000/api';

export default function AuditPage() {
  const { user } = useAuthStore();
  const branchQuery = (user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN') ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  
  const { branches, getBranchName } = useBranches();
  const router = useRouter();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminBranchFilter, setAdminBranchFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || useAuthStore.getState().token;
      const res = await fetch(`${API_BASE}/sync/audit${branchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const responseJson = await res.json();
      const data = responseJson.data || responseJson;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleExport = async () => {
    const tid = toast.loading('Generating export...');
    try {
      const res = await fetch(`${API_BASE}/sync/export/json`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss(tid);
      toast.success('Export downloaded successfully');
    } catch (err) {
      toast.dismiss(tid);
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Activity Audit</h2>
            <p className="text-xs text-slate-500 mt-1">Traceable history of all sync operations and administrative actions</p>
          </div>
          <div className="flex items-center gap-3">

          <button onClick={fetchAuditLogs} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-sm transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        
          </div>
        </div>
        {/* Action Bar */}
        <div className="bg-white p-5 rounded-sm border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search audit logs..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <select
                value={adminBranchFilter}
                onChange={(e) => setAdminBranchFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-sm text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            )}
            <div className="h-8 w-[1.5px] bg-slate-100" />
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-sm text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-sm text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Operation</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Location</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Result</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.filter(log => {
                  const matchesSearch = !searchQuery || JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase());
                  const bid = log.branch_id || log.branchId;
                  const matchesBranch = adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
                  
                  let matchesDate = true;
                  if (startDate || endDate) {
                    const logDate = new Date(log.created_at || log.createdAt);
                    logDate.setHours(0, 0, 0, 0);
                    if (startDate) {
                      const sDate = new Date(startDate);
                      sDate.setHours(0, 0, 0, 0);
                      if (logDate < sDate) matchesDate = false;
                    }
                    if (endDate) {
                      const eDate = new Date(endDate);
                      eDate.setHours(0, 0, 0, 0);
                      if (logDate > eDate) matchesDate = false;
                    }
                  }
                  
                  return matchesSearch && matchesBranch && matchesDate;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                       <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                       <p className="text-sm font-medium">No activity recorded in the audit chain</p>
                    </td>
                  </tr>
                ) : logs.filter(log => {
                  const matchesSearch = !searchQuery || JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase());
                  const bid = log.branch_id || log.branchId;
                  const matchesBranch = adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;

                  let matchesDate = true;
                  if (startDate || endDate) {
                    const logDate = new Date(log.created_at || log.createdAt);
                    logDate.setHours(0, 0, 0, 0);
                    if (startDate) {
                      const sDate = new Date(startDate);
                      sDate.setHours(0, 0, 0, 0);
                      if (logDate < sDate) matchesDate = false;
                    }
                    if (endDate) {
                      const eDate = new Date(endDate);
                      eDate.setHours(0, 0, 0, 0);
                      if (logDate > eDate) matchesDate = false;
                    }
                  }
                  
                  return matchesSearch && matchesBranch && matchesDate;
                }).map((log) => {
                  const handleRowClick = () => {
                    const mod = (log.module || log.entity || '').toLowerCase();
                    if (mod.includes('device')) router.push('/sync/devices');
                    else if (mod.includes('recovery') || mod.includes('backup')) router.push('/sync/backup');
                    else if (mod.includes('conflict') || mod.includes('sync engine')) router.push('/sync/queue');
                    else if (mod.includes('protocol') || mod.includes('automation')) router.push('/sync/settings');
                    else router.push('/sync/dashboard');
                  };

                  return (
                  <tr key={log.id} onClick={handleRowClick} className="hover:bg-slate-50/50 transition group cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition">
                           <History className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition cursor-pointer">{log.action}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{log.module || log.entity || 'System Protocol'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                           {log.user_name ? log.user_name.slice(0,1) : ((log.user_id || log.userId) ? (String(log.user_id || log.userId) === '1' ? 'A' : 'U') : '⚙️')}
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {log.user_name ? (log.user_name === 'System Admin' ? 'Sync Engine (Automated)' : log.user_name) : ((log.user_id || log.userId) ? (String(log.user_id || log.userId) === '1' ? 'admin (Super Admin)' : `User ${(log.user_id || log.userId)}`) : 'Sync Engine (Automated)')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                     <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-300" />
                          {getBranchName(log.branch_id || log.branchId)}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-100/50">
                          Verified
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-xs font-bold text-slate-900">{new Date(log.created_at || log.createdAt).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{new Date(log.created_at || log.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Chain: {logs.length} Records</p>
            <div className="flex gap-2">
              <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-400"><ChevronLeft className="h-4 w-4" /></button>
              <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-400"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
  );
}
