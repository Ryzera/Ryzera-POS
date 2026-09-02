'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, LayoutDashboard, List, Database, Bell, Cpu, AlertCircle, ShieldCheck,
  RefreshCw, Server, Zap, Globe, Thermometer, Clock, CheckCircle2, XCircle,
  BarChart3, LineChart, ArrowUpRight, TrendingUp, HardDrive, MapPin,
  Search, Filter, ChevronDown, ChevronRight, Play, Pause, FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import api from '@/lib/api';

export default function HealthPage() {
  const { user } = useAuthStore();
  const { branches, getBranchName } = useBranches();
  const branchQuery = (user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN') ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');
  
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [collapsedRegions, setCollapsedRegions] = useState<Record<string, boolean>>({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  const toggleRegion = (city: string) => {
    setCollapsedRegions(prev => ({ ...prev, [city]: !prev[city] }));
  };

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const [healthRes, metricsRes] = await Promise.all([
        api.get(`/sync/health${branchQuery}`),
        api.get(`/sync/metrics${branchQuery}`)
      ]);
      const healthData = healthRes.data?.data || healthRes.data;
      const metricsData = metricsRes.data?.data || metricsRes.data;

      // Display only devices and telemetry returned by the authenticated API.
      const dbDevices = Array.isArray(healthData?.devices) ? healthData.devices : [];
      setHealth({
        ...healthData,
        totalDevices: healthData?.totalDevices ?? dbDevices.length,
        onlineDevices: healthData?.onlineDevices ?? dbDevices.filter((d: any) => d.isOnline).length,
        devices: dbDevices
      });
      setMetrics(metricsData);
      setLastRefreshed(new Date());
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [branchQuery, branches]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchHealth();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const generatePDFReport = async () => {
    const toastId = toast.loading('Generating Perfect Enterprise Report...');
    
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Top blue banner
      pdf.setFillColor(30, 58, 138); // blue-900
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RYZERA POS', 15, 17);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(`System Health Report • Generated: ${new Date().toLocaleString()}`, 15, 35);
      
      // Executive Summary Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text('Executive Summary', 15, 50);
      
      // Draw 4 Summary Cards (Width 40, Gap 5)
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.5);
      
      // Card 1: Score
      pdf.roundedRect(15, 55, 41, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Overall Score', 19, 63);
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${healthScore}%`, 19, 73);
      
      // Card 2: Status
      pdf.roundedRect(61, 55, 41, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('System Status', 65, 63);
      pdf.setFontSize(16);
      let stColor = [15, 23, 42];
      if (statusText === 'Critical') stColor = [220, 38, 38];
      else if (statusText === 'Degraded') stColor = [217, 119, 6];
      else if (statusText === 'Operational') stColor = [16, 185, 129];
      pdf.setTextColor(stColor[0], stColor[1], stColor[2]);
      pdf.text(statusText, 65, 73);
      
      // Card 3: Nodes
      pdf.roundedRect(107, 55, 41, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Active Nodes', 111, 63);
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${onlineNodes} / ${totalNodes}`, 111, 73);
      
      // Card 4: Latency
      pdf.roundedRect(153, 55, 42, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Global Latency', 157, 63);
      pdf.setFontSize(16);
      pdf.setTextColor(health?.avgLatency > 100 ? 220 : 15, health?.avgLatency > 100 ? 38 : 23, health?.avgLatency > 100 ? 38 : 42);
      pdf.text(`${health?.avgLatency !== undefined ? health.avgLatency : 0} ms`, 157, 73);
      
      // Status Distribution
      const healthyCount = health?.devices?.filter((d: any) => d.branchStatus === 'HEALTHY').length || 0;
      const warningCount = health?.devices?.filter((d: any) => d.branchStatus === 'WARNING').length || 0;
      const criticalCount = health?.devices?.filter((d: any) => d.branchStatus === 'CRITICAL').length || 0;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Distribution:  Healthy (${healthyCount})   |   Warning (${warningCount})   |   Critical (${criticalCount})`, 15, 90);
      
      // Network Nodes Directory Table
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Network Nodes Status Directory', 15, 105);
      
      const allDevices = health?.devices || [];
      const sortedDevices = [...allDevices].sort((a: any, b: any) => {
         const order: any = { 'CRITICAL': 0, 'WARNING': 1, 'HEALTHY': 2 };
         return (order[a.branchStatus] ?? 3) - (order[b.branchStatus] ?? 3);
      });
      
      let finalY = 110;
      
      if (sortedDevices.length === 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text('No nodes found in the network.', 15, 115);
        finalY = 125;
      } else {
        const tableData = sortedDevices.map((d: any) => {
           let issueText = [];
           if (d.failedCount > 0) issueText.push(`${d.failedCount} Errors`);
           if (d.conflictCount > 0) issueText.push(`${d.conflictCount} Conflicts`);
           if (d.branchStatus === 'CRITICAL' && issueText.length === 0) issueText.push('Offline / Unreachable');
           if (d.branchStatus === 'HEALTHY') issueText.push('None (Operational)');
           
           return [
             d.branch?.name || 'Unknown',
             d.name || 'Unknown',
             d.branchStatus,
             issueText.join(', ')
           ];
        });
        
        autoTable(pdf, {
           startY: 110,
           head: [['Branch', 'Device', 'Status', 'Identified Issues']],
           body: tableData,
           theme: 'striped',
           headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
           styles: { fontSize: 9, cellPadding: 4, textColor: [71, 85, 105] },
           alternateRowStyles: { fillColor: [250, 250, 250] },
           willDrawCell: function (data: any) {
              if (data.column.index === 2 && data.cell.section === 'body') {
                 if (data.cell.raw === 'CRITICAL') {
                    pdf.setTextColor(220, 38, 38);
                    pdf.setFont('helvetica', 'bold');
                 } else if (data.cell.raw === 'WARNING') {
                    pdf.setTextColor(217, 119, 6);
                    pdf.setFont('helvetica', 'bold');
                 } else if (data.cell.raw === 'HEALTHY') {
                    pdf.setTextColor(16, 185, 129); // emerald-500
                    pdf.setFont('helvetica', 'bold');
                 }
              }
           }
        });
        finalY = (pdf as any).lastAutoTable.finalY + 15;
      }
      
      // Regional Breakdown Table
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Regional Connectivity Breakdown', 15, finalY);
      
      const regionalStats = Object.entries(
         (health?.devices || []).reduce((acc: any, device: any) => {
            const city = device.branch?.city || 'Unassigned Region';
            if (!acc[city]) acc[city] = { total: 0, online: 0 };
            acc[city].total++;
            if (device.isOnline) acc[city].online++;
            return acc;
         }, {})
      ).map(([city, stats]: [string, any]) => {
         const uptime = Math.round((stats.online / stats.total) * 100) + '%';
         return [city, stats.total.toString(), stats.online.toString(), uptime];
      });
      
      autoTable(pdf, {
         startY: finalY + 5,
         head: [['Region / City', 'Total Nodes', 'Online Nodes', 'Uptime']],
         body: regionalStats,
         theme: 'grid',
         headStyles: { fillColor: [56, 189, 248], textColor: [255, 255, 255], fontStyle: 'bold' },
         styles: { fontSize: 9, cellPadding: 4, textColor: [71, 85, 105] }
      });
      finalY = (pdf as any).lastAutoTable.finalY + 15;
      
      // Automated Action Plan
      // Check if we need to add a page break for the action plan
      if (finalY > 250) {
         pdf.addPage();
         finalY = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Automated Recommendations & Action Plan', 15, finalY);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      
      let recommendations = [];
      if (criticalCount > 0) {
         recommendations.push(`[Immediate Action] Investigate ${criticalCount} CRITICAL offline nodes.`);
      }
      if (warningCount > 0) {
         recommendations.push(`[Warning] Sync Conflicts detected. Manual resolution required for nodes with pending conflicts.`);
      }
      if (health?.avgLatency > 100) {
         recommendations.push(`[Network Warning] Global latency is elevated (${health.avgLatency}ms). Review network infrastructure and database load.`);
      }
      if (recommendations.length === 0) {
         recommendations.push(`[Info] System is fully stable. Continue standard monitoring.`);
      }
      
      recommendations.forEach((rec, idx) => {
         pdf.text(`•  ${rec}`, 15, finalY + 10 + (idx * 8));
      });
      
      pdf.save(`System-Health-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate report', { id: toastId });
    }
  };

  const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all duration-300">
      {/* Background Watermark Icon with clear visibility */}
      <div className="absolute -bottom-3 -right-3 opacity-[0.08] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        <Icon className={`h-28 w-28 ${color}`} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs group-hover:bg-blue-50/50 transition-colors">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100/60">
             <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        </div>
      </div>
    </div>
  );

  // Bottoms-Up Company Health Calculations
  const totalNodes = health?.devices?.length || 0;
  const onlineNodes = health?.devices?.filter((d: any) => d.isOnline).length || 0;
  const branchHealth = new Map<string, any>();
  health?.devices?.forEach((device: any) => {
    const branchKey = String(device.branch_id ?? device.branchId ?? device.branch?.name ?? device.id);
    const previous = branchHealth.get(branchKey);
    if (!previous || device.branchStatus === 'CRITICAL' || (device.branchStatus === 'WARNING' && previous !== 'CRITICAL')) {
      branchHealth.set(branchKey, device);
    }
  });
  const healthUnits = branchHealth.size || totalNodes;
  const failedNodes = Array.from(branchHealth.values()).filter((d: any) => Number(d.failedCount) > 0).length;
  const conflictNodes = Array.from(branchHealth.values()).filter((d: any) => Number(d.conflictCount) > 0).length;
  
  let totalScorePoints = 0;
  Array.from(branchHealth.values()).forEach((d: any) => {
     if (d.branchStatus === 'HEALTHY') totalScorePoints += 100;
     else if (d.branchStatus === 'WARNING') totalScorePoints += 50;
  });
  
  const healthScore = healthUnits > 0 ? Math.round(totalScorePoints / healthUnits) : 0;
  const latencyMs = Number(health?.avgLatency);
  const latencyLabel = Number.isFinite(latencyMs)
    ? latencyMs >= 60000 ? `${(latencyMs / 60000).toFixed(1)}m` : `${Math.round(latencyMs)}ms`
    : '—';
  const latencyTrend = !Number.isFinite(latencyMs) ? 'No data' : latencyMs <= 1000 ? 'Normal' : latencyMs <= 5000 ? 'Elevated' : 'High';
  
  const latencyChartData = (metrics?.latencyTimeline || [])
    .filter((t: any) => typeof t.latency === 'number' && Number.isFinite(t.latency))
    .map((t: any) => ({ t: t.time, l: t.latency }));

  const latencyValues = latencyChartData.map((point: any) => point.l);
  const latencySummary = latencyValues.length > 0
    ? {
        average: Math.round(latencyValues.reduce((sum: number, value: number) => sum + value, 0) / latencyValues.length),
        minimum: Math.min(...latencyValues),
        maximum: Math.max(...latencyValues),
      }
    : null;

  const formatLatencyDetail = (value: number | null | undefined) => {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    return `${Math.round(value).toLocaleString()} ms`;
  };

  const branchDisplayGroups = branches
    .map((branch: any) => {
      const branchDevices = (health?.devices || []).filter((device: any) =>
        Number(device.branch_id ?? device.branchId) === Number(branch.id)
      );
      const branchLabel = `${branch.name} (${branch.code})`;
      const matchesSearch = !searchQuery || branchLabel.toLowerCase().includes(searchQuery.toLowerCase()) || branch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL'
        ? true
        : branchDevices.some((device: any) => device.branchStatus === statusFilter);
      return { branch, devices: branchDevices, matchesSearch, matchesStatus };
    })
    .filter((group: any) => group.matchesSearch && group.matchesStatus);

  let statusText = 'Unknown';
  let statusColor = 'text-slate-500';
  let statusIcon = AlertCircle;
    if (healthUnits > 0) {
    if (healthScore === 100) { 
      statusText = 'Operational'; 
      statusColor = 'text-emerald-500'; 
      statusIcon = CheckCircle2;
    } else if (healthScore >= 80) { 
      statusText = 'Degraded'; 
      statusColor = 'text-amber-500'; 
      statusIcon = Activity;
    } else { 
      statusText = 'Critical'; 
      statusColor = 'text-red-500'; 
      statusIcon = AlertCircle;
    }
  }

  return (
    <>
      <div id="dashboard-content" className="max-w-7xl mx-auto space-y-8 bg-slate-50 p-6 -m-6 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Overall System Health</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time performance metrics and overall system module status</p>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Last refreshed: {lastRefreshed ? lastRefreshed.toLocaleString() : 'Loading'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition shadow-sm ${autoRefresh ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
               {autoRefresh ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
               {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
            <button onClick={generatePDFReport} className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 hover:border-blue-200 transition shadow-sm">
               <FileText className="h-3.5 w-3.5" />
               Export PDF
            </button>
            <button onClick={fetchHealth} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition border border-slate-200 bg-white shadow-sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {/* Distributed Branch Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Company Health" value={`${healthScore}%`} icon={Activity} color={statusColor} trend="Score" />
          <StatCard label="System Status" value={statusText} icon={statusIcon} color={statusColor} trend="Current" />
          <StatCard label="Node Network" value={`${onlineNodes}/${totalNodes}`} icon={LayoutDashboard} color={onlineNodes === totalNodes && totalNodes > 0 ? "text-emerald-500" : "text-amber-500"} trend="Nodes Online" />
          <StatCard 
            label="Global Latency" 
            value={latencyLabel}
            icon={Zap}
            color={latencyTrend === 'High' ? 'text-red-500' : latencyTrend === 'Elevated' ? 'text-amber-500' : 'text-indigo-500'}
            trend={latencyTrend} 
          />
        </div>

        {health && (failedNodes > 0 || conflictNodes > 0 || onlineNodes < totalNodes || latencyTrend === 'High') && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <p className="font-bold">Health attention required</p>
            <p className="mt-1 text-xs leading-5">
              {failedNodes > 0 ? `${failedNodes} branch(es) have failed sync records. ` : ''}
              {conflictNodes > 0 ? `${conflictNodes} branch(es) have unresolved conflicts. ` : ''}
              {onlineNodes < totalNodes ? `${totalNodes - onlineNodes} node(s) have no heartbeat within the last 5 minutes. ` : ''}
              {latencyTrend === 'High' ? 'Latency is above the normal threshold. Review the Sync Errors, Conflicts, and Device Manager pages before declaring the system healthy.' : ''}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Chart */}
           <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-8 lg:col-span-2">
              <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Latency Pulse (Valid Completed Syncs · Last 24 Hours)</h3>
                   <p className="mt-1 text-[10px] font-semibold text-slate-400">Values are measured in milliseconds (ms); high values may display as minutes in the summary card.</p>
                   <p className="mt-1 text-[10px] font-semibold text-slate-500">{latencyChartData.length} completed sync record{latencyChartData.length === 1 ? '' : 's'} returned for this period.</p>
                   <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                     <span className="rounded-md bg-slate-50 px-2 py-1">Average: {formatLatencyDetail(latencySummary?.average)}</span>
                     <span className="rounded-md bg-slate-50 px-2 py-1">Minimum: {formatLatencyDetail(latencySummary?.minimum)}</span>
                     <span className="rounded-md bg-slate-50 px-2 py-1">Maximum: {formatLatencyDetail(latencySummary?.maximum)}</span>
                   </div>
                 </div>
                 <LineChart className="h-5 w-5 text-slate-300" />
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyChartData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value: any) => [formatLatencyDetail(Number(value)), 'Latency']}
                    />
                    <Area type="monotone" dataKey="l" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 8 }} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Branch Connectivity */}
           <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Branch Connectivity</h3>
                   <Server className="h-4 w-4 text-slate-400" />
                 </div>
                 <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Database Branch Dropdown */}
                    <select
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value === 'ALL' ? '' : e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">🌐 All Branches</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>

                   <div className="relative w-full sm:w-auto">
                     <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Search branch..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                     />
                   </div>
                   <div className="flex bg-slate-100 p-0.5 rounded-md w-full sm:w-auto">
                     {['ALL', 'WARNING', 'CRITICAL'].map(filter => (
                       <button
                         key={filter}
                         onClick={() => setStatusFilter(filter)}
                         className={`flex-1 px-3 py-1.5 text-[10px] font-bold rounded-sm transition ${statusFilter === filter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         {filter}
                       </button>
                     ))}
                   </div>
                 </div>
              </div>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {branchDisplayGroups.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm font-medium">No branches match the selected filter</p>
                  </div>
                ) : (
                  branchDisplayGroups.map(({ branch, devices }: any) => {
                    const regionKey = `branch-${branch.id}`;
                    const isCollapsed = collapsedRegions[regionKey];
                    const branchSummary = branchHealth.get(String(branch.id));
                    const branchFailedCount = Number(branchSummary?.failedCount ?? 0);
                    const branchConflictCount = Number(branchSummary?.conflictCount ?? 0);
                    return (
                    <div key={regionKey} className="mb-4 last:mb-0 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div
                        className="flex items-center gap-2 mb-3 px-1 border-b border-slate-200 pb-2 cursor-pointer hover:bg-slate-200/50 rounded transition"
                        onClick={() => toggleRegion(regionKey)}
                      >
                        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{branch.name} ({branch.code})</h4>
                        {(branchFailedCount > 0 || branchConflictCount > 0) && (
                          <div className="ml-auto flex items-center gap-1.5 text-[9px] font-bold">
                            {branchFailedCount > 0 && (
                              <Link href={`/sync/errors?branch=${encodeURIComponent(branch.name)}`} className="rounded border border-red-100 bg-red-50 px-1.5 py-0.5 text-red-500 hover:underline">
                                Branch total: {branchFailedCount} Errors
                              </Link>
                            )}
                            {branchConflictCount > 0 && (
                              <Link href={`/sync/conflicts?branch=${encodeURIComponent(branch.name)}`} className="rounded border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-amber-500 hover:underline">
                                {branchConflictCount} Conflicts
                              </Link>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                          {devices.length} Nodes
                        </span>
                      </div>
                      {!isCollapsed && (
                      <div className="space-y-2">
                        {devices.length === 0 ? (
                          <div className="p-3 bg-white rounded-md border border-slate-200 text-xs text-slate-500">
                            No active POS devices returned for this branch.
                          </div>
                        ) : devices.map((device: any) => {
                          const branchName = device.branch?.name || branch.name || 'Unknown Branch';
                          let badgeColor = 'bg-red-50 text-red-600 border-red-200';
                          let dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
                          if (device.branchStatus === 'HEALTHY') {
                             badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                             dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                          } else if (device.branchStatus === 'WARNING') {
                             badgeColor = 'bg-amber-50 text-amber-600 border-amber-200';
                             dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                          }
                          return (
                            <div key={device.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 hover:border-blue-300 transition shadow-sm">
                               <div className="flex items-center gap-3">
                                  <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-slate-900">{branchName}</p>

                                    </div>
                                    <p className="text-[10px] font-medium text-slate-500">{device.name}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${badgeColor}`}>
                                   {device.branchStatus}
                                 </span>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
           </div>
        </div>
      </div>

      {/* --- HIDDEN FORMAL PRINT REPORT --- */}
      <div id="printable-report" className="hidden print:block p-8 bg-white text-slate-900 min-h-screen">
        <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
           <div>
             <h1 className="text-3xl font-black tracking-tight uppercase">Ryzera POS</h1>
             <h2 className="text-xl font-bold text-slate-500 mt-1">System Health Report</h2>
           </div>
           <div className="text-right">
             <p className="text-sm font-bold text-slate-400">Generated On</p>
             <p className="text-md font-black">{new Date().toLocaleString()}</p>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
           <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Score</p>
             <p className={`text-4xl font-black mt-2 ${statusColor}`}>{healthScore}%</p>
           </div>
           <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Status</p>
             <p className={`text-4xl font-black mt-2 ${statusColor}`}>{statusText}</p>
           </div>
           <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Nodes</p>
             <p className="text-4xl font-black mt-2 text-slate-900">{onlineNodes} / {totalNodes}</p>
           </div>
        </div>

        <h3 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 mt-8">Critical & Warning Nodes</h3>
        <table className="w-full text-left text-sm mb-10 border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="p-3 border border-slate-200 font-bold uppercase text-xs tracking-wider">Branch</th>
              <th className="p-3 border border-slate-200 font-bold uppercase text-xs tracking-wider">Device</th>
              <th className="p-3 border border-slate-200 font-bold uppercase text-xs tracking-wider">Status</th>
              <th className="p-3 border border-slate-200 font-bold uppercase text-xs tracking-wider">Issues</th>
            </tr>
          </thead>
          <tbody>
            {health?.devices?.filter((d: any) => d.branchStatus !== 'HEALTHY').length === 0 && (
               <tr><td colSpan={4} className="p-4 text-center text-slate-500 font-medium border border-slate-200">No critical or warning nodes found. System is healthy.</td></tr>
            )}
            {health?.devices?.filter((d: any) => d.branchStatus !== 'HEALTHY').map((d: any) => (
              <tr key={d.id} className="border border-slate-200">
                <td className="p-3 border border-slate-200 font-bold text-slate-800">{d.branch?.name || 'Unknown'}</td>
                <td className="p-3 border border-slate-200 text-slate-600">{d.name}</td>
                <td className="p-3 border border-slate-200">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${d.branchStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{d.branchStatus}</span>
                </td>
                <td className="p-3 border border-slate-200">
                   {d.failedCount > 0 ? <span className="mr-3 text-red-600 font-bold bg-red-50 px-2 py-1 rounded">{d.failedCount} Errors</span> : null}
                   {d.conflictCount > 0 ? <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">{d.conflictCount} Conflicts</span> : null}
                   {d.failedCount === 0 && d.conflictCount === 0 ? <span className="text-slate-400 font-medium">Offline/Unreachable</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-lg font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 mt-8 page-break-before-auto">Regional Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(
             (health?.devices || []).reduce((acc: any, device: any) => {
                const city = device.branch?.city || 'Unassigned Region';
                if (!acc[city]) acc[city] = { total: 0, online: 0 };
                acc[city].total++;
                if (device.isOnline) acc[city].online++;
                return acc;
             }, {})
          ).map(([city, stats]: [string, any]) => (
            <div key={city} className="flex justify-between items-center p-3 border border-slate-200 rounded bg-slate-50">
               <span className="font-bold text-slate-700">{city}</span>
               <span className="text-slate-500 font-medium text-sm">{stats.online} / {stats.total} Online</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
