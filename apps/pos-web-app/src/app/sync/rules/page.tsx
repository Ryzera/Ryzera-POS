'use client';

import { 
  Gavel, Settings, ShieldCheck, Zap, Info, Plus, 
  ArrowRight, Trash2, CheckCircle2, SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RulesPage() {
  const rules = [
    { id: 1, entity: 'INVENTORY', strategy: 'ADDITIVE_MERGE', description: 'Sum quantities from all branches instead of overwriting.', active: true },
    { id: 2, entity: 'PRICING', strategy: 'SERVER_WINS', description: 'Always trust HQ prices in case of a conflict.', active: true },
    { id: 3, entity: 'CUSTOMER_DATA', strategy: 'LWW_TIMESTAMP', description: 'Use the record with the most recent modification time.', active: true },
    { id: 4, entity: 'TAX_CONFIG', strategy: 'GLOBAL_ENFORCED', description: 'Branch-level overrides are strictly prohibited.', active: true },
    { id: 5, entity: 'EMPLOYEE_LOGS', strategy: 'BRANCH_WINS', description: 'Branch-level attendance data is considered the truth.', active: false },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Policy Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Configure automated conflict resolution and synchronization logic</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md">
          <Plus className="h-4 w-4" /> New Sync Rule
        </button>
      </header>

      <div className="p-8 max-w-5xl space-y-8 overflow-y-auto">
        <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-6 flex gap-4">
          <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1 text-slate-900">Global Rule Inheritance</h4>
            <p className="text-xs text-blue-700 leading-relaxed text-slate-500">
              These rules act as the "Auto-Pilot" for your synchronization engine. If a conflict occurs and a rule is active, 
              the system will resolve it automatically without administrative intervention.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex items-center justify-between hover:border-blue-200 transition group shadow-sm">
              <div className="flex items-center gap-6">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${rule.active ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                   <Gavel className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{rule.entity}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${rule.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {rule.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolution Strategy</p>
                  <p className="text-sm font-bold text-blue-600 font-mono tracking-tighter">{rule.strategy}</p>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><SlidersHorizontal className="h-4 w-4" /></button>
                   <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[32px] p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                 <h3 className="text-xl font-bold mb-2 italic">Expert Recommendation</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">
                    Based on your multi-branch volume, we recommend using <span className="text-blue-400">Additive Merge</span> for inventory 
                    to ensure stock counts remain accurate during high-velocity sales periods.
                 </p>
              </div>
              <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-sm font-bold hover:bg-slate-100 transition whitespace-nowrap">
                 Update All Policies
              </button>
           </div>
           <ShieldCheck className="absolute -bottom-6 -left-6 h-32 w-32 text-white/5" />
        </div>
      </div>
    </div>
  );
}
