'use client';

import { useState, useEffect } from 'react';
import { 
  Smartphone, Laptop, Tablet, Monitor, ShieldCheck, ShieldAlert, 
  RefreshCw, Search, Plus, MoreVertical, MapPin, Clock, CheckCircle2, XCircle,
  Battery, Wifi, HardDrive, Lock, DownloadCloud, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useBranches } from '@/hooks/useBranches';
import { Modal, ModalHeader } from '@/components/ui/modal';

const API_BASE = 'http://localhost:3000/api';

type DeviceTelemetry = {
  battery: number;
  wifiSignal: string;
  storageFree: string;
  isCharging?: boolean;
};

// The frozen SyncDevice schema has no battery/Wi-Fi/storage columns. Prefer
// telemetry supplied by a future heartbeat response, and use deterministic
// demo telemetry only as a schema-safe fallback for the report's IoT demo.
const DEMO_TELEMETRY: DeviceTelemetry[] = [
  { battery: 86, wifiSignal: 'Strong (92%)', storageFree: '68% free' },
  { battery: 74, wifiSignal: 'Good (81%)', storageFree: '54% free' },
  { battery: 91, wifiSignal: 'Strong (95%)', storageFree: '73% free', isCharging: true },
];

const getDeviceTelemetry = (device: any): DeviceTelemetry => {
  const fallback = DEMO_TELEMETRY[Math.abs(Number(device.id) || 0) % DEMO_TELEMETRY.length];
  const rawBattery = device.battery ?? device.batteryPercentage ?? device.battery_percent ?? device.telemetry?.battery;
  const battery = Number.isFinite(Number(rawBattery)) ? Number(rawBattery) : fallback.battery;
  const wifiSignal = device.wifiSignal ?? device.networkSignal ?? device.telemetry?.wifiSignal ?? fallback.wifiSignal;
  const storageFree = device.storageFree ?? device.storage_free ?? device.telemetry?.storageFree ?? fallback.storageFree;
  return { battery, wifiSignal: String(wifiSignal), storageFree: String(storageFree), isCharging: device.isCharging ?? device.telemetry?.isCharging ?? fallback.isCharging };
};

const isActiveStatus = (status: any) => ['APPROVED', 'ACTIVE', 'ONLINE', 'SYNCING'].includes(String(status || '').toUpperCase());
const isTerminatedStatus = (status: any) => ['DEACTIVATED', 'REVOKED', 'REJECTED', 'TERMINATED'].includes(String(status || '').toUpperCase());

export default function DevicesPage() {
  const { user } = useAuthStore();
  const branchQuery = (user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN') ? '' : (user?.branch_id ? `?branchId=${user.branch_id}` : '');
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  
  const { branches, getBranchName } = useBranches();

  const getDisplayDeviceName = (device: any) => {
    const branchId = device.branch_id ?? device.branchId;
    const branchName = device.branch?.name || getBranchName(branchId) || `Branch ${branchId ?? ''}`.trim();
    const terminalNumber = String(device.id ?? 1).padStart(2, '0');
    return `${branchName} POS Terminal ${terminalNumber}`;
  };
  
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminBranchFilter, setAdminBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedLogDevice, setSelectedLogDevice] = useState<any | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<{ id: string | number; name: string } | null>(null);



  // Keep API fields intact and add only a schema-safe display fallback for the
  // report's simulated IoT telemetry when the frozen schema has no such fields.
  const injectMockMDM = (d: any) => ({
    ...d,
    ...getDeviceTelemetry(d),
    displayName: getDisplayDeviceName(d),
  });

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('access_token') || useAuthStore.getState().token) : null;
      const res = await fetch(`${API_BASE}/sync/devices${branchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const responseJson = await res.json();
      const data = responseJson.data || responseJson;
      setDevices(Array.isArray(data) ? data.map(injectMockMDM) : []);
    } catch (err) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`${API_BASE}/sync/devices/${id}/approve`, { method: 'POST' });
      toast.success('Device approved successfully');
      fetchDevices();
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleRevoke = (id: string | number, name: string) => {
    setPendingRevoke({ id, name });
  };

  const confirmRevoke = async () => {
    if (!pendingRevoke) return;
    const { id } = pendingRevoke;
    setPendingRevoke(null);
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('access_token') || localStorage.getItem('token'))
      : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    toast.promise(
      fetch(`${API_BASE}/sync/devices/${id}/revoke`, { method: 'POST', headers })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to revoke device');
          setDevices(prev => prev.map(d => String(d.id) === String(id) ? { ...d, status: 'REVOKED' } : d));
          await fetchDevices();
          return res;
        }),
      {
        loading: 'Revoking cryptographic tokens...',
        success: 'Device revoked. In-app and email security alerts generated.',
        error: 'Failed to revoke device',
      }
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'MOBILE': return <Smartphone className="h-5 w-5" />;
      case 'TABLET': return <Tablet className="h-5 w-5" />;
      case 'LAPTOP': return <Laptop className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.branchId?.toLowerCase().includes(searchQuery.toLowerCase());
    const bid = d.branch_id || d.branchId;
    const matchesBranch = adminBranchFilter === 'ALL' || String(bid) === adminBranchFilter;
    const matchesStatus = statusFilter === 'ACTIVE'
      ? isActiveStatus(d.status)
      : statusFilter === 'TERMINATED'
        ? isTerminatedStatus(d.status)
        : statusFilter
          ? d.status === statusFilter
          : true;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Device Management</h2>
            <p className="text-xs text-slate-500 mt-1">Authorize and monitor POS terminals across all branches</p>
          </div>
          <div className="flex items-center gap-3">

          <button onClick={fetchDevices} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        
          </div>
        </div>
        {/* Stats Row (Clickable Filters) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setStatusFilter(null)}
            className={`text-left p-6 rounded-[32px] border shadow-sm transition hover:scale-[1.02] active:scale-95 ${
              statusFilter === null ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-100 hover:border-slate-300'
            }`}
          >
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${statusFilter === null ? 'text-slate-400' : 'text-slate-400'}`}>Total Terminals</p>
            <p className={`text-3xl font-bold ${statusFilter === null ? 'text-white' : 'text-slate-900'}`}>{devices.length}</p>
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? null : 'ACTIVE')}
            className={`text-left p-6 rounded-[32px] border shadow-sm transition hover:scale-[1.02] active:scale-95 ${
              statusFilter === 'ACTIVE' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'
            }`}
          >
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Active Now</p>
            <p className="text-3xl font-bold text-blue-600">{devices.filter(d => isActiveStatus(d.status)).length}</p>
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 'PENDING' ? null : 'PENDING')}
            className={`text-left p-6 rounded-[32px] border shadow-sm transition hover:scale-[1.02] active:scale-95 border-l-4 border-l-amber-400 ${
              statusFilter === 'PENDING' ? 'bg-amber-50 border-amber-200' : 'bg-white hover:border-amber-200'
            }`}
          >
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Awaiting Approval</p>
            <p className="text-3xl font-bold text-amber-600">{devices.filter(d => d.status === 'PENDING').length}</p>
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 'TERMINATED' ? null : 'TERMINATED')}
            className={`text-left p-6 rounded-[32px] border shadow-sm transition hover:scale-[1.02] active:scale-95 border-l-4 border-l-red-400 ${
              statusFilter === 'TERMINATED' ? 'bg-red-50 border-red-200' : 'bg-white hover:border-red-200'
            }`}
          >
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Terminated</p>
            <p className="text-3xl font-bold text-red-600">{devices.filter(d => isTerminatedStatus(d.status)).length}</p>
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by device name, IP, or branch ID..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdmin && (
            <select
              value={adminBranchFilter}
              onChange={(e) => setAdminBranchFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={String(b.id)}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => {
            const active = isActiveStatus(device.status);
            const terminated = isTerminatedStatus(device.status);
            return (
            <div key={device.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition overflow-visible group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    active ? 'bg-blue-50 text-blue-600' : terminated ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      active ? 'bg-green-50 text-green-700' : 
                      terminated ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {device.status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{device.appVersion || 'v4.2.1 Stable'}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-slate-900 truncate">{device.displayName || getDisplayDeviceName(device)}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3 w-3" /> Branch: {getBranchName(device.branch_id || device.branchId)}
                    </p>
                  </div>

                  {/* Basic Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Seen</p>
                        <p className="text-[11px] font-bold text-slate-700 leading-none">
                          {new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 text-slate-400" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sync Load</p>
                        <p className="text-[11px] font-bold text-slate-700 leading-none">Healthy (0.4ms)</p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced MDM Telemetry */}
                  <div className={`pt-4 border-t border-slate-50 grid grid-cols-3 gap-2 ${terminated ? 'opacity-30 grayscale' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                         <Battery className={`h-3 w-3 ${device.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Power</span>
                      </div>
                      <span className={`text-[11px] font-bold ${device.battery < 20 ? 'text-red-600' : 'text-slate-700'}`}>
                        {device.battery}% {device.isCharging && '⚡'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                         <Wifi className={`h-3 w-3 ${device.wifiSignal === 'Weak' ? 'text-amber-500' : 'text-slate-400'}`} />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{device.wifiSignal}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                         <HardDrive className="h-3 w-3 text-slate-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Storage</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{device.storageFree}</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex gap-2 relative">
                {device.status === 'PENDING' ? (
                  <button 
                    onClick={() => handleApprove(device.id)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Approve Device
                  </button>
                ) : terminated ? (
                  <button className="flex-1 py-2.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4" /> Terminated
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setSelectedLogDevice(device)}
                      className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow-sm"
                    >
                      Hardware Logs
                    </button>
                  </>
                )}
                
                {!terminated && (
                  <button 
                    onClick={() => handleRevoke(device.id, device.displayName || getDisplayDeviceName(device))}
                    className="px-3 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-100 transition shadow-sm"
                    title="Revoke Device Access"
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
          })}
        </div>

        <Modal open={Boolean(pendingRevoke)} onClose={() => setPendingRevoke(null)}>
          <ModalHeader title="Security Alert" onClose={() => setPendingRevoke(null)} />
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-50 p-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Revoke device access?</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {pendingRevoke?.name || 'This device'} will be logged out and blocked from future synchronization attempts.
                  An in-app security notification and email alert will be generated after the action succeeds.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setPendingRevoke(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRevoke}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <ShieldAlert className="h-4 w-4" />
                Revoke Device
              </button>
            </div>
          </div>
        </Modal>

        {/* Hardware Logs Drawer */}
        {selectedLogDevice && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLogDevice(null)} />
            <div className="relative w-full max-w-md bg-slate-950 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right-full duration-300">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-slate-400" /> 
                    {selectedLogDevice.displayName || getDisplayDeviceName(selectedLogDevice)} Logs
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">ID: {selectedLogDevice.id}</p>
                </div>
                <button onClick={() => setSelectedLogDevice(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-4 bg-slate-950 text-slate-300">
                <div className="text-blue-400 mb-6">
                  {`[SYSTEM] Connecting to secure telemetry stream...`}
                  <br/>
                  {`[SYSTEM] Connection established for ${selectedLogDevice.displayName || getDisplayDeviceName(selectedLogDevice)}`}
                </div>

                {/* Mock Logs */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-slate-500 shrink-0">10:42:01</span>
                    <span className="text-green-400 shrink-0">[INFO]</span>
                    <span className="break-words">Database sync successful. 42 rows affected.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500 shrink-0">10:15:22</span>
                    <span className="text-amber-400 shrink-0">[WARN]</span>
                    <span className="break-words text-amber-200">WiFi signal dropped below 30%. Potential packet loss detected.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500 shrink-0">09:01:05</span>
                    <span className="text-red-400 shrink-0">[ERROR]</span>
                    <span className="break-words text-red-200">Payment Gateway timeout. Retry 1/3 failed.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500 shrink-0">08:30:00</span>
                    <span className="text-green-400 shrink-0">[INFO]</span>
                    <span className="break-words">System booted up. OS Version: {selectedLogDevice.appVersion}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500 shrink-0">08:29:45</span>
                    <span className="text-indigo-400 shrink-0">[THERMAL]</span>
                    <span className="break-words">CPU temp normal at 42°C.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500 shrink-0">08:29:40</span>
                    <span className="text-blue-400 shrink-0">[AUTH]</span>
                    <span className="break-words">Valid cryptographic token established with HQ.</span>
                  </div>
                </div>

                <div className="animate-pulse text-slate-500 mt-8">
                  _ Waiting for new events...
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
