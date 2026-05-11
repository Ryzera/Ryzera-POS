'use client';

import { 
  ShieldAlert, RotateCcw, History, CheckCircle2, AlertTriangle, 
  Database, RefreshCw, ArrowRight, ShieldCheck, Clock, List
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecoveryPage() {
  const snapshots = [
    { id: 'snp-421', date: '2026-05-04 02:00', type: 'FULL', size: '42.4 MB', branch: 'Global HQ' },
    { id: 'snp-420', date: '2026-05-03 18:00', type: 'INCREMENTAL', size: '1.2 MB', branch: 'Colombo-01' },
    { id: 'snp-419', date: '2026-05-03 12:00', type: 'INCREMENTAL', size: '0.8 MB', branch: 'Kandy-02' },
    { id: 'snp-418', date: '2026-05-03 02:00', type: 'FULL', size: '41.8 MB', branch: 'Global HQ' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disaster Recovery</h1>
          <p className="text-sm text-gray-500 mt-1">Advanced system rollbacks and branch-specific data restoration</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm">
           <ShieldAlert className="h-4 w-4" />
           <span className="text-[10px] font-black uppercase tracking-widest">Emergency Protocol Active</span>
        </div>
      </header>

      <div className="p-8 max-w-6xl space-y-8 overflow-y-auto">
        {/* Warning Banner */}
        <div className="bg-red-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-red-500/30">
           <AlertTriangle className="absolute -bottom-6 -right-6 h-48 w-48 text-white/10" />
           <div className="relative z-10 max-w-2xl">
              <h3 className="text-2xl font-black mb-4">System Snapshot Restoration</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-8">
                 Restoring a system snapshot is a destructive action. All data synchronized after the snapshot timestamp will be overwritten. 
                 We strongly recommend creating a manual backup before proceeding with any recovery protocol.
              </p>
              <div className="flex gap-4">
                 <button className="px-6 py-3 bg-white text-red-600 rounded-2xl text-sm font-black hover:bg-gray-100 transition flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" /> Initiate Full Rollback
                 </button>
                 <button className="px-6 py-3 bg-red-700 text-white rounded-2xl text-sm font-bold hover:bg-red-800 transition">
                    View Recovery Logs
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Available Snapshots */}
           <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Available Restore Points</h3>
                 <History className="h-5 w-5 text-gray-300" />
              </div>
              <div className="divide-y divide-gray-50 flex-1">
                 {snapshots.map(snp => (
                    <div key={snp.id} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition group">
                       <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${snp.type === 'FULL' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             <Database className="h-6 w-6" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900">{snp.branch} - {snp.type} Snapshot</p>
                             <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                                <Clock className="h-3 w-3" /> Created: {snp.date}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-xs font-bold text-gray-900">{snp.size}</p>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">{snp.id}</p>
                          </div>
                          <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition flex items-center gap-2">
                             Select <ArrowRight className="h-3 w-3" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
                 <button className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto">
                    <List className="h-3.5 w-3.5" /> View All Archives
                 </button>
              </div>
           </div>

           {/* Recovery Stats */}
           <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Snapshot Analytics</h3>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-gray-500">Storage Optimization</span>
                          <span className="text-blue-600">84%</span>
                       </div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-[84%] bg-blue-600 rounded-full" />
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-gray-900">Zero-Loss Verification</p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">All snapshots are checksum-verified upon creation to guarantee 100% data integrity during recovery.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Auto-Snapshot Job</h3>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />
                       <span className="text-xs font-bold text-gray-700">Next cycle in 04:22:15</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-full">Active</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
