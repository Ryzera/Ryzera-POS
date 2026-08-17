'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, RefreshCw, Search, RotateCw, Trash2, 
  CheckCircle2, XCircle, MoreVertical, Download, 
  AlertTriangle, Eye, X, MapPin, Database, ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const formatTimeSafe = (dateVal: any) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString();
  } catch {
    return '—';
  }
};

const formatDateSafe = (dateVal: any) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  } catch {
    return '—';
  }
};

export default function ErrorsPage() {
  const { user } = useAuthStore();
  const branchQuery = (user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN') ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  
  const { branches, getBranchName } = useBranches();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedError, setSelectedError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminBranchFilter, setAdminBranchFilter] = useState('ALL');

  const { data: errors = [], refetch, isLoading: loading } = useQuery({
    queryKey: ['syncErrors', branchQuery],
    queryFn: async () => {
      const r = await api.get(`/sync/check-queue${branchQuery}`);
      const data = r.data?.data || r.data;
      return (data.queue || []).filter((item: any) => item.status === 'FAILED');
    },
    refetchInterval: 30000,
  });

  const [processing, setProcessing] = useState(false);

  const handleRetry = async (id: string | number) => {
    setProcessing(true);
    try {
      await api.post('/sync/batch-retry', { ids: [Number(id)] });
      toast.success('Retry triggered');
      refetch();
    } catch (err) { toast.error('Retry failed'); }
    setProcessing(false);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to discard this error?')) return;
    setProcessing(true);
    try {
      await api.post('/sync/batch-delete', { ids: [Number(id)] });
      toast.success('Error discarded');
      refetch();
    } catch (err) { toast.error('Discard failed'); }
    setProcessing(false);
  };

  const handleBatchRetry = async () => {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    try {
      await api.post('/sync/batch-retry', { ids: selectedIds.map(Number) });
      toast.success(`Retrying ${selectedIds.length} errors`);
      setSelectedIds([]);
      refetch();
    } catch (err) { toast.error('Batch retry failed'); }
    setProcessing(false);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Are you sure you want to delete selected errors?')) return;
    setProcessing(true);
    try {
      await api.post('/sync/batch-delete', { ids: selectedIds.map(Number) });
      toast.success(`Deleted ${selectedIds.length} records`);
      setSelectedIds([]);
      refetch();
    } catch (err) { toast.error('Batch delete failed'); }
    setProcessing(false);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    const loadingToast = toast.loading('Preparing export...');
    try {
      const response = await api.get(`/sync/export/${format}`, { responseType: format === 'csv' ? 'blob' : 'json' });
      const blobData = format === 'json' ? JSON.stringify(response.data, null, 2) : response.data;
      const blobType = format === 'json' ? 'application/json' : 'text/csv';
      const url = window.URL.createObjectURL(new Blob([blobData], { type: blobType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sync_errors_export_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success('Export downloaded successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.dismiss(loadingToast);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to export logs');
    }
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
          <button onClick={() => refetch()} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-600 text-xs font-bold hover:bg-slate-50 transition border-r border-slate-200"
            >
               <Download className="h-4 w-4" /> CSV
            </button>
            <button 
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
            >
               <Download className="h-4 w-4" /> JSON
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-hidden flex flex-col space-y-6">
        {/* Action Bar */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search error messages..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <select
                value={adminBranchFilter}
                onChange={(e) => setAdminBranchFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            )}
            <div className="h-8 w-[1.5px] bg-slate-100" />
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{errors.length} Unresolved Issues</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleBatchRetry} disabled={processing || selectedIds.length === 0} className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition disabled:opacity-50">
              <RefreshCw className="h-3 w-3" /> Retry Selected
            </button>
            <button onClick={handleBatchDelete} disabled={processing || selectedIds.length === 0} className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition disabled:opacity-50">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>

        {/* Errors List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {errors.filter((error: any) => {
            const matchesSearch = !searchQuery || JSON.stringify(error).toLowerCase().includes(searchQuery.toLowerCase());
            const bid = error.branch_id || error.branchId;
            const matchesBranch = adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
            return matchesSearch && matchesBranch;
          }).length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">System Healthy</h3>
              <p className="text-sm text-slate-500 mt-2">Zero synchronization failures detected.</p>
            </div>
          ) : errors.filter((error: any) => {
            const matchesSearch = !searchQuery || JSON.stringify(error).toLowerCase().includes(searchQuery.toLowerCase());
            const bid = error.branch_id || error.branchId;
            const matchesBranch = adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
            return matchesSearch && matchesBranch;
          }).map((error: any) => (
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
                        <span className="text-[10px] font-black text-slate-300 font-mono uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg">{String(error.id).split('-')[0]}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {getBranchName(error.branch_id || error.branchId)}</span>
                        <span className="flex items-center gap-1.5"><RotateCw className="h-3 w-3" /> Attempt {error.attempts}/5</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-slate-900">{formatTimeSafe(error.createdAt || error.created_at)}</p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{formatDateSafe(error.createdAt || error.created_at)}</p>
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
                    <div className="flex gap-2">
                      <button onClick={() => handleRetry(error.id)} disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                        <RefreshCw className="h-3.5 w-3.5" /> Retry
                      </button>
                      <button onClick={() => setSelectedError(error)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                        <Eye className="h-3.5 w-3.5" /> View Payload
                      </button>
                    </div>
                    <button onClick={() => handleDelete(error.id)} disabled={processing} className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100 disabled:opacity-50">
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
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Transaction Payload</h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">Entity: {selectedError.entity}</p>
              </div>
              <button onClick={() => setSelectedError(null)} className="p-2 hover:bg-slate-200/60 rounded-lg transition">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 bg-slate-50">
              <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 shadow-sm">
                <pre className="text-emerald-400 text-sm font-mono overflow-auto max-h-[350px] leading-relaxed">
                  {JSON.stringify(selectedError.payload || { message: 'No payload attached' }, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedError(null)} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-sm">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}