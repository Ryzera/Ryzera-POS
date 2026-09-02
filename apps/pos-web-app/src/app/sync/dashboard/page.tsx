'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCw, RefreshCw, Database, Activity, ArrowRight,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  ShieldAlert, Zap, List, Settings, Eye,
  Server, MapPin, GitBranch, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, AreaChart, Area
} from 'recharts';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { io } from 'socket.io-client';
import api, { extractArray } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SOCKET_BASE = API_BASE.replace(/\/api\/?$/, '');

interface SyncRecord { id: string; entity: string; status: string; branchId?: string; companyId?: string; createdAt: string; error?: string; }
interface SyncStatus { pending: number; synced: number; failed: number; total: number; }
interface SystemHealth { status: string; onlineDevices: number; totalDevices: number; branch_id?: number | null; timestamp: string; }
interface SyncMetrics { p50: number; p95: number; p99: number; unit: string; throughput: { time: string; count: number }[]; lastSyncTime?: string | Date | null; }
interface BranchStatus { branch_id: number; pending: number; synced: number; failed: number; health: string; lastSync?: string | null; }

const formatTimeSafe = (dateVal: any) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString();
  } catch { return '—'; }
};

const formatRelativeTime = (date: Date | null) => {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const branchQuery = (user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN') ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');

  const { branches, getBranchName } = useBranches();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ pending: 0, synced: 0, failed: 0, total: 0 });
  const [queueItems, setQueueItems] = useState<SyncRecord[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({ status: 'UNKNOWN', onlineDevices: 0, totalDevices: 0, branch_id: null, timestamp: '' });
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>({ p50: 0, p95: 0, p99: 0, unit: 'ms', throughput: [] });
  const [allBranchStatuses, setAllBranchStatuses] = useState<BranchStatus[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  const isOfflineRef = useRef(false);

  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  const userBranchObj = branches.find(b => b.id === user?.branch_id);
  const userBranchLabel = userBranchObj ? `${userBranchObj.name} (${userBranchObj.code})` : null;

  useEffect(() => {
    if (!isAdmin && userBranchLabel && selectedBranch === 'ALL') {
      setSelectedBranch(userBranchLabel);
    }
  }, [isAdmin, userBranchLabel, selectedBranch]);

  const {
    isOnline, pendingCount: offlinePendingCount, isSyncing: isOfflineSyncing,
    syncPendingData, lastSyncTime, isCircuitOpen, consecutiveFailures
  } = useOfflineSync();

  const { data: queryData, refetch: refetchData } = useQuery({
    queryKey: ['dashboard', branchQuery],
    queryFn: async () => {
      if (isOfflineRef.current || !navigator.onLine) return null;
      const [sr, br, qr, hr, mr, cr] = await Promise.all([
        api.get(`/sync/status${branchQuery}`).catch(() => ({ data: null })),
        api.get(`/sync/status/all`).catch(() => ({ data: null })),
        api.get(`/sync/check-queue${branchQuery}`).catch(() => ({ data: null })),
        api.get(`/sync/health${branchQuery}`).catch(() => ({ data: null })),
        api.get(`/sync/metrics`).catch(() => ({ data: null })),
        api.get(`/sync/conflicts${branchQuery}`).catch(() => ({ data: null }))
      ]);
      return { sr, br, qr, hr, mr, cr };
    },
    staleTime: 60000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!queryData) return;
    const { sr, br, qr, hr, mr, cr } = queryData;
    
    if (sr?.data) {
      const d = sr.data.data || sr.data;
      setSyncStatus({
        pending: d.pending || 0,
        synced: d.synced || 0,
        failed: d.failed || 0,
        total: (d.pending || 0) + (d.synced || 0) + (d.failed || 0)
      });
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }

    if (br?.data) setAllBranchStatuses(extractArray<BranchStatus>(br.data));
    if (qr?.data) setQueueItems((qr.data.data || qr.data).queue || []);
    if (hr?.data) setSystemHealth(hr.data.data || hr.data);
    if (mr?.data) setSyncMetrics(mr.data.data || mr.data);
    if (cr?.data) setConflictCount((cr.data.data || cr.data).length || 0);

    setLastRefreshed(new Date());
  }, [queryData]);

  const refreshAll = useCallback(async () => {
    try {
      await refetchData();
    } catch (err) {
      console.error('Error during refresh:', err);
    }
  }, [refetchData]);

  const handleSyncNow = async () => {
    if (syncing || isOfflineSyncing || isOfflineRef.current || !navigator.onLine) {
      if (isOfflineRef.current || !navigator.onLine) { toast.error('Offline — data saved locally'); return; }
      return;
    }
    setSyncing(true);
    const tid = toast.loading('Synchronizing multi-branch offline queues...');
    try {
      if (isOnline) {
        await syncPendingData();
      }
      await refetchData();
      toast.dismiss(tid);
      toast.success('Synchronization completed successfully.');
      setSyncing(false);
    } catch (err: any) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.message || 'Sync failed');
      setSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setIsConnected(navigator.onLine);
    isOfflineRef.current = !navigator.onLine;
    refreshAll();

    let interval: NodeJS.Timeout | null = null;

    const onOnline = () => {
      isOfflineRef.current = false;
      setIsConnected(true);
      toast.success('🟢 Back online');
      refreshAll();
    };
    const onOffline = () => {
      isOfflineRef.current = true;
      setIsConnected(false);
      toast.error('🔴 You are offline');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // WebSocket Integration
    const socket = io(`${SOCKET_BASE}/sync`);
    socket.on('connect', () => setIsSocketConnected(true));
    socket.on('disconnect', () => setIsSocketConnected(false));
    socket.on('new-notification', (data) => {
      // Whenever we get a websocket push that sync is done/failed, refresh automatically
      if (!isOfflineRef.current && navigator.onLine) {
        refreshAll();
      }
    });

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      socket.disconnect();
    };
  }, [refreshAll]);

  const filterBranches = isAdmin 
    ? ['ALL', ...branches.map(b => `${b.name} (${b.code})`)]
    : (userBranchLabel ? [userBranchLabel] : []);

  const getRecordBranchName = (q: SyncRecord) => getBranchName((q as any).branch_id || q.branchId);

  const filteredQueue = selectedBranch === 'ALL'
    ? queueItems
    : queueItems.filter(q => getRecordBranchName(q) === selectedBranch);

  const branchSummary = branches.map(branch => {
    const branchRecords = queueItems.filter(q => Number((q as any).branch_id ?? q.branchId) === Number(branch.id));
    const queueFailed = branchRecords.filter(q => q.status === 'FAILED').length;
    const queueSynced = branchRecords.filter(q => q.status === 'SYNCED').length;
    const queuePending = branchRecords.filter(q => q.status === 'PENDING').length;
    const statusInfo = allBranchStatuses.find(s => Number(s.branch_id) === Number(branch.id));
    const failed = statusInfo?.failed ?? queueFailed;
    const synced = statusInfo?.synced ?? queueSynced;
    const pending = statusInfo?.pending ?? queuePending;
    const health = failed > 0 ? 'CRITICAL' : pending > 0 ? 'WARNING' : (statusInfo?.health || 'HEALTHY');
    const branchLabel = `${branch.name} (${branch.code})`;

    return {
      id: branch.id,
      name: branchLabel,
      pending,
      synced,
      failed,
      lastSync: formatTimeSafe(statusInfo?.lastSync || null),
      health,
    };
  });

  const volumeData = (syncMetrics.throughput && syncMetrics.throughput.length > 0)
    ? Array.from({ length: 8 }, (_, i) => {
        // Go back up to 7 hours from the current hour
        const hour = new Date(Date.now() - (7 - i) * 3600000).getHours();
        const timeStr = `${hour.toString()}:00`;
        const timeStrPadded = `${hour.toString().padStart(2, '0')}:00`;
        const t = syncMetrics.throughput.find(x => x.time === timeStr || x.time === timeStrPadded);
        return {
          time: timeStrPadded,
          records: t ? t.count : 0
        };
      })
    : [];


  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8" suppressHydrationWarning={true}>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sync Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time synchronization telemetry</p>
          </div>

          {/* Online / Offline badge */}
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>

          {/* WebSocket Status */}
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
            isSocketConnected
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-slate-50 text-slate-500 border border-slate-200'
          }`} title={isSocketConnected ? 'Real-time sync active' : 'Real-time sync disconnected'}>
            <Zap className={`h-3 w-3 ${isSocketConnected ? 'text-blue-500' : 'text-slate-400'}`} />
            {isSocketConnected ? 'Live' : 'Polling'}
          </span>

          {/* Circuit-breaker warning */}
          {isCircuitOpen && (
            <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3" />
              Circuit Open — Sync Paused
            </span>
          )}

          {/* Offline queue badge */}
          {offlinePendingCount > 0 && (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-3 py-1 rounded-full animate-bounce">
              💾 {offlinePendingCount} queued offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Manual refresh */}
          <button
            id="refresh-btn"
            onClick={refreshAll}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition"
            title="Refresh now"
          >
            <RefreshCw className="h-5 w-5" />
          </button>



          {/* Sync Now */}
          <button
            id="sync-now-btn"
            onClick={handleSyncNow}
            disabled={syncing || isOfflineSyncing || isCircuitOpen}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {syncing || isOfflineSyncing
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <RotateCw className="h-4 w-4" />}
            {syncing || isOfflineSyncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* ── Circuit Breaker Alert ── */}
      {isCircuitOpen && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-900">Circuit Breaker Active</p>
            <p className="text-xs text-orange-700 mt-0.5">
              {consecutiveFailures} consecutive failures detected. Sync is paused for 5 minutes to protect the server.
              The circuit will automatically reset. You can still save data offline.
            </p>
          </div>
        </div>
      )}

      {/* ── Unresolved Conflicts Banner ── */}
      {conflictCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-2xl p-5 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">Unresolved Data Conflicts</p>
              <p className="text-xs text-red-700 mt-0.5">
                {conflictCount} conflict(s) require manual resolution before affected branches can resume syncing.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/sync/conflicts')}
            className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
          >
            Resolve Now
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Records', value: syncStatus.total, sub: 'All time', color: 'text-slate-900', bg: 'from-slate-50 to-white', border: 'border-slate-100' },
          { label: 'Synced', value: syncStatus.synced, sub: 'Successfully done', color: 'text-emerald-600', bg: 'from-emerald-50 to-white', border: 'border-emerald-100' },
          { label: 'Pending Sync', value: syncStatus.pending, sub: 'Awaiting upload', color: 'text-amber-600', bg: 'from-amber-50 to-white', border: 'border-amber-100' },
          { label: 'Failed', value: syncStatus.failed, sub: 'Need attention', color: 'text-red-500', bg: 'from-red-50 to-white', border: 'border-red-100' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.bg} rounded-[28px] p-7 border ${c.border} shadow-sm hover:shadow-md transition`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{c.label}</p>
            <p className={`text-4xl font-bold ${c.color} mb-1 leading-none tabular-nums`}>{c.value}</p>
            <p className="text-xs text-slate-400 mt-2">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Dashboard Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Footprint */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Storage</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Logs Retained: 7+ Days</p>
            </div>
          </div>
          <button
            onClick={async () => {
              const tid = toast.loading('Pruning old logs...');
              try {
                const res = await api.delete(`/sync/prune`);
                const json = res.data;
                toast.success(`Pruned ${json.data?.pruned || json.pruned || 0} old records.`, { id: tid });
                await refreshAll();
              } catch (err) {
                toast.error('Failed to prune database', { id: tid });
              }
            }}
            className="relative z-50 cursor-pointer pointer-events-auto mt-4 w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition border border-slate-200"
          >
            Clear Old Successful Logs
          </button>
        </div>

        {/* Last Sync Time */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex items-center gap-5">
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatRelativeTime(syncMetrics?.lastSyncTime ? new Date(syncMetrics.lastSyncTime) : null)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Dashboard refreshed: {formatRelativeTime(lastRefreshed)}</p>
          </div>
        </div>

        {/* Connected Devices */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex items-center gap-5">
          <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Server className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected Devices</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {systemHealth?.onlineDevices || 0} / {systemHealth?.totalDevices || 0}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Active POS Nodes</p>
          </div>
        </div>
      </div>

      {/* ── Branch Filter ── */}
      <div className="flex items-center">
        <select
          id="branch-filter-dropdown"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={!isAdmin}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
        >
          {filterBranches.map(b => (
            <option key={b} value={b}>
              {b === 'ALL' ? '🌐 All Branches' : b}
            </option>
          ))}
        </select>
      </div>

      {/* ── Branch Cards ── */}
      {branchSummary.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Branch</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Volume (Chart)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Pending</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Synced</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Failed</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Last Pulse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(selectedBranch === 'ALL' ? branchSummary : branchSummary.filter(b => b.name === selectedBranch))
                  .map(branch => {
                    const total = branch.pending + branch.synced + branch.failed;
                    const successRate = total > 0 ? (branch.synced / total) * 100 : 100;
                    const hasSevereIssues = branch.failed > 25 || branch.health === 'CRITICAL';
                    const hasWarning = branch.failed > 20 || (branch.failed > 15 && successRate < 80);
                    const isSyncing = branch.pending > 0;
                    const isHealthy = !hasSevereIssues && !hasWarning;
                    const statusText = hasSevereIssues ? 'CRITICAL' : (hasWarning ? 'ISSUES' : (isSyncing ? 'SYNCING' : 'HEALTHY'));
                    const statusClass = hasSevereIssues
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : hasWarning
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : isSyncing
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200';
                    const dotClass = hasSevereIssues ? 'bg-red-500 animate-pulse' : hasWarning ? 'bg-amber-500' : isSyncing ? 'bg-blue-500' : 'bg-emerald-500';
                    
                    return (
                      <tr key={branch.id} className={`hover:bg-slate-50/50 transition ${hasSevereIssues ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <MapPin className={`h-4 w-4 ${hasSevereIssues ? 'text-red-400' : (hasWarning ? 'text-amber-500' : 'text-emerald-500')}`} />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{branch.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {branch.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 w-max ${statusClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 w-32">
                          <div className="w-full flex h-1.5 rounded-full overflow-hidden bg-slate-100" title={`Total: ${total} records`}>
                            {total > 0 && <>
                              <div className="bg-emerald-500" style={{ width: `${(branch.synced / total) * 100}%` }} />
                              <div className="bg-amber-400" style={{ width: `${(branch.pending / total) * 100}%` }} />
                              <div className="bg-red-500" style={{ width: `${(branch.failed / total) * 100}%` }} />
                            </>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${branch.pending > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{branch.pending}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${branch.synced > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{branch.synced}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${hasSevereIssues ? 'text-red-500' : 'text-slate-300'}`}>{branch.failed}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                          {branch.lastSync}
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <Database className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500 font-medium">No branch sync records yet</p>
          <p className="text-xs text-slate-400 mt-1">Push a sync record to see branch activity here</p>
        </div>
      )}

      {/* ── FORCED SPACER ── */}
      <div className="w-full h-16 sm:h-24" aria-hidden="true" style={{ minHeight: '80px' }}></div>

      {/* ── Recent Sync Activity ── */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm">
        <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 text-sm">Recent Sync Activity</h3>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {filteredQueue.length} records
            </span>
          </div>
          <button
            id="view-queue-btn"
            onClick={() => router.push('/sync/queue')}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No sync activity yet</p>
            <p className="text-xs mt-1">Click "Sync Now" to push data to the server</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredQueue.slice(0, 5).map(item => {
              const isSync = item.status === 'SYNCED';
              const isFail = item.status === 'FAILED';
              return (
                <div key={item.id} className="px-7 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSync ? 'bg-emerald-50' : isFail ? 'bg-red-50' : 'bg-amber-50'
                  }`}>
                    {isSync
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : isFail
                        ? <XCircle className="h-4 w-4 text-red-500" />
                        : <Clock className="h-4 w-4 text-amber-500 animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 capitalize">{item.entity}</p>
                    <p className="text-xs text-slate-400">{getRecordBranchName(item)}{item.error ? ` · ${item.error}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isSync ? 'bg-emerald-50 text-emerald-600' :
                      isFail ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>{item.status}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{formatTimeSafe(item.createdAt || (item as any).created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}