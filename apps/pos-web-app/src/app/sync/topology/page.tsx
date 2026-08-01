'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Globe, Share2, MapPin, Radio, Activity, Server, 
  RefreshCw, Signal, ShieldCheck, Zap, Search, AlertTriangle, CheckCircle2,
  X, Database, HardDrive, ArrowRightLeft, Clock
} from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:3000/api';

interface BranchStatus { branch_id: number; pending: number; synced: number; failed: number; health: string; lastSync?: string | null; }

export default function TopologyPage() {
  const { branches, getBranchName } = useBranches();
  const [allBranchStatuses, setAllBranchStatuses] = useState<BranchStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ISSUES_ONLY'>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/status/all`);
      if (res.ok) {
        const json = await res.json();
        setAllBranchStatuses(json.data || json);
      }
    } catch {
      toast.error('Failed to fetch topology data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Merge branches with status
  let mappedNodes = branches.map(b => {
    const statusInfo = allBranchStatuses.find(s => s.branch_id === b.id);
    return {
      id: b.id,
      name: b.name,
      code: b.code,
      status: statusInfo?.health || 'UNKNOWN',
      lastSync: statusInfo?.lastSync,
      latency: statusInfo?.health === 'HEALTHY' ? '< 50ms' : statusInfo?.health === 'DEGRADED' ? '> 200ms' : 'OFFLINE',
    };
  });

  // Calculate efficiency BEFORE filtering so the giant card remains globally accurate
  const healthyCount = mappedNodes.filter(n => n.status === 'HEALTHY').length;
  const totalCount = mappedNodes.length || 1;
  const efficiency = Math.round((healthyCount / totalCount) * 100);

  // Apply Filters
  if (filterMode === 'ISSUES_ONLY') {
    mappedNodes = mappedNodes.filter(n => n.status !== 'HEALTHY');
  }
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    mappedNodes = mappedNodes.filter(n => 
      n.name.toLowerCase().includes(query) || 
      n.code.toLowerCase().includes(query)
    );
  }

  // Sort nodes so CRITICAL and DEGRADED appear first in the visualizer and list
  mappedNodes.sort((a, b) => {
    const severity = { 'OFFLINE': 3, 'CRITICAL': 3, 'DEGRADED': 2, 'UNKNOWN': 1, 'HEALTHY': 0 };
    return (severity[b.status as keyof typeof severity] || 0) - (severity[a.status as keyof typeof severity] || 0);
  });

  // Dynamic scaling: Render all filtered nodes in the map
  const visualizerNodes = mappedNodes;

  const formatTimeSafe = (dateVal: any) => {
    if (!dateVal) return 'Never';
    try {
      return new Date(dateVal).toLocaleTimeString();
    } catch { return 'Never'; }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Network Topology</h2>
            <p className="text-xs text-slate-500 mt-1">Live global node mapping and branch-to-cloud connectivity visualization</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchStatus()}
              disabled={loading}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Enterprise Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search branches by name or code..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm shrink-0">
            <button 
              onClick={() => setFilterMode('ALL')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition ${filterMode === 'ALL' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Globe className="h-4 w-4" /> All Nodes
            </button>
            <button 
              onClick={() => setFilterMode('ISSUES_ONLY')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition ${filterMode === 'ISSUES_ONLY' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <AlertTriangle className="h-4 w-4" /> Issues Only
            </button>
          </div>
        </div>

        {/* Topology Visualizer */}
        <div id="topology-visualizer" className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[650px] relative overflow-hidden group">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
           </div>
           
           <div className="relative flex flex-col items-center justify-center w-full h-[550px]">
              {/* Central Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] z-20 animate-pulse">
                 <Server className="h-8 w-8 text-white" />
              </div>
              <p className="absolute top-[calc(50%+60px)] left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest z-20 bg-white/80 px-2 py-0.5 rounded-full">Ryzera Central</p>

              {/* Connecting Lines (CSS Visual) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-slate-200 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border-2 border-dashed border-slate-100 rounded-full animate-[spin_120s_linear_infinite]" />
              
              {/* Dynamic Branch Nodes */}
              {visualizerNodes.map((node, i) => {
                const angle = (i / visualizerNodes.length) * 2 * Math.PI - Math.PI / 2;
                // Alternate between inner radius (150px) and outer radius (225px)
                const radius = i % 2 === 0 ? 150 : 225;
                const top = `calc(50% + ${Math.sin(angle) * radius}px)`;
                const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                
                const isHealthy = node.status === 'HEALTHY';
                const isCritical = node.status === 'CRITICAL' || node.status === 'OFFLINE';
                
                return (
                  <div 
                    key={node.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30 group/node cursor-pointer transition-all duration-300 hover:scale-125 ${
                      isHealthy ? 'h-10 w-10 bg-white border border-emerald-100 shadow-sm rounded-2xl' : 
                      isCritical ? 'h-12 w-12 bg-red-50 border border-red-200 shadow-lg rounded-2xl animate-pulse ring-4 ring-red-500/20' : 
                      'h-10 w-10 bg-amber-50 border border-amber-200 shadow-sm rounded-2xl'
                    } ${selectedNodeId === node.id ? 'ring-4 ring-blue-500/50 scale-125' : ''}`}
                    style={{ top, left }}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                     <MapPin className={`h-5 w-5 ${isHealthy ? 'text-emerald-500' : isCritical ? 'text-red-500' : 'text-amber-500'}`} />
                     
                     {/* Tooltip */}
                     <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/node:opacity-100 transition whitespace-nowrap bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none z-30 flex flex-col items-center">
                       <span className="font-bold">{node.name}</span>
                       <span className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${isHealthy ? 'text-emerald-400' : isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                         {node.status}
                       </span>
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                     </div>
                     
                     {/* Connecting Line to Center */}
                     <svg className="absolute top-1/2 left-1/2 -z-10 pointer-events-none" style={{ overflow: 'visible' }}>
                        <line 
                          x1="0" y1="0" 
                          x2={-Math.cos(angle) * radius} y2={-Math.sin(angle) * radius} 
                          stroke={isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b'} 
                          strokeWidth="2" 
                          strokeOpacity="0.3"
                          strokeDasharray={isCritical ? "4 4" : "none"}
                        />
                     </svg>
                  </div>
                );
              })}
           </div>
         </div>

         {/* Branch List & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
           <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" /> Node Health Status
              </h3>
              
              {mappedNodes.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <p className="text-sm font-medium">No branches registered</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                   {mappedNodes.map(b => (
                     <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition group">
                        <div className="flex items-center gap-4">
                           <div className={`h-2.5 w-2.5 rounded-full ${b.status === 'HEALTHY' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : b.status === 'CRITICAL' || b.status === 'OFFLINE' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                           <div>
                              <p className="text-sm font-bold text-slate-900 leading-none mb-1">{b.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{b.code}</p>
                           </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                           <div className="text-left hidden sm:block">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Last Sync</p>
                             <p className="text-xs font-semibold text-slate-700">{formatTimeSafe(b.lastSync)}</p>
                           </div>
                           <div className="w-20">
                             <p className="text-xs font-black text-slate-800">{b.latency}</p>
                             <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${b.status === 'HEALTHY' ? 'text-emerald-500' : b.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>
                               {b.status}
                             </p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>

           <div className={`lg:col-span-2 min-h-[350px] p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden flex flex-col justify-between ${efficiency >= 90 ? 'bg-emerald-600 shadow-emerald-600/20' : efficiency >= 70 ? 'bg-amber-500 shadow-amber-500/20' : 'bg-red-600 shadow-red-600/20'}`}>
              <Zap className="absolute -bottom-4 -right-4 h-48 w-48 text-white opacity-10" />
              <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-6 flex items-center gap-2">
                   <Signal className="h-4 w-4" /> Global Network Efficiency
                 </h3>
                 <p className="text-6xl font-black mb-4">{efficiency}%</p>
                 <div className="bg-black/15 p-4 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
                   <p className="text-sm font-semibold opacity-95 leading-relaxed">
                     {efficiency >= 90 
                       ? 'System is operating at peak capacity with localized P2P caching enabled.' 
                       : efficiency >= 70 
                       ? 'Network is experiencing minor degradation. Some nodes are falling behind schedule.'
                       : 'Critical network failure. Multiple nodes are offline and require immediate attention.'}
                   </p>
                 </div>
              </div>
              <div className="relative z-10 pt-6 pb-2 border-t border-white/20 flex justify-center gap-16 sm:gap-24 items-end">
                 <div className="text-center">
                   <p className="text-3xl font-bold leading-none mb-1">{healthyCount}</p>
                   <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Healthy Nodes</p>
                 </div>
                 <div className="text-center">
                   <p className="text-3xl font-bold leading-none mb-1">{totalCount - healthyCount}</p>
                   <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Issues</p>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Node Drill-down Sidebar Overlay */}
        {selectedNodeId && (() => {
           const sNode = mappedNodes.find(n => n.id === selectedNodeId);
           const sStats = allBranchStatuses.find(s => s.branch_id === selectedNodeId);
           if (!sNode) return null;
           
           const isHealthy = sNode.status === 'HEALTHY';
           const isCritical = sNode.status === 'CRITICAL';
           
           return (
             <>
               {/* Backdrop */}
               <div 
                 className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-in fade-in"
                 onClick={() => setSelectedNodeId(null)}
               />
               {/* Sidebar */}
               <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 border-l border-slate-100 animate-in slide-in-from-right overflow-y-auto flex flex-col">
                 
                 {/* Header */}
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-10">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-emerald-500' : isCritical ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{sNode.code}</span>
                     </div>
                     <h2 className="text-xl font-bold text-slate-900">{sNode.name}</h2>
                   </div>
                   <button 
                     onClick={() => setSelectedNodeId(null)}
                     className="h-8 w-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 </div>
  
                 {/* Content */}
                 <div className="p-6 space-y-8 flex-1">
                   
                   {/* Quick Metrics Grid */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <Clock className="h-4 w-4 text-slate-400 mb-2" />
                         <div className="text-sm font-bold text-slate-900">{sNode.latency}</div>
                         <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">Latency</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <Database className="h-4 w-4 text-slate-400 mb-2" />
                         <div className="text-sm font-bold text-slate-900">
                           {sNode.lastSync ? new Date(sNode.lastSync).toLocaleTimeString() : 'Never'}
                         </div>
                         <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">Last Sync</div>
                      </div>
                   </div>
  
                   {/* Sync Queue */}
                   <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Live Sync Queue</h3>
                      
                      <div className="space-y-3">
                         <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="flex items-center gap-3">
                             <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                               <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                             </div>
                             <span className="text-sm font-bold text-slate-700">Pending Sync</span>
                           </div>
                           <span className="text-lg font-black text-amber-600">{sStats?.pending || 0}</span>
                         </div>
  
                         <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="flex items-center gap-3">
                             <div className="h-8 w-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                               <AlertTriangle className="h-4 w-4 text-red-600" />
                             </div>
                             <span className="text-sm font-bold text-slate-700">Failed / Conflicts</span>
                           </div>
                           <span className="text-lg font-black text-red-600">{sStats?.failed || 0}</span>
                         </div>
  
                         <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                           <div className="flex items-center gap-3">
                             <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                               <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                             </div>
                             <span className="text-sm font-bold text-slate-700">Successfully Synced</span>
                           </div>
                           <span className="text-lg font-black text-emerald-600">{sStats?.synced || 0}</span>
                         </div>
                      </div>
                   </div>
  
                   {/* Administrative Actions */}
                   <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Admin Controls</h3>
                      <div className="space-y-2">
                        <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition">
                          Force Manual Sync
                        </button>
                        <button className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl text-sm transition">
                          Quarantine Node
                        </button>
                      </div>
                   </div>
  
                 </div>
               </div>
             </>
           );
        })()}
      </div>
  );
}
