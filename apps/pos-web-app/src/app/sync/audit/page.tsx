'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, List, Database, Bell, Activity, Cpu, AlertCircle,
  RefreshCw, Search, Filter, History, User, Building, ExternalLink, Download,
  ChevronLeft, ChevronRight, Fingerprint, MapPin, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/audit`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Audit</h1>
          <p className="text-sm text-slate-500 mt-1">Traceable history of all sync operations and administrative actions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAuditLogs} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
             <Download className="h-4 w-4" /> Export Ledger
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-hidden flex flex-col space-y-6">
        {/* Action Bar */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search audit logs..." className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
            </div>
            <div className="h-8 w-[1.5px] bg-slate-100" />
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">
              <Filter className="h-3.5 w-3.5" /> Date Range
            </button>
          </div>
          <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100/50">
             <Fingerprint className="h-4 w-4 text-emerald-600" />
             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Immutable Chain Active</span>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                       <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                       <p className="text-sm font-medium">No activity recorded in the audit chain</p>
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition">
                           <History className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition cursor-pointer">{log.action}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{log.entity || 'System Protocol'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                           {log.userId?.slice(0,1) || 'A'}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{log.userId ? `User ${log.userId.slice(0,6)}` : 'Sync Engine'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-300" />
                          {log.branchId ? `Branch: ${log.branchId.slice(0,6)}` : 'Cloud HQ'}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-100/50">
                          Verified
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-xs font-bold text-slate-900">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{new Date(log.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
