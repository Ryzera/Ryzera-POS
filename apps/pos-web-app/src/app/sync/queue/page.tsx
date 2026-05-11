'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, Database, MapPin, Search, Download, 
  Trash2, Play, Pause, Filter, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface SyncLog {
  id: string;
  entity: string;
  status: string;
  branchId?: string;
  createdAt: string;
}

export default function SyncQueue() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/sync/check-queue`);
      if (r.ok) {
        const d = await r.json();
        setLogs(d.queue || []);
      }
    } catch {
      toast.error('Failed to fetch sync queue');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = logs.filter(item => {
    const matchesSearch = item.entity.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.includes(searchQuery);
    const matchesFilter = filter === 'ALL' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time monitor for all outbound and inbound sync traffic</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLogs} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
             <Download className="h-4 w-4" /> Export logs
          </button>
        </div>
      </header>

      <div className="p-8 space-y-6 overflow-y-auto">
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

        {/* List */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity & ID</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Context</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredItems.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                        <Database className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No records found matching your criteria</p>
                     </td>
                   </tr>
                 ) : filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                       <td className="px-8 py-5">
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
                             <span className="text-xs font-medium text-slate-600">{item.branchId || 'Global HQ'}</span>
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
                       <td className="px-8 py-5 text-right">
                          <p className="text-xs font-bold text-slate-900">{new Date(item.createdAt).toLocaleTimeString()}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}