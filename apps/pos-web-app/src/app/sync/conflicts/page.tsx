'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, RefreshCw, Search, CheckCircle2, XCircle, 
  MoreVertical, AlertTriangle, ArrowRight, ShieldAlert,
  ChevronLeft, ChevronRight, Gavel, Smartphone, Database,
  ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, X, Save, FileJson
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import api from '@/lib/api';

export default function ConflictsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  const { branches, getBranchName } = useBranches();
  
  const [adminBranchFilter, setAdminBranchFilter] = useState('ALL');

  // Strict branch isolation for non-admins
  const branchQuery = isAdmin ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');

  const [resolvingConflict, setResolvingConflict] = useState<any>(null);
  const [editedData, setEditedData] = useState<string>('');

  const { data: conflicts = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['syncConflicts', branchQuery],
    queryFn: async () => {
      const res = await api.get(`/sync/conflicts${branchQuery}`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000,
  });

  const resolveConflict = async (id: string | number, strategy: 'MANUAL' | 'SERVER_WINS' | 'CLIENT_WINS') => {
    if (strategy === 'MANUAL') {
      const conflict = conflicts.find((c: any) => String(c.id) === String(id));
      if (conflict) {
        setResolvingConflict(conflict);
        setEditedData(JSON.stringify(conflict.clientData || {}, null, 2));
      }
      return;
    }

    const tid = toast.loading(`Executing ${strategy.replace('_', ' ')}...`);
    try {
      const resolution = strategy === 'CLIENT_WINS' ? 'branch_wins' : 'server_wins';
      
      await api.post('/sync/resolve-conflict', {
        conflictId: Number(id),
        resolution
      });
      toast.dismiss(tid);
      toast.success('Discrepancy Resolved');
      refetch();
    } catch (err) { 
      toast.dismiss(tid); 
      toast.error('Resolution failed'); 
    }
  };

  const saveManualResolution = async () => {
    if (!resolvingConflict) return;
    let parsedData;
    try {
      parsedData = JSON.parse(editedData);
    } catch (e) {
      toast.error('Invalid JSON format');
      return;
    }

    const tid = toast.loading('Applying manual merge...');
    try {
      await api.post('/sync/resolve-conflict', {
        conflictId: Number(resolvingConflict.id),
        resolution: 'manual_merge',
        mergedData: parsedData
      });
      toast.dismiss(tid);
      toast.success('Smart Merge Applied Successfully');
      setResolvingConflict(null);
      refetch();
    } catch (err) {
      toast.dismiss(tid);
      toast.error('Merge failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sync Conflicts</h2>
            <p className="text-xs text-slate-500 mt-1">Resolve data discrepancies between local branch and cloud states</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <select
                value={adminBranchFilter}
                onChange={(e) => setAdminBranchFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition mr-2"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            )}
            <button onClick={() => refetch()} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {conflicts.filter(c => {
          const bid = c.syncLog?.branch_id || c.syncLog?.branchId;
          return adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
        }).length === 0 ? (
          <div className="py-32 text-center bg-white rounded-2xl border border-slate-100 border-dashed animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Data Synchronized</h2>
            <p className="text-slate-500 mt-3 font-medium max-w-sm mx-auto">All branch data perfectly matches the cloud state. No conflicts detected.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6">
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-8 flex gap-6">
               <div className="h-14 w-14 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 flex-shrink-0">
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

            <div className="grid gap-8 min-w-0 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {conflicts.filter(c => {
                const bid = c.syncLog?.branch_id || c.syncLog?.branchId;
                return adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
              }).map(conflict => (
                <div key={conflict.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 hover:shadow-md transition min-w-0">
                  <div className="px-6 sm:px-10 py-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex items-center gap-4 sm:ml-4">
                      <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 shrink-0">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 capitalize">{conflict.syncLog?.entity || 'Unknown'} Conflict</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Trace ID: {conflict.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:mr-4">
                       <span className="px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 shadow-sm whitespace-nowrap">Awaiting Choice</span>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                    {/* Local State */}
                    <div className="space-y-4 overflow-hidden min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                           <Smartphone className="h-4 w-4 text-blue-600" />
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Branch Record</h4>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase truncate">Device ID: {getBranchName(conflict.syncLog?.branch_id || conflict.syncLog?.branchId)}</span>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-5 shadow-inner group relative overflow-hidden">
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"><ArrowUpRight className="h-4 w-4" /></button>
                         </div>
                         <pre className="text-[11px] text-blue-400 font-mono overflow-auto max-h-60 leading-relaxed custom-scrollbar">
                           {JSON.stringify(conflict.clientData, null, 2)}
                         </pre>
                      </div>
                    </div>

                    {/* Server State */}
                    <div className="space-y-4 overflow-hidden min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                           <Database className="h-4 w-4 text-purple-600" />
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Master Record</h4>
                        </div>
                        <span className="text-[10px] font-black text-purple-600 uppercase truncate">Server Ver: 1.2.4</span>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-5 shadow-inner group relative overflow-hidden">
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"><ArrowUpRight className="h-4 w-4" /></button>
                         </div>
                         <pre className="text-[11px] text-purple-400 font-mono overflow-auto max-h-60 leading-relaxed custom-scrollbar">
                           {JSON.stringify(conflict.serverData, null, 2)}
                         </pre>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 sm:px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                       <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                       <p className="text-xs text-slate-600 font-bold italic">
                          Action required: Choose one state to overwrite the other.
                       </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:mr-4">
                      <button onClick={() => resolveConflict(conflict.id, 'CLIENT_WINS')}
                        className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition shadow-sm whitespace-nowrap">
                        Trust Local
                      </button>
                      <button onClick={() => resolveConflict(conflict.id, 'SERVER_WINS')}
                        className="px-6 py-3 bg-white border border-purple-200 text-purple-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-50 transition shadow-sm whitespace-nowrap">
                        Trust Cloud
                      </button>
                      <button onClick={() => resolveConflict(conflict.id, 'MANUAL')}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-2 shadow-xl shadow-slate-900/20 whitespace-nowrap">
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
    
      {/* Advanced Diff Viewer Modal */}
      {resolvingConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setResolvingConflict(null)} />
          <div className="relative bg-white rounded-[32px] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <FileJson className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Advanced Diff Viewer</h3>
                  <p className="text-sm font-medium text-slate-500">Smart merge for {resolvingConflict.syncLog?.entity} #{resolvingConflict.syncLog?.id}</p>
                </div>
              </div>
              <button onClick={() => setResolvingConflict(null)} className="p-3 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-2xl transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-slate-50 p-6 gap-6 min-h-0">
               {/* Left Side: Server Reference */}
               <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-purple-50/30">
                    <Database className="h-4 w-4 text-purple-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Cloud Master Reference (Read-Only)</h4>
                 </div>
                 <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-900">
                    <pre className="text-xs font-mono text-purple-300 leading-relaxed">
                      {JSON.stringify(resolvingConflict.serverData, null, 2)}
                    </pre>
                 </div>
               </div>

               {/* Right Side: Local Edit */}
               <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-blue-50/30">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Merged Output Payload (Editable)</h4>
                 </div>
                 <div className="flex-1 p-6 bg-slate-900 relative">
                    <textarea 
                      className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] bg-transparent text-emerald-400 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar"
                      value={editedData}
                      onChange={(e) => setEditedData(e.target.value)}
                      spellCheck="false"
                    />
                 </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
              <p className="text-sm font-medium text-slate-500 hidden sm:block">Edit the merged output on the right to finalize the resolution.</p>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button onClick={() => setResolvingConflict(null)} className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition">
                  Cancel
                </button>
                <button onClick={saveManualResolution} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                  <Save className="h-4 w-4" /> Save Merged Payload
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
