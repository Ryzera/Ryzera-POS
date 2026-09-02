'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  RefreshCw, Database, MapPin, Search, Download, 
  Trash2, Play, Pause, Filter, CheckCircle2, AlertCircle, Clock, Eye, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface SyncLog {
  id: string | number;
  entity: string;
  status: string;
  branch_id?: number | string;
  branchId?: number | string;
  createdAt?: string;
  created_at?: string;
  payload?: any;
  error?: string | null;
}

export default function SyncQueue() {
  const { user } = useAuthStore();
  const branchQuery = (user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN') ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  
  const { branches, getBranchName } = useBranches();
  
  const [filter, setFilter] = useState('ALL');
  const [adminBranchFilter, setAdminBranchFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [inspectPayload, setInspectPayload] = useState<any>(null);

  const { data: logs = [], refetch, isLoading } = useQuery({
    queryKey: ['syncQueue', branchQuery],
    queryFn: async () => {
      const r = await api.get(`/sync/check-queue${branchQuery}`);
      const d = r.data?.data || r.data;
      return d.queue || [];
    },
    refetchInterval: 30000,
  });

  const handleRetry = async (ids: (string | number)[]) => {
    if (!isAdmin) {
      toast.error('Only Admin users can retry sync records');
      return;
    }
    try {
      await api.post('/sync/batch-retry', { ids: ids.map(Number) });
      toast.success('Retry initiated successfully');
      refetch();
      setSelectedIds([]);
    } catch {
      toast.error('Failed to retry sync logs');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!isAdmin) {
      toast.error('Only Admin users can delete sync records');
      return;
    }
    if (!confirm('Are you sure you want to delete this sync record?')) return;
    try {
      await api.delete(`/sync/${id}`);
      toast.success('Record deleted successfully');
      refetch();
    } catch {
      toast.error('Export failed');
    }
  };

  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  const toggleNetwork = async (offline: boolean) => {
    try {
      await api.post(`/sync/network/${offline ? 'offline' : 'online'}`);
      setIsSimulatedOffline(offline);
      toast.success(`Network simulated as ${offline ? 'OFFLINE' : 'ONLINE'}`);
    } catch {
      toast.error('Failed to change network state');
    }
  };

  const createTestSale = async () => {
    try {
      await api.post('/sync/test/sale');
      toast.success('Test offline sale created successfully!');
      refetch();
    } catch {
      toast.error('Failed to create test sale');
    }
  };

  const handleBatchDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} records?`)) return;
    try {
      await api.post('/sync/batch-delete', { ids: ids.map(Number) });
      toast.success('Records deleted successfully');
      refetch();
      setSelectedIds([]);
    } catch {
      toast.error('Failed to delete records');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredItems = logs.filter((item: any) => {
    const matchesSearch = item.entity.toLowerCase().includes(searchQuery.toLowerCase()) || String(item.id).includes(searchQuery);
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const bid = item.branch_id || item.branchId;
    const matchesBranch = adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
    return matchesSearch && matchesFilter && matchesBranch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i: any) => Number(i.id)));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sync Queue</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time monitor for all outbound and inbound sync traffic</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
         <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search by ID or entity..."
             className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
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
         <div className="flex gap-2">
           {['ALL', 'PENDING', 'SYNCED', 'FAILED'].map(s => (
             <button 
               key={s} 
               onClick={() => setFilter(s)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition ${
                 filter === s ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
               }`}
             >
               {s}
             </button>
           ))}
         </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-[24px] shadow-sm animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                {selectedIds.length}
             </div>
             <p className="text-sm font-semibold text-blue-900">Records Selected</p>
          </div>
          <div className="flex items-center gap-3">
             {isAdmin && (
               <button 
                 onClick={() => handleRetry(selectedIds)}
                 className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 border border-blue-200 transition shadow-sm"
               >
                 <RefreshCw className="h-4 w-4" /> Retry Selected
               </button>
             )}
             {isAdmin && (
               <button 
                 onClick={() => handleBatchDelete(selectedIds)}
                 className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 border border-red-200 transition shadow-sm"
               >
                 <Trash2 className="h-4 w-4" /> Delete Selected
               </button>
             )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm">
               <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 w-12 text-center bg-slate-50">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Entity & ID</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Branch Context</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Status</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredItems.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                      <Database className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No records found matching your criteria</p>
                   </td>
                 </tr>
               ) : filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                     <td className="px-6 py-5 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                          checked={selectedIds.includes(Number(item.id))}
                          onChange={() => toggleSelect(Number(item.id))}
                        />
                     </td>
                     <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition">
                              <Database className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{item.entity}</p>
                              <p className="text-[10px] text-slate-400 font-mono tracking-tighter truncate w-32">{item.id}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <MapPin className="h-3 w-3 text-slate-300" />
                           <span className="text-xs font-medium text-slate-600">
                             {item.payload?.branch || getBranchName(item.branch_id || item.branchId)}
                           </span>
                        </div>
                     </td>
                     <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                           item.status === 'SYNCED' ? 'bg-emerald-50 text-emerald-600' : 
                           item.status === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                           {item.status}
                        </span>
                     </td>
                     <td className="px-4 py-5">
                        <p className="text-xs font-bold text-slate-900">{new Date(item.createdAt || (item as any).created_at).toLocaleTimeString()}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt || (item as any).created_at).toLocaleDateString()}</p>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                              onClick={() => setInspectPayload(item)}
                              className="p-2 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition shadow-sm"
                              title="Inspect Payload"
                           >
                              <Eye className="h-4 w-4" />
                           </button>
                           {isAdmin && item.status === 'FAILED' && (
                              <button 
                                 onClick={() => handleRetry([item.id])}
                                 className="p-2 bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition shadow-sm"
                                 title="Retry"
                              >
                                 <RefreshCw className="h-4 w-4" />
                              </button>
                           )}
                           {isAdmin && (
                              <button 
                                 onClick={() => handleDelete(item.id)}
                                 className="p-2 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition shadow-sm"
                                 title="Delete"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           )}
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
        </div>
      </div>

      {/* Payload Inspector Modal */}
      {inspectPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Payload Inspector</h3>
                <p className="text-xs text-slate-500 mt-1">Entity: {inspectPayload.entity} | ID: {inspectPayload.id}</p>
              </div>
              <button 
                onClick={() => setInspectPayload(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto">
              {inspectPayload.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Sync Error</h4>
                    <p className="text-xs text-red-700 mt-1">{inspectPayload.error}</p>
                  </div>
                </div>
              )}
              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-xs text-emerald-400 font-mono">
                  {JSON.stringify(inspectPayload.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}