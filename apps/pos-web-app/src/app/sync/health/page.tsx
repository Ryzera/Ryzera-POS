'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, LayoutDashboard, List, Database, Bell, Cpu, AlertCircle, ShieldCheck,
  RefreshCw, Server, Zap, Globe, Thermometer, Clock, CheckCircle2, XCircle,
  BarChart3, LineChart, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function HealthPage() {
  const [health, setHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/health`);
      const data = await res.json();
      setHealth(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className={`absolute -bottom-4 -right-4 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500`}>
        <Icon className={`h-32 w-32 ${color}`} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
        <div className="flex items-end gap-3">
          <p className="text-4xl font-black text-slate-900 leading-none">{value}</p>
          <span className="text-[11px] font-black text-emerald-500 mb-1 flex items-center gap-1">
             <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Health</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time performance metrics and synchronization infrastructure status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-sm">
             <Zap className="h-4 w-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Global Status: Optimal</span>
          </div>
          <button onClick={fetchHealth} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Avg Latency" value="42ms" icon={Zap} color="text-amber-500" trend="-12%" />
          <StatCard label="Uptime" value="99.9%" icon={Globe} color="text-blue-500" trend="Stable" />
          <StatCard label="Error Rate" value="0.02%" icon={AlertCircle} color="text-red-500" trend="-5%" />
          <StatCard label="CPU Load" value="24%" icon={Cpu} color="text-indigo-500" trend="Optimal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Chart */}
           <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Latency Pulse (24h)</h3>
                 <LineChart className="h-5 w-5 text-slate-300" />
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { t: '00:00', l: 45 }, { t: '04:00', l: 38 }, { t: '08:00', l: 52 },
                    { t: '12:00', l: 42 }, { t: '16:00', l: 39 }, { t: '20:00', l: 44 },
                  ]}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="l" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Node Health */}
           <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Regional Cluster Status</h3>
                 <Server className="h-5 w-5 text-slate-300" />
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Primary Cloud Cluster (AWS-US)', status: 'HEALTHY', latency: '12ms' },
                  { name: 'Branch Edge Node (Colombo-01)', status: 'HEALTHY', latency: '4ms' },
                  { name: 'Regional Relay (GCP-SG)', status: 'HEALTHY', latency: '28ms' },
                  { name: 'Secondary Backup (GCP-EU)', status: 'STANDBY', latency: '142ms' },
                ].map(node => (
                  <div key={node.name} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${node.status === 'HEALTHY' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                        <p className="text-sm font-bold text-slate-900">{node.name}</p>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 font-mono">{node.latency}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Health Log */}
        <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Performance Events</h3>
             <BarChart3 className="h-5 w-5 text-slate-300" />
          </div>
          <div className="divide-y divide-slate-50">
            {health.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                 <p className="text-sm font-medium">No performance alerts recorded</p>
              </div>
            ) : health.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-5 group hover:bg-slate-50/50 transition px-4 rounded-xl">
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition">
                     <Thermometer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{h.metric || 'Sync Volume Check'}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Status: <span className="text-emerald-600 font-bold">{h.value || 'Within Threshold'}</span></p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-slate-900">{new Date(h.createdAt).toLocaleTimeString()}</p>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(h.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
