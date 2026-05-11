'use client';

import { 
  BarChart3, TrendingUp, Zap, Clock, Database, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Calendar, Download, PieChart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function AnalyticsPage() {
  const data = [
    { name: 'Mon', count: 420, errors: 12 },
    { name: 'Tue', count: 512, errors: 4 },
    { name: 'Wed', count: 480, errors: 8 },
    { name: 'Thu', count: 620, errors: 15 },
    { name: 'Fri', count: 890, errors: 2 },
    { name: 'Sat', count: 950, errors: 1 },
    { name: 'Sun', count: 320, errors: 5 },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Deep-dive performance metrics and data throughput intelligence</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm text-slate-600">
              <Download className="h-4 w-4" /> Download PDF
           </button>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md">
              <Calendar className="h-4 w-4" /> Last 30 Days
           </button>
        </div>
      </header>

      <div className="p-8 space-y-8 overflow-y-auto">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Sync Vol.', value: '42.8k', trend: '+14%', up: true, icon: Database, color: 'text-blue-600' },
            { label: 'Success Rate', value: '99.98%', trend: '+0.2%', up: true, icon: Zap, color: 'text-yellow-600' },
            { label: 'Avg Latency', value: '124ms', trend: '-18%', up: true, icon: Clock, color: 'text-green-600' },
            { label: 'Sync Errors', value: '24', trend: '+2', up: false, icon: AlertCircle, color: 'text-red-600' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl bg-slate-50 ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend} {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Throughput Chart */}
           <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Throughput (Records/Day)</h3>
                <TrendingUp className="h-5 w-5 text-slate-300" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Distribution */}
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Distribution</h3>
                <PieChart className="h-5 w-5 text-slate-300" />
              </div>
              <div className="h-64 flex items-center justify-center">
                 <div className="h-48 w-48 rounded-full border-[16px] border-blue-600 border-t-amber-400 border-l-emerald-500 relative flex items-center justify-center group cursor-pointer transition-transform hover:scale-105">
                    <div className="text-center">
                       <p className="text-2xl font-black text-slate-900 leading-none">100%</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                 {[
                   { name: 'Sales', val: '65%', color: 'bg-blue-600' },
                   { name: 'Inventory', val: '20%', color: 'bg-emerald-500' },
                   { name: 'Other', val: '15%', color: 'bg-amber-400' },
                 ].map(item => (
                   <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <span className="text-xs font-bold text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}
