'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, Settings, LayoutDashboard, List, AlertCircle, RotateCw, RefreshCw,
  Database, Wifi, WifiOff, CheckCircle2, XCircle, Info, X, Clock, Activity, Cpu, ShieldCheck,
  Globe, Gavel
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface Notification { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string; }

export default function SyncLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const [nr, cr] = await Promise.all([
        fetch(`${API_BASE}/notifications`),
        fetch(`${API_BASE}/notifications/unread/count`)
      ]);
      if (nr.ok) setNotifications(await nr.json());
      if (cr.ok) setUnreadCount(await cr.json());
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    const onOnline = () => { setIsConnected(true); toast.success('Back online'); fetchNotifs(); };
    const onOffline = () => { setIsConnected(false); toast.error('You are offline'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { clearInterval(interval); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const NavBtn = ({ label, icon: Icon, path }: { label: string; icon: any; path: string }) => {
    const isActive = pathname === path;
    return (
      <button onClick={() => router.push(path)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-[14px] ${isActive ? 'bg-[#334155] text-white font-semibold shadow-lg shadow-black/20' : 'text-gray-300 hover:bg-white/5 hover:text-white font-medium'}`}>
        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-80'}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex font-sans text-sm bg-gray-50 text-gray-900">
      {/* ── Sidebar ── */}
      <aside className="w-[270px] flex-shrink-0 bg-[#1C2536] text-white flex flex-col h-screen sticky top-0 z-30">
        <div className="px-6 py-7 border-b border-white/5">
          <h1 className="font-bold text-xl tracking-wide">Ryzera POS</h1>
          <p className="text-xs text-gray-400 mt-1">Sync Management</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-8">
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Analytics & View</p>
            <div className="space-y-1.5">
              <NavBtn label="Dashboard"       icon={LayoutDashboard} path="/sync/dashboard" />
              <NavBtn label="Network Topology" icon={Globe}           path="/sync/topology"  />
              <NavBtn label="Sync Analytics"   icon={Activity}        path="/sync/analytics" />
            </div>
          </div>
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sync Operations</p>
            <div className="space-y-1.5">
              <NavBtn label="Sync Queue"      icon={List}         path="/sync/queue"     />
              <NavBtn label="Sync Errors"     icon={AlertCircle}  path="/sync/errors"    />
              <NavBtn label="Sync Conflicts"  icon={Gavel}        path="/sync/conflicts" />
              <NavBtn label="Broadcast Alert" icon={Bell}         path="/sync/broadcast" />
            </div>
          </div>
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Infrastructure</p>
            <div className="space-y-1.5">
              <NavBtn label="Device Manager"   icon={Cpu}         path="/sync/devices"   />
              <NavBtn label="Storage Manager"  icon={Database}    path="/sync/storage"   />
              <NavBtn label="Policy Manager"   icon={Settings}    path="/sync/rules"     />
            </div>
          </div>
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protection & Security</p>
            <div className="space-y-1.5">
              <NavBtn label="Database Backup"  icon={ShieldCheck} path="/sync/backup"    />
              <NavBtn label="Disaster Recovery" icon={RefreshCw}   path="/sync/recovery"  />
              <NavBtn label="Activity Audit"   icon={ShieldCheck} path="/sync/audit"     />
            </div>
          </div>
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">System</p>
            <div className="space-y-1.5">
              <NavBtn label="Settings"         icon={Settings}    path="/sync/settings"  />
              <NavBtn label="System Health"    icon={Activity}    path="/sync/health"    />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer transition">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-[11px] text-gray-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative">
        {children}
      </div>
    </div>
  );
}
