'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, RefreshCw, Search, RotateCw, Trash2, 
  CheckCircle2, XCircle, MoreVertical, Download, 
  AlertTriangle, Eye, X, MapPin, Database, ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function ErrorsPage() {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedError, setSelectedError] = useState<any>(null);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/check-queue`);
      const data = await res.json();
      const failed = (data.queue || []).filter((item: any) => item.status === 'FAILED');
      setErrors(failed);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const handleRetry = async (id: string) => {
    try {
      await fetch(`${API_BASE}/sync/retry/${id}`, { method: 'POST' });
      toast.success('Retry triggered');
      fetchErrors();
    } catch (err) { toast.error('Retry failed'); }
  };

  const handleBatchRetry = async () => {
    if (selectedIds.length === 0) return;
    try {
      await fetch(`${API_BASE}/sync/batch-retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      toast.success(`Retrying ${selectedIds.length} errors`);
      setSelectedIds([]);
      fetchErrors();
    } catch (err) { toast.error('Batch retry failed'); }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Are you sure you want to delete selected errors?')) return;
    try {
      await fetch(`${API_BASE}/sync/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      toast.success(`Deleted ${selectedIds.length} records`);
      setSelectedIds([]);
      fetchErrors();
    } catch (err) { toast.error('Batch delete failed'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Errors</h1>
          <p className="text-sm text-slate-500 mt-1">Review and resolve failed data synchronizations</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchErrors} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
             <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-hidden flex flex-col space-y-6">
        {/* Action Bar */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search error messages..." className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
            </div>
            <div className="h-8 w-[1.5px] bg-slate-100" />
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{errors.length} Unresolved Issues</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 transition-all duration-300 ${selectedIds.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <button onClick={handleBatchRetry} className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition">
              <RotateCw className="h-3.5 w-3.5" /> Batch Retry
            </button>
            <button onClick={handleBatchDelete} className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition">
              <Trash2 className="h-3.5 w-3.5" /> Batch Purge
            </button>
          </div>
        </div>

        {/* Errors List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {errors.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">System Healthy</h3>
              <p className="text-sm text-slate-500 mt-2">Zero synchronization failures detected.</p>
            </div>
          ) : errors.map(error => (
            <div key={error.id} className={`bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition hover:shadow-md group ${selectedIds.includes(error.id) ? 'ring-2 ring-blue-500 border-transparent' : ''}`}>
              <div className="flex items-start gap-6">
                <div className="mt-1">
                   <input type="checkbox" checked={selectedIds.includes(error.id)} onChange={() => toggleSelect(error.id)}
                    className="h-5 w-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition cursor-pointer" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 transition">
                           <Database className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">{error.entity}</h3>
                        <span className="text-[10px] font-black text-slate-300 font-mono uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg">{error.id.split('-')[0]}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {error.branchId || 'Main HQ'}</span>
                        <span className="flex items-center gap-1.5"><RotateCw className="h-3 w-3" /> Attempt {error.attempts}/5</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-slate-900">{new Date(error.createdAt).toLocaleTimeString()}</p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{new Date(error.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-red-50/30 p-6 rounded-2xl border border-red-100/30 mb-6 flex items-start gap-4">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                       <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Error Trace</p>
                       <p className="text-sm text-red-900 font-bold leading-relaxed">{error.error || 'The synchronization engine encountered a fatal connection timeout during transmission.'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <button onClick={() => handleRetry(error.id)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md">
                        <RotateCw className="h-3.5 w-3.5" /> Retry Sync
                      </button>
                      <button onClick={() => setSelectedError(error)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                        <Eye className="h-3.5 w-3.5" /> View Payload
                      </button>
                    </div>
                    <button className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payload Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Transaction Payload</h3>
                <p className="text-sm text-slate-500 mt-1 uppercase font-black tracking-widest">Entity: {selectedError.entity}</p>
              </div>
              <button onClick={() => setSelectedError(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition">
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            <div className="p-10 bg-slate-50/30">
              <div className="bg-slate-900 rounded-[32px] p-8 overflow-hidden shadow-inner">
                <pre className="text-blue-400 text-xs font-mono overflow-auto max-h-[400px] custom-scrollbar leading-relaxed">
                  {JSON.stringify(selectedError.payload || { message: 'No payload attached' }, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-10 bg-white border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedError(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}