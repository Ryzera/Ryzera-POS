'use client';

import { useState, useEffect } from 'react';
import { 
  Smartphone, Laptop, Tablet, Monitor, ShieldCheck, ShieldAlert, 
  RefreshCw, Search, Plus, MoreVertical, MapPin, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/devices`);
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : []);
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

  const getDeviceIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'MOBILE': return <Smartphone className="h-5 w-5" />;
      case 'TABLET': return <Tablet className="h-5 w-5" />;
      case 'LAPTOP': return <Laptop className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const filteredDevices = devices.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.branchId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Device Management</h1>
          <p className="text-sm text-slate-500 mt-1">Authorize and monitor POS terminals across all branches</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchDevices} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="p-8 space-y-6 overflow-y-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Terminals</p>
            <p className="text-3xl font-bold text-slate-900">{devices.length}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Active Now</p>
            <p className="text-3xl font-bold text-blue-600">{devices.filter(d => d.status === 'APPROVED').length}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-amber-400">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Awaiting Approval</p>
            <p className="text-3xl font-bold text-amber-600">{devices.filter(d => d.status === 'PENDING').length}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm border-l-4 border-l-red-400">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Blocked / Deactivated</p>
            <p className="text-3xl font-bold text-red-600">{devices.filter(d => d.status === 'DEACTIVATED').length}</p>
          </div>
        </div>

        {/* Search & Filters */}
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
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div key={device.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    device.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      device.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {device.status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">v4.2.1 Stable</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 truncate">{device.name || 'Unnamed Device'}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3 w-3" /> Branch: {device.branchId || 'Global'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Last Seen</p>
                        <p className="text-[11px] font-medium text-slate-700 leading-none">
                          {new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Sync Load</p>
                        <p className="text-[11px] font-medium text-slate-700 leading-none">Healthy (0.4ms)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex gap-2">
                {device.status === 'PENDING' ? (
                  <button 
                    onClick={() => handleApprove(device.id)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Approve Device
                  </button>
                ) : (
                  <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition">
                    View Hardware Logs
                  </button>
                )}
                <button className="px-3 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-100 transition">
                  <ShieldAlert className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
