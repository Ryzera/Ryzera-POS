'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, TrendingUp, Zap, Clock, Database, ArrowUpRight, AlertCircle,
  ArrowDownRight, RefreshCw, Calendar, Download, PieChart as PieChartIcon,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { toast } from 'react-hot-toast';

import api, { extractArray } from '@/lib/api';

export default function AnalyticsPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [days, setDays] = useState<number>(30);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return extractArray<any>(res.data);
    }
  });

  const { data: metrics, isLoading: loading } = useQuery({
    queryKey: ['syncMetrics', days, selectedBranch],
    queryFn: async () => {
      let url = `/sync/metrics?days=${days}`;
      if (selectedBranch !== 'all') {
        url += `&branchId=${selectedBranch}`;
      }
      const res = await api.get(url);
      return res.data?.data || res.data;
    }
  });

  const { data: recentErrors = [], isLoading: errorsLoading } = useQuery({
    queryKey: ['syncErrors', selectedBranch],
    queryFn: async () => {
      const branchQuery = selectedBranch !== 'all' ? `?branchId=${selectedBranch}` : '';
      const r = await api.get(`/sync/check-queue${branchQuery}`);
      const data = r.data?.data || r.data;
      return (data.queue || []).filter((item: any) => item.status === 'FAILED');
    },
    refetchInterval: 30000,
  });

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
      pdf.text(`Sync Analytics Report • Generated: ${new Date().toLocaleString()}`, 15, 35);
      
      // Executive Summary Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text('Executive Summary', 15, 50);
      
      // Draw 3 Summary Cards
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      
      // Card 1
      pdf.roundedRect(15, 55, 55, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Total Sync Volume', 19, 63);
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${metrics?.totalVolume || 0}`, 19, 73);
      
      // Card 2
      pdf.roundedRect(75, 55, 55, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Success Rate', 79, 63);
      pdf.setFontSize(16);
      pdf.setTextColor(metrics?.successRate >= 98 ? 16 : 217, metrics?.successRate >= 98 ? 185 : 119, metrics?.successRate >= 98 ? 129 : 6);
      pdf.text(`${metrics?.successRate || 0}%`, 79, 73);
      
      // Card 3
      pdf.roundedRect(135, 55, 55, 25, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Active Branches', 139, 63);
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${branches.length}`, 139, 73);
      
      // Data Distribution Table
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Data Distribution', 15, 95);

      let finalY = 100;
      
      if (metrics?.distribution && metrics.distribution.length > 0) {
        const distSum = metrics.distribution.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
        const distData = metrics.distribution.map((d: any) => [
           d.name,
           d.value,
           `${((d.value / distSum) * 100).toFixed(1)}%`
        ]);
        
        autoTable(pdf, {
           startY: finalY,
           head: [['Entity Type', 'Volume', 'Percentage']],
           body: distData,
           theme: 'grid',
           headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold', halign: 'center', cellPadding: 3 },
           styles: { fontSize: 9, cellPadding: 3, textColor: [71, 85, 105], lineColor: [226, 232, 240], lineWidth: 0.1 },
           columnStyles: { 
             0: { halign: 'left' }, 
             1: { halign: 'right' }, 
             2: { halign: 'right' } 
           },
           alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        
        finalY = (pdf as any).lastAutoTable.finalY + 15;
      } else {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('No distribution data available.', 15, finalY);
        finalY += 15;
      }

      // Branch Comparison Table
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Branch Performance Comparison', 15, finalY);
      
      finalY += 5;

      if (selectedBranch === 'all' && branches.length > 0) {
        const branchData = branches.map((b: any) => {
          const bc = metrics?.branchComparison?.find((bcItem: any) => Number(bcItem.branchId) === Number(b.id));
          return [b.name, b.code, bc ? bc.count : 0];
        }).sort((a: any, b: any) => b[2] - a[2]);
        
        autoTable(pdf, {
           startY: finalY,
           head: [['Branch Name', 'Code', 'Sync Volume']],
           body: branchData,
           theme: 'grid',
           headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold', halign: 'center', cellPadding: 3 },
           styles: { fontSize: 9, cellPadding: 3, textColor: [71, 85, 105], lineColor: [226, 232, 240], lineWidth: 0.1 },
           columnStyles: { 
             0: { halign: 'left' }, 
             1: { halign: 'center' }, 
             2: { halign: 'right' } 
           },
           alternateRowStyles: { fillColor: [248, 250, 252] },
        });
      } else if (selectedBranch !== 'all' && metrics?.distribution) {
         const distData = metrics.distribution.map((d: any) => [d.name, d.value]);
         autoTable(pdf, {
           startY: finalY,
           head: [['Entity Type', 'Sync Volume']],
           body: distData,
           theme: 'grid',
           headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold', halign: 'center', cellPadding: 3 },
           styles: { fontSize: 9, cellPadding: 3, textColor: [71, 85, 105], lineColor: [226, 232, 240], lineWidth: 0.1 },
           columnStyles: { 
             0: { halign: 'left' }, 
             1: { halign: 'right' } 
           },
           alternateRowStyles: { fillColor: [248, 250, 252] },
        });
      }

      // Embed Visual Charts
      try {
        const { toPng } = await import('html-to-image');

        const captureChart = async (elementId: string) => {
          const el = document.getElementById(elementId);
          if (!el) {
            console.warn(`Element ${elementId} not found`);
            return null;
          }
          
          // Temporarily remove scrollbars for perfect capture
          const scrollableChild = el.querySelector('.overflow-y-auto');
          if (scrollableChild) {
            scrollableChild.classList.remove('overflow-y-auto');
            scrollableChild.classList.remove('flex-1');
          }

          try {
            const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2, style: { overflow: 'visible', height: 'auto' } });
            
            if (scrollableChild) {
              scrollableChild.classList.add('overflow-y-auto');
              scrollableChild.classList.add('flex-1');
            }
            
            return dataUrl;
          } catch (e) {
            console.error(`html-to-image failed on ${elementId}:`, e);
            if (scrollableChild) {
              scrollableChild.classList.add('overflow-y-auto');
              scrollableChild.classList.add('flex-1');
            }
            return null;
          }
        };

        const tpImg = await captureChart('chart-throughput');
        const distImg = await captureChart('chart-distribution');
        const compImg = await captureChart('chart-comparison');

        if (tpImg || distImg || compImg) {
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text('Analytical Charts & Visualizations', 15, 20);
          
          let cy = 30;
          if (tpImg) {
            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Throughput (Records/Interval)', 15, cy);
            pdf.addImage(tpImg, 'PNG', 15, cy + 5, 180, 70);
            cy += 85;
          }
          
          if (distImg) {
            if (cy > 160) { pdf.addPage(); cy = 20; }
            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Data Distribution', 15, cy);
            pdf.addImage(distImg, 'PNG', 15, cy + 5, 180, 110);
            cy += 125;
          }

          if (compImg) {
            if (cy > 180) { pdf.addPage(); cy = 20; }
            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Performance Comparison', 15, cy);
            pdf.addImage(compImg, 'PNG', 15, cy + 5, 180, 80);
          }
        }
      } catch (err: any) {
        console.warn('Failed to embed charts in PDF:', err);
        toast.error('Warning: Charts could not be embedded (' + err.message + ')');
      }

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
         pdf.setPage(i);
         pdf.setFontSize(8);
         pdf.setTextColor(148, 163, 184);
         pdf.text(`Ryzera Enterprise POS Analytics | Page ${i} of ${pageCount}`, 15, 285);
      }
      
      pdf.save(`Ryzera_Sync_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report generated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report', { id: toastId });
    }
  };

  if (loading && !metrics) {
    return <div className="p-10 text-center animate-pulse text-slate-500">Loading Analytics Pipeline...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8" id="analytics-report">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sync Analytics</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time throughput and database latency intelligence</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter */}
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Global Network (All Branches)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>

            {/* Time Filter */}
            <select 
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold outline-none"
            >
              <option value={1}>Last 24 Hours</option>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>

            {/* Export Report Button */}
            {selectedBranch === 'all' && (
              <button
                onClick={generatePDFReport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            )}
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Sync Vol.', value: metrics?.totalVolume || 0, trend: 'Total', up: true, icon: Database, color: 'text-blue-600' },
            { label: 'Success Rate', value: `${metrics?.successRate || 0}%`, trend: 'Health', up: (metrics?.successRate >= 98), icon: Zap, color: 'text-yellow-600' },
            { label: 'Active Branches', value: branches.length, trend: 'Online', up: true, icon: RefreshCw, color: 'text-emerald-500' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl bg-slate-50 ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black ${kpi.up ? 'text-green-600' : 'text-slate-400'}`}>
                   {kpi.trend}
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
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Throughput (Records/Interval)
                </h3>
              </div>
              <div id="chart-throughput" className="h-80 bg-white px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.throughput || []} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Distribution */}
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-emerald-500" /> Data Distribution
                </h3>
              </div>
              
              {(!metrics?.distribution || metrics.distribution.length === 0) ? (
                <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400">
                  No sync data available
                </div>
              ) : (
                <div id="chart-distribution" className="flex-1 flex flex-col bg-white px-2">
                  <div className="h-64 relative -mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics?.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {metrics?.distribution?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-2xl font-black text-slate-900 leading-none">{metrics?.totalVolume}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-50 flex-1 overflow-y-auto">
                      {metrics?.distribution?.map((item: any, i: number) => {
                        const distSum = metrics.distribution.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
                        return (
                          <div key={item.name} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                               <span className="text-xs font-bold text-slate-600">{item.name}</span>
                             </div>
                             <span className="text-xs font-black text-slate-900">{((item.value / distSum) * 100).toFixed(1)}%</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Comparison Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" /> 
              {selectedBranch === 'all' ? 'Branch Performance Comparison (Sync Volume)' : 'Entity Sync Volume Comparison'}
            </h3>
          </div>
          
          {!(selectedBranch === 'all' ? metrics?.branchComparison?.length > 0 : metrics?.distribution?.length > 0) ? (
            <div className="h-80 flex flex-col items-center justify-center text-sm font-medium text-slate-400">
              No volume data available for this context
            </div>
          ) : (
            <div id="chart-comparison" className="h-80 bg-white px-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={selectedBranch === 'all' 
                    ? branches.map((b: any) => {
                        const bc = metrics.branchComparison?.find((bcItem: any) => Number(bcItem.branchId) === Number(b.id));
                        return {
                          name: b.name,
                          volume: bc ? bc.count : 0
                        };
                      })
                    : metrics.distribution?.map((d: any) => ({
                          name: d.name,
                          volume: d.value
                        })) || []
                  } 
                  margin={{top: 10, right: 0, left: -20, bottom: 0}}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="volume" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>


      </div>
  );
}
