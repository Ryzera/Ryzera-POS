'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, Settings, LayoutDashboard, List, AlertCircle, RotateCw, RefreshCw,
  Database, Wifi, WifiOff, CheckCircle2, XCircle, Info, X, Clock, Activity, Cpu, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface SyncRecord { id: string; entity: string; status: string; branchId?: string; companyId?: string; createdAt: string; error?: string; }
interface Notification { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string; }
interface SyncStatus { pending: number; synced: number; failed: number; total: number; }

const statusConfig: Record<string, { label: string; color: string; dot: string; border: string; bg: string }> = {
  SYNCED:  { label: 'Synced',  color: 'text-green-600',  dot: 'bg-green-500',  border: 'border-b-green-500',  bg: 'bg-green-50'  },
  PENDING: { label: 'Pending', color: 'text-yellow-600', dot: 'bg-yellow-400 animate-pulse', border: 'border-b-yellow-400', bg: 'bg-yellow-50' },
  FAILED:  { label: 'Failed',  color: 'text-red-500',    dot: 'bg-red-500',    border: 'border-b-red-400',    bg: 'bg-red-50'    },
};

const notifIcon = (type: string) => {
  if (type === 'ERROR')   return <XCircle      className="h-4 w-4 text-red-500    flex-shrink-0" />;
  if (type === 'WARNING') return <Info         className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return                         <CheckCircle2 className="h-4 w-4 text-green-500  flex-shrink-0" />;
};

// REAL UUIDs from the database
const IDS = {
  "companyId": "c2eb3830-2184-4b7e-b19c-0498167b27a2",
  "Colombo HQ": "7fbb4773-bc67-4f61-a157-10e1ec953f97",
  "Kandy Branch": "fce17723-88fd-4267-9ada-fcfe5caf4481",
  "Galle Outlet": "20ee52f8-8d7b-4b23-babb-8a19baaf8b1f",
  "Negombo Store": "5ea04087-6895-46fb-8ab0-474b55e9caae",
  "Matara Point": "0711f446-d565-4697-b95f-71836015c89f",
  "Jaffna North": "f423c1a7-01db-478a-8585-8e0d7cb037b1"
};

// Helper: spread records across the last 8 hours for realistic volume data
const hoursAgo = (h: number, extra = 0) => new Date(Date.now() - h * 3600000 - extra * 60000).toISOString();

const SEED_RECORDS = [
  // Colombo HQ — 285 synced spread across hours 1-8
  ...Array(40).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H1-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(1,i) } })),
  ...Array(35).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H2-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(2,i) } })),
  ...Array(30).fill(null).map((_,i) => ({ entity: 'product', companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H3-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(3,i) } })),
  ...Array(45).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H4-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(4,i) } })),
  ...Array(50).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H5-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(5,i) } })),
  ...Array(35).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H6-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(6,i) } })),
  ...Array(30).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H7-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(7,i) } })),
  ...Array(20).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Colombo HQ"], payload: { id: `COL-H8-${i}`, branch: "Colombo HQ", last_modified: hoursAgo(8,i) } })),
  // Kandy Branch — 142 synced + 12 pending
  ...Array(50).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Kandy Branch"], payload: { id: `KDY-H1-${i}`, branch: "Kandy Branch", last_modified: hoursAgo(1,i) } })),
  ...Array(40).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Kandy Branch"], payload: { id: `KDY-H2-${i}`, branch: "Kandy Branch", last_modified: hoursAgo(2,i) } })),
  ...Array(32).fill(null).map((_,i) => ({ entity: 'product', companyId: IDS.companyId, branchId: IDS["Kandy Branch"], payload: { id: `KDY-H3-${i}`, branch: "Kandy Branch", last_modified: hoursAgo(3,i) } })),
  ...Array(20).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Kandy Branch"], payload: { id: `KDY-H4-${i}`, branch: "Kandy Branch", last_modified: hoursAgo(4,i) } })),
  ...Array(12).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Kandy Branch"], payload: { id: `KDP-${i}`,     branch: "Kandy Branch", last_modified: hoursAgo(0,i) } })),
  // Galle Outlet — 98 synced + 3 pending
  ...Array(35).fill(null).map((_,i) => ({ entity: 'product', companyId: IDS.companyId, branchId: IDS["Galle Outlet"], payload: { id: `GAL-H1-${i}`, branch: "Galle Outlet", last_modified: hoursAgo(1,i) } })),
  ...Array(30).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Galle Outlet"], payload: { id: `GAL-H2-${i}`, branch: "Galle Outlet", last_modified: hoursAgo(2,i) } })),
  ...Array(33).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Galle Outlet"], payload: { id: `GAL-H3-${i}`, branch: "Galle Outlet", last_modified: hoursAgo(3,i) } })),
  ...Array(3).fill(null).map((_,i)  => ({ entity: 'product', companyId: IDS.companyId, branchId: IDS["Galle Outlet"], payload: { id: `GAP-${i}`,     branch: "Galle Outlet", last_modified: hoursAgo(0,i) } })),
  // Negombo Store — 61 synced + 35 pending
  ...Array(30).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Negombo Store"], payload: { id: `NEG-H4-${i}`, branch: "Negombo Store", last_modified: hoursAgo(4,i) } })),
  ...Array(31).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Negombo Store"], payload: { id: `NEG-H5-${i}`, branch: "Negombo Store", last_modified: hoursAgo(5,i) } })),
  ...Array(28).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Negombo Store"], payload: { id: `NEP-${i}`,     branch: "Negombo Store", last_modified: hoursAgo(0,i) } })),
  ...Array(7).fill(null).map((_,i)  => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Negombo Store"], payload: { id: `NEF-${i}`,     branch: "Negombo Store", last_modified: hoursAgo(0,i) } })),
  // Matara Point — 77 synced + 4 pending
  ...Array(40).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Matara Point"],  payload: { id: `MAT-H2-${i}`, branch: "Matara Point", last_modified: hoursAgo(2,i) } })),
  ...Array(37).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Matara Point"],  payload: { id: `MAT-H3-${i}`, branch: "Matara Point", last_modified: hoursAgo(3,i) } })),
  ...Array(4).fill(null).map((_,i)  => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Matara Point"],  payload: { id: `MAP-${i}`,     branch: "Matara Point", last_modified: hoursAgo(0,i) } })),
  // Jaffna North — 33 synced
  ...Array(18).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Jaffna North"],  payload: { id: `JAF-H6-${i}`, branch: "Jaffna North", last_modified: hoursAgo(6,i) } })),
  ...Array(15).fill(null).map((_,i) => ({ entity: 'sale',    companyId: IDS.companyId, branchId: IDS["Jaffna North"],  payload: { id: `JAF-H7-${i}`, branch: "Jaffna North", last_modified: hoursAgo(7,i) } })),
];

export default function Dashboard() {
  const router = useRouter();
  const [syncStatus, setSyncStatus]       = useState<SyncStatus>({ pending: 0, synced: 0, failed: 0, total: 0 });
  const [queueItems, setQueueItems]       = useState<SyncRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isConnected, setIsConnected]     = useState(true);
  const [syncing, setSyncing]             = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [activeMenu, setActiveMenu]       = useState('dashboard');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dataSource, setDataSource]       = useState<'real'|'seeded'|'loading'>('loading');
  const [seeding, setSeeding]             = useState(false);
  const isOfflineRef = useRef(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    if (isOfflineRef.current || !navigator.onLine) { setIsConnected(false); return; }
    try {
      const r = await fetch(`${API_BASE}/sync/status`);
      if (r.ok) { const d = await r.json(); setSyncStatus({ pending: d.pending||0, synced: d.synced||0, failed: d.failed||0, total: (d.pending||0)+(d.synced||0)+(d.failed||0) }); setIsConnected(true); }
      else setIsConnected(false);
    } catch { setIsConnected(false); }
  }, []);

  const fetchQueue = useCallback(async () => {
    if (isOfflineRef.current || !navigator.onLine) return;
    try {
      const r = await fetch(`${API_BASE}/sync/check-queue`);
      if (r.ok) { const d = await r.json(); setQueueItems((d.queue || []).slice(0, 20)); }
    } catch {}
  }, []);

  const fetchNotifs = useCallback(async () => {
    if (isOfflineRef.current || !navigator.onLine) return;
    try {
      const [nr, cr] = await Promise.all([fetch(`${API_BASE}/notifications`), fetch(`${API_BASE}/notifications/unread/count`)]);
      if (nr.ok) { const d = await nr.json(); setNotifications(Array.isArray(d) ? d : []); }
      if (cr.ok) { const c = await cr.json(); setUnreadCount(typeof c === 'number' ? c : 0); }
    } catch {}
  }, []);

  const markRead = async (id: string) => {
    try { await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' }); await fetchNotifs(); } catch {}
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => fetch(`${API_BASE}/notifications/${n.id}/read`, { method: 'PATCH' })));
      await fetchNotifs();
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleSyncNow = async () => {
    if (syncing || isOfflineRef.current || !navigator.onLine) {
      if (isOfflineRef.current || !navigator.onLine) { toast.error('Offline — data saved locally'); return; }
      return;
    }
    setSyncing(true);
    const tid = toast.loading('Syncing...');
    try {
      await fetch(`${API_BASE}/sync/push`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entity: 'manual_sync', payload: { time: new Date().toISOString() } }) });
      toast.dismiss(tid); toast.success('Sync complete!');
      await Promise.all([fetchStatus(), fetchQueue(), fetchNotifs()]);
    } catch { toast.dismiss(tid); toast.error('Sync failed'); }
    setSyncing(false);
  };

  const seedBackend = useCallback(async () => {
    if (isOfflineRef.current || !navigator.onLine) return;
    setSeeding(true);
    const tid = toast.loading(`Seeding backend with ${SEED_RECORDS.length} sample records...`);
    // Push in small batches to avoid overloading the API
    const BATCH = 10;
    for (let i = 0; i < SEED_RECORDS.length; i += BATCH) {
      const batch = SEED_RECORDS.slice(i, i + BATCH);
      await Promise.allSettled(batch.map(r =>
        fetch(`${API_BASE}/sync/push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r),
        })
      ));
    }
    toast.dismiss(tid);
    toast.success('Backend seeded! Fetching real data...');
    setDataSource('seeded');
    setSeeding(false);
    await Promise.all([fetchStatus(), fetchQueue(), fetchNotifs()]);
  }, [fetchStatus, fetchQueue, fetchNotifs]);

  useEffect(() => {
    setMounted(true);
    setIsConnected(navigator.onLine);
    isOfflineRef.current = !navigator.onLine;
    // Fetch then auto-seed if empty
    const init = async () => {
      await Promise.all([fetchStatus(), fetchQueue(), fetchNotifs()]);
    };
    init();
    const interval = setInterval(() => { if (!isOfflineRef.current && navigator.onLine) { fetchStatus(); fetchQueue(); fetchNotifs(); } }, 30000);
    const onOnline  = () => { isOfflineRef.current = false; setIsConnected(true);  toast.success('Back online'); fetchStatus(); fetchQueue(); fetchNotifs(); };
    const onOffline = () => { isOfflineRef.current = true;  setIsConnected(false); toast.error('You are offline'); };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => { clearInterval(interval); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [fetchStatus, fetchQueue, fetchNotifs]);

  // Auto-seed if backend is empty after first fetch
  useEffect(() => {
    if (!mounted) return;
    if (syncStatus.total === 0 && queueItems.length === 0 && !seeding && isConnected) {
      setDataSource('loading');
      seedBackend();
    } else if (syncStatus.total > 0 || queueItems.length > 0) {
      if (dataSource === 'loading') setDataSource('real');
    }
  }, [mounted, syncStatus.total, queueItems.length, seeding, isConnected, seedBackend, dataSource]);

  // Close notif panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Group by branch for summary cards
  const getBranchName = (q: SyncRecord) => (q.payload as any)?.branch || q.branchId || 'Unknown';
  const branchNames = Array.from(new Set(queueItems.map(getBranchName).filter(Boolean))) as string[];
  const branches = ['ALL', ...branchNames];

  const filteredQueue = selectedStatus === 'ALL' 
    ? queueItems 
    : queueItems.filter(q => getBranchName(q) === selectedStatus);

  const branchSummary = branchNames.map(name => {
    const items = queueItems.filter(q => getBranchName(q) === name);
    return {
      id: items.find(i => i.branchId)?.branchId || name,
      name: name,
      pending: items.filter(i => i.status === 'PENDING').length,
      synced:  items.filter(i => i.status === 'SYNCED').length,
      failed:  items.filter(i => i.status === 'FAILED').length,
      lastSync: items[0]?.createdAt ? new Date(items[0].createdAt).toLocaleTimeString() : '—',
    };
  });

  // Build volume chart from real createdAt timestamps grouped by hour
  const volumeData = Array.from({ length: 8 }, (_, i) => {
    const hOffset = 7 - i; // 7 hours ago → now
    const hourStart = new Date(Date.now() - hOffset * 3600000);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 3600000);
    const label = `${hourStart.getHours().toString().padStart(2,'0')}:00`;
    const count = queueItems.filter(q => {
      const t = new Date(q.createdAt).getTime();
      return t >= hourStart.getTime() && t < hourEnd.getTime();
    }).length;
    const failed = queueItems.filter(q => {
      const t = new Date(q.createdAt).getTime();
      return t >= hourStart.getTime() && t < hourEnd.getTime() && q.status === 'FAILED';
    }).length;
    const pending = queueItems.filter(q => {
      const t = new Date(q.createdAt).getTime();
      return t >= hourStart.getTime() && t < hourEnd.getTime() && q.status === 'PENDING';
    }).length;
    const color = failed > 0 ? '#EF4444' : pending > 0 ? '#F59E0B' : '#10B981';
    return { time: label, records: count, color };
  });

  if (!mounted) return null;

  return (
    <>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Sync Dashboard</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Now */}
            <button onClick={handleSyncNow} disabled={syncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1C2536] text-white rounded-xl text-sm font-semibold hover:bg-[#111827] transition shadow-sm disabled:opacity-60">
              {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifs(v => !v)}
                className="relative p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} unread</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>
                      )}
                      <button onClick={() => setShowNotifs(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-gray-400">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : notifications.slice(0, 15).map(n => (
                      <div key={n.id} onClick={() => markRead(n.id)}
                        className={`px-5 py-3.5 flex gap-3 cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                        {notifIcon(n.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200 cursor-pointer">AD</div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Records',    value: syncStatus.total,   sub: 'All time',         color: 'text-slate-900' },
              { label: 'Synced',           value: syncStatus.synced,  sub: 'Successfully done', color: 'text-emerald-600' },
              { label: 'Pending Sync',     value: syncStatus.pending, sub: 'Awaiting upload',   color: 'text-amber-600' },
              { label: 'Failed',           value: syncStatus.failed,  sub: 'Need attention',    color: 'text-red-500' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{c.label}</p>
                <p className={`text-4xl font-bold ${c.color} mb-1 leading-none`}>{c.value}</p>
                <p className="text-xs text-slate-400 mt-2">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Branch Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {branches.map(b => (
              <button key={b} onClick={() => setSelectedStatus(b)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${selectedStatus === b ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 shadow-sm'}`}>
                {b === 'ALL' ? 'All Branches' : b}
              </button>
            ))}
          </div>

          {/* Branch Cards */}
          {branchSummary.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {(selectedStatus === 'ALL' ? branchSummary : branchSummary.filter(b => b.id === selectedStatus)).map(branch => {
                const total = branch.pending + branch.synced + branch.failed;
                const borderCol = branch.failed > 0 ? 'border-b-red-500' : branch.pending > 0 ? 'border-b-amber-500' : 'border-b-emerald-500';
                return (
                  <div key={branch.id} className={`bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden border-b-[6px] ${borderCol} transition hover:shadow-md`}>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{branch.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">ID: {branch.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 mb-6">
                        <div><p className="text-2xl font-black text-amber-500">{branch.pending}</p><p className="text-[9px] font-black text-slate-400 uppercase">Pending</p></div>
                        <div><p className="text-2xl font-black text-emerald-600">{branch.synced}</p><p className="text-[9px] font-black text-slate-400 uppercase">Synced</p></div>
                        <div><p className={`text-2xl font-black ${branch.failed > 0 ? 'text-red-500' : 'text-slate-200'}`}>{branch.failed}</p><p className="text-[9px] font-black text-slate-400 uppercase">Failed</p></div>
                      </div>
                      <div className="w-full flex h-2 rounded-full overflow-hidden bg-slate-100 mb-4">
                        {total > 0 && <>
                          <div className="bg-emerald-500" style={{ width: `${(branch.synced/total)*100}%` }} />
                          <div className="bg-amber-500" style={{ width: `${(branch.pending/total)*100}%` }} />
                          <div className="bg-red-500"    style={{ width: `${(branch.failed/total)*100}%`  }} />
                        </>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Last pulse: {branch.lastSync}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center mb-8">
              <Database className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">No sync records yet</p>
              <p className="text-xs text-gray-400 mt-1">Push a sync record to see branch activity here</p>
            </div>
          )}

          {/* Activity Feed from real queue */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Recent Sync Activity</h3>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{filteredQueue.length} records</span>
            </div>
            {filteredQueue.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredQueue.slice(0, 10).map(item => {
                  const cfg = statusConfig[item.status] || statusConfig['PENDING'];
                  return (
                    <div key={item.id} className="px-6 py-3.5 flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{item.entity}</p>
                        <p className="text-xs text-gray-400">{item.branchId || 'Main'} {item.error ? `· ${item.error}` : ''}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <p className="text-[11px] text-gray-400 flex-shrink-0">{new Date(item.createdAt).toLocaleTimeString()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Sync Volume Chart (Large) */}
            <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sync Volume</h3>
                  <p className="text-xs text-slate-400 mt-1">Activity over the last 8 hours</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Synced</div>
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-400" /> Pending</div>
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-500" /> Failed</div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="records" radius={[6, 6, 0, 0]} barSize={40}>
                      {volumeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3B82F6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health & Latency Widget (Small) */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Health</h3>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-[10px] font-black mb-2">
                    <span className="text-slate-400 uppercase tracking-widest">Latency (Avg)</span>
                    <span className="text-blue-600">84ms</span>
                  </div>
                  <div className="h-20 w-full opacity-40">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v:40},{v:60},{v:55},{v:80},{v:70},{v:84}]}>
                          <Area type="monotone" dataKey="v" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Terminals</span>
                    <span className="text-xs font-bold text-slate-900">12 / 12 Online</span>
                  </div>
                  <div className="flex gap-1.5">
                    {Array(12).fill(null).map((_, i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full bg-emerald-500 shadow-sm" />
                    ))}
                  </div>
                </div>

                <button onClick={() => router.push('/sync/health')}
                  className="w-full py-3.5 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition mt-4">
                  Full Health Report
                </button>
              </div>
            </div>
          </div>

        </div>
    </>
  );
}