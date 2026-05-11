'use client';

import { 
  Globe, Share2, MapPin, Radio, Activity, Server, 
  RefreshCw, Signal, ShieldCheck, Zap
} from 'lucide-react';

export default function TopologyPage() {
  const branches = [
    { name: 'Colombo HQ', status: 'ONLINE', latency: '12ms', devices: 12, region: 'Western' },
    { name: 'Kandy Branch', status: 'ONLINE', latency: '45ms', devices: 8, region: 'Central' },
    { name: 'Galle Outlet', status: 'ONLINE', latency: '28ms', devices: 5, region: 'Southern' },
    { name: 'Jaffna Express', status: 'DEGRADED', latency: '182ms', devices: 4, region: 'Northern' },
    { name: 'Negombo Mini', status: 'OFFLINE', latency: '--', devices: 3, region: 'Western' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Network Topology</h1>
          <p className="text-sm text-slate-500 mt-1">Global node mapping and branch-to-cloud connectivity visualization</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm">
             <Share2 className="h-4 w-4" /> Export Map
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto">
        {/* Topology Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
           </div>
           
           <div className="relative flex flex-col items-center">
              {/* Central Hub */}
              <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] z-20 animate-pulse">
                 <Server className="h-10 w-10 text-white" />
              </div>
              <p className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest">Ryzera Cloud Central</p>

              {/* Connecting Lines (CSS Visual) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-dashed border-gray-100 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border border-gray-100 rounded-full" />
              
              {/* Branch Nodes */}
              <div className="absolute -top-12 left-0 h-10 w-10 bg-white border-2 border-green-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition cursor-pointer group/node">
                 <MapPin className="h-5 w-5 text-green-500" />
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/node:opacity-100 transition whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-bold">Colombo HQ</div>
              </div>
              <div className="absolute bottom-0 -right-12 h-10 w-10 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition cursor-pointer group/node">
                 <Radio className="h-5 w-5 text-amber-500" />
              </div>
           </div>

           <div className="mt-12 text-center max-w-sm">
              <p className="text-sm font-medium text-gray-500">Interactive mesh network visualizer active. Click on a node to view branch-specific hardware telemetry.</p>
           </div>
        </div>

        {/* Branch List */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Node Health Status</h3>
              <div className="space-y-4">
                 {branches.map(b => (
                   <div key={b.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-blue-100 transition group">
                      <div className="flex items-center gap-3">
                         <div className={`h-2 w-2 rounded-full ${b.status === 'ONLINE' ? 'bg-green-500' : b.status === 'OFFLINE' ? 'bg-red-500' : 'bg-amber-500'}`} />
                         <div>
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{b.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{b.region} • {b.devices} Devices</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-gray-800">{b.latency}</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{b.status}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
              <Zap className="absolute -bottom-4 -right-4 h-32 w-32 text-blue-500/30" />
              <div className="relative z-10">
                 <h3 className="text-sm font-black uppercase tracking-widest opacity-70 mb-4">Network Efficiency</h3>
                 <p className="text-4xl font-black mb-2">94.2%</p>
                 <p className="text-xs font-medium opacity-80 leading-relaxed">System is operating at peak capacity with localized P2P caching enabled across active branches.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
