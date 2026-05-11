'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, RefreshCw, Search, CheckCircle2, XCircle, 
  MoreVertical, AlertTriangle, ArrowRight, ShieldAlert,
  ChevronLeft, ChevronRight, Gavel, Smartphone, Database,
  ArrowUpRight, ArrowDownRight, Layers, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/conflicts`);
      const data = await res.json();
      setConflicts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const resolveConflict = async (id: string, strategy: 'MANUAL' | 'SERVER_WINS' | 'CLIENT_WINS') => {
    const tid = toast.loading(`Executing ${strategy.replace('_', ' ')}...`);
    try {
      const resolution = strategy === 'CLIENT_WINS' ? 'branch_wins' : 'server_wins';
      
      await fetch(`${API_BASE}/sync/resolve-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId: id, resolution })
      });
      toast.dismiss(tid);
      toast.success('Discrepancy Resolved');
      fetchConflicts();
    } catch (err) { toast.dismiss(tid); toast.error('Resolution failed'); }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Conflicts</h1>
          <p className="text-sm text-slate-500 mt-1">Resolve data discrepancies between local branch and cloud states</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchConflicts} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-y-auto space-y-8">
        {conflicts.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[40px] border border-slate-100 border-dashed animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Data Synchronized</h2>
            <p className="text-slate-500 mt-3 font-medium max-w-sm mx-auto">All branch data perfectly matches the cloud state. No conflicts detected.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-amber-50/50 border border-amber-100 rounded-[32px] p-8 flex gap-6">
               <div className="h-14 w-14 bg-amber-500 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-amber-500/20 flex-shrink-0">
                  <AlertTriangle className="h-7 w-7" />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Manual Intervention Required</h4>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                     The following records encountered conflicts that could not be resolved by the automated policy engine. 
                     Please review the local vs cloud states and select the correct record to persist.
                  </p>
               </div>
            </div>

            <div className="grid gap-8">
              {conflicts.map(conflict => (
                <div key={conflict.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 hover:shadow-md transition">
                  <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 capitalize">{conflict.entity} Conflict</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Trace ID: {conflict.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 shadow-sm">Awaiting Choice</span>
                    </div>
                  </div>

                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Local State */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Smartphone className="h-4 w-4 text-blue-600" />
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Branch Record</h4>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase">Device ID: {conflict.branchId || 'POS-01'}</span>
                      </div>
                      <div className="bg-slate-900 rounded-[32px] p-8 shadow-inner group relative overflow-hidden">
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"><ArrowUpRight className="h-4 w-4" /></button>
                         </div>
                         <pre className="text-xs text-blue-400 font-mono overflow-auto max-h-60 leading-relaxed custom-scrollbar">
                           {JSON.stringify(conflict.clientData, null, 2)}
                         </pre>
                      </div>
                    </div>

                    {/* Server State */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Database className="h-4 w-4 text-purple-600" />
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Master Record</h4>
                        </div>
                        <span className="text-[10px] font-black text-purple-600 uppercase">Server Ver: 1.2.4</span>
                      </div>
                      <div className="bg-slate-900 rounded-[32px] p-8 shadow-inner group relative overflow-hidden">
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"><ArrowUpRight className="h-4 w-4" /></button>
                         </div>
                         <pre className="text-xs text-purple-400 font-mono overflow-auto max-h-60 leading-relaxed custom-scrollbar">
                           {JSON.stringify(conflict.serverData, null, 2)}
                         </pre>
                      </div>
                    </div>
                  </div>

                  <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                       <ShieldAlert className="h-5 w-5 text-amber-500" />
                       <p className="text-xs text-slate-600 font-bold italic">
                          Action required: Choose one state to overwrite the other.
                       </p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => resolveConflict(conflict.id, 'CLIENT_WINS')}
                        className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition shadow-sm">
                        Trust Local
                      </button>
                      <button onClick={() => resolveConflict(conflict.id, 'SERVER_WINS')}
                        className="px-6 py-3 bg-white border border-purple-200 text-purple-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-50 transition shadow-sm">
                        Trust Cloud
                      </button>
                      <button onClick={() => resolveConflict(conflict.id, 'MANUAL')}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-2 shadow-xl shadow-slate-900/20">
                        <Gavel className="h-4 w-4" />
                        Smart Merge
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
