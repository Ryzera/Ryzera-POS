'use client';

import { 
  Database, HardDrive, ShieldCheck, Zap, Info, 
  Trash2, RefreshCw, Layers, CheckCircle2, AlertTriangle, 
  Settings2, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StoragePage() {
  const stores = [
    { name: 'Sales Transactions', count: 1240, size: '2.4 MB', status: 'STABLE' },
    { name: 'Inventory Logs', count: 850, size: '1.8 MB', status: 'STABLE' },
    { name: 'Product Cache', count: 4200, size: '12.4 MB', status: 'OPTIMAL' },
    { name: 'Sync Queue (Pending)', count: 12, size: '45 KB', status: 'FAST' },
    { name: 'System Metadata', count: 45, size: '120 KB', status: 'STABLE' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offline Cache Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage local IndexedDB storage and PWA offline data persistence</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:text-red-600 transition shadow-sm text-slate-600">
              <Trash2 className="h-4 w-4" /> Purge Cache
           </button>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md">
              <RefreshCw className="h-4 w-4" /> Re-index Database
           </button>
        </div>
      </header>

      <div className="p-8 max-w-6xl space-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Storage KPI */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Local Storage</p>
                    <div className="flex items-end gap-2">
                       <p className="text-4xl font-black text-slate-900 leading-none">16.8</p>
                       <span className="text-xl font-bold text-slate-400 mb-1">MB</span>
                    </div>
                    <div className="mt-8 space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">Usage Limit</span>
                          <span className="text-slate-900">1.2% of 2GB</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full w-[1.2%] bg-blue-600 rounded-full" />
                       </div>
                    </div>
                 </div>
                 <HardDrive className="absolute -bottom-4 -right-4 h-32 w-32 text-blue-500/5 group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="bg-emerald-600 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                 <ShieldCheck className="absolute -bottom-4 -right-4 h-32 w-32 text-emerald-500/30" />
                 <h3 className="text-sm font-black uppercase tracking-widest opacity-70 mb-4">Data Integrity</h3>
                 <p className="text-2xl font-black mb-2">Verified</p>
                 <p className="text-xs font-medium opacity-80">Local IndexedDB structures are in perfect sync with the primary cloud schema.</p>
              </div>
           </div>

           {/* Store Details */}
           <div className="md:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Local Data Stores</h3>
                 <Layers className="h-5 w-5 text-slate-300" />
              </div>
              <div className="divide-y divide-slate-50">
                 {stores.map(store => (
                    <div key={store.name} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition">
                             <Database className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{store.name}</p>
                             <p className="text-[11px] text-slate-400 font-medium">{store.count} Records Cached</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-xs font-bold text-slate-900">{store.size}</p>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${store.status === 'OPTIMAL' ? 'text-emerald-500' : 'text-blue-500'}`}>{store.status}</p>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition"><Download className="h-4 w-4" /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 rounded-[32px] p-8 flex gap-6">
           <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-500/20">
              <AlertTriangle className="h-6 w-6" />
           </div>
           <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Low Storage Auto-Cleanup</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                 Smart-Retention is active. The system will automatically prune synced records older than 30 days if your browser storage 
                 exceeds 500MB to maintain peak POS performance.
              </p>
              <button className="mt-4 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-800 transition flex items-center gap-1.5">
                 <Settings2 className="h-3.5 w-3.5" /> Configure Retention Policy
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
