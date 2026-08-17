'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, Settings, LayoutDashboard, List, AlertCircle, RefreshCw,
  Database, Activity, Cpu, ShieldCheck,
  Globe, Gavel, LogOut, Menu, X, ArrowLeft,
  CheckCircle2, XCircle, Info, AlertTriangle, Megaphone,
  User, Shield, ChevronDown, Zap, BarChart3, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { SyncSocketProvider } from './SyncSocketProvider';

const API_BASE = 'http://localhost:3000/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  isRead?: boolean;
  createdAt?: string;
  created_at?: string;
}

const notifTypeConfig: Record<string, { icon: React.ReactNode; dot: string; bg: string; label: string }> = {
  INFO:     { icon: <CheckCircle2 size={12} />, dot: '#10b981', bg: '#f0fdf4', label: 'Info' },
  WARNING:  { icon: <AlertTriangle size={12} />, dot: '#f59e0b', bg: '#fffbeb', label: 'Warning' },
  ERROR:    { icon: <XCircle size={12} />, dot: '#ef4444', bg: '#fef2f2', label: 'Error' },
  CRITICAL: { icon: <AlertCircle size={12} />, dot: '#7c3aed', bg: '#faf5ff', label: 'Critical' },
};

export default function SyncLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Register PWA Service Worker for Background Sync & Offline Caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        // We can request background sync when network is back
        if ('sync' in registration) {
          (registration as any).sync.register('sync-pos-data').catch(console.error);
        }
      }).catch((err) => console.error('SW registration failed:', err));
    }
  }, []);

  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN') || user?.user_type === 'ADMIN';
  const isManager = user?.roles?.includes('MANAGER');
  const isCashier = user?.roles?.includes('CASHIER');
  const hasAccess = isAdmin || isManager || isCashier;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!hasAccess) {
      toast.error('Unauthorized access to Sync Suite.');
      router.push('/dashboard');
      return;
    }

    if (!isAdmin) {
      // Routes strictly restricted to Super Admin only
      const superAdminOnlyRoutes = [
        '/sync/topology',
        '/sync/analytics',
        '/sync/broadcast',
        '/sync/rules',
        '/sync/backup',
        '/sync/audit',
        '/sync/settings'
      ];
      
      const isUserOnSuperAdminRoute = superAdminOnlyRoutes.some(route => pathname.startsWith(route));
      if (isUserOnSuperAdminRoute) {
        toast.error('Access restricted to Super Admin role only.');
        router.push('/sync/dashboard');
      }
    }
  }, [isAuthenticated, hasAccess, isAdmin, pathname, router]);

  const fetchNotifs = async () => {
    try {
      const [nr, cr] = await Promise.all([
        fetch(`${API_BASE}/notifications`),
        fetch(`${API_BASE}/notifications/unread/count`)
      ]);
      if (nr.ok) {
        const res = await nr.json();
        const d = res.data || res;
        setNotifications(Array.isArray(d) ? d : []);
      }
      if (cr.ok) {
        const res = await cr.json();
        const count = res.data !== undefined ? res.data : res;
        setUnreadCount(typeof count === 'number' ? count : 0);
      }
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      await fetchNotifs();
    } catch {}
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markRead(n.id);
    setShowNotifDropdown(false);
    
    const title = n.title.toLowerCase();
    const msg = n.message.toLowerCase();
    
    if (title.includes('error') || title.includes('failed') || title.includes('අසාර්ථකයි') || n.type === 'ERROR') {
      router.push('/sync/errors');
    } else if (title.includes('conflict') || msg.includes('conflict') || title.includes('ගැටුම්')) {
      router.push('/sync/conflicts');
    } else if (title.includes('storage') || msg.includes('storage') || title.includes('database')) {
      router.push('/sync/devices');
    } else if (title.includes('health') || title.includes('offline') || msg.includes('offline') || title.includes('device') || title.includes('update')) {
      router.push('/sync/devices');
    } else if (title.includes('inventory') || title.includes('stock') || title.includes('price')) {
      router.push('/inventory');
    } else if (title.includes('bill') || title.includes('invoice') || title.includes('sale')) {
      router.push('/billing');
    } else {
      router.push('/dashboard');
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read/all`, { method: 'PATCH' });
      await fetchNotifs();
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' });
      await fetchNotifs();
    } catch {}
  };

  const clearAll = async () => {
    try {
      await fetch(`${API_BASE}/notifications`, { method: 'DELETE' });
      await fetchNotifs();
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const handleSeedNotifications = async () => {
    setSeeding(true);
    setShowAdminDropdown(false);
    const tid = toast.loading('Seeding all notification types...');
    try {
      const res = await fetch(`${API_BASE}/notifications/seed`, { method: 'POST' });
      const data = await res.json();
      toast.dismiss(tid);
      toast.success(`✅ ${data.count || 18} notifications generated!`);
      await fetchNotifs();
      setShowNotifDropdown(true);
    } catch {
      toast.dismiss(tid);
      toast.error('Failed to seed notifications');
    }
    setSeeding(false);
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

  // Click-outside handler for both dropdowns
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target as Node)) {
        setShowAdminDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  if (!isAuthenticated || !hasAccess) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navGroups = [
    {
      title: 'Analytics & View',
      show: true,
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/sync/dashboard', show: true },
        { label: 'Network Topology', icon: Globe, path: '/sync/topology', show: isAdmin },
        { label: 'Sync Analytics', icon: Activity, path: '/sync/analytics', show: isAdmin },
      ]
    },
    {
      title: 'Sync Operations',
      show: true,
      items: [
        { label: 'Sync Queue', icon: List, path: '/sync/queue', show: true },
        { label: 'Sync Errors', icon: AlertCircle, path: '/sync/errors', show: isAdmin || isManager },
        { label: 'Sync Conflicts', icon: Gavel, path: '/sync/conflicts', show: isAdmin || isManager },
        { label: 'Broadcast Alert', icon: Bell, path: '/sync/broadcast', show: isAdmin },
      ]
    },
    {
      title: 'Infrastructure',
      show: true,
      items: [
        { label: 'Device Manager', icon: Cpu, path: '/sync/devices', show: isAdmin || isManager },
        { label: 'Policy Manager', icon: Settings, path: '/sync/rules', show: isAdmin },
      ]
    },
    {
      title: 'Protection & Security',
      show: isAdmin,
      items: [
        { label: 'Database Backup', icon: ShieldCheck, path: '/sync/backup', show: isAdmin },
        { label: 'Activity Audit', icon: ShieldCheck, path: '/sync/audit', show: isAdmin },
      ]
    },
    {
      title: 'System',
      show: true,
      items: [
        { label: 'Settings', icon: Settings, path: '/sync/settings', show: isAdmin },
        { label: 'System Health', icon: Activity, path: '/sync/health', show: isAdmin || isManager },
      ]
    }
  ];

  const currentLabel = navGroups.flatMap(g => g.items).find(i => i.path === pathname)?.label || 'Sync Dashboard';

  // Normalize is_read field from backend
  const normalizedNotifs = notifications.map(n => ({
    ...n,
    isRead: n.is_read ?? n.isRead ?? false,
  }));

  const getNotifConfig = (type: string) => notifTypeConfig[type] || notifTypeConfig['INFO'];

  const typeOrder: Record<string, number> = { CRITICAL: 0, ERROR: 1, WARNING: 2, INFO: 3 };
  const sortedNotifs = [...normalizedNotifs].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return (typeOrder[a.type] ?? 4) - (typeOrder[b.type] ?? 4);
  });

  if (!isClient) return null;

  return (
    <SyncSocketProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }} suppressHydrationWarning={true}>

      {/* ── Sidebar ── */}
      <div style={{
        width: sidebarOpen ? '240px' : '64px',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ width: '2rem', height: '2rem', background: '#2563eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RefreshCw size={14} color="white" />
          </div>
          {sidebarOpen && <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Sync Suite</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Back to POS */}
        <div style={{ padding: '0.75rem 0.5rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s' }}>
            <ArrowLeft size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Back to POS'}
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 0.5rem', overflowY: 'auto' }}>
          {navGroups.filter(g => g.show).map((group, gIdx) => {
            const visibleItems = group.items.filter(i => i.show);
            if (visibleItems.length === 0) return null;
            return (
              <div key={gIdx} style={{ marginBottom: '1rem' }}>
                {sidebarOpen && (
                  <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {group.title}
                  </p>
                )}
                {visibleItems.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <Link key={item.path} href={item.path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.25rem', textDecoration: 'none', background: active ? '#2563eb' : 'transparent', color: active ? 'white' : '#94a3b8', fontSize: '0.875rem', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                      <item.icon size={18} style={{ flexShrink: 0 }} />
                      {sidebarOpen && item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #1e293b' }}>
          {sidebarOpen && (
            <div style={{ padding: '0.625rem 0.75rem', marginBottom: '0.5rem', background: '#1e293b', borderRadius: '0.5rem' }}>
              <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{user?.info?.first_name} {user?.info?.last_name}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{user?.roles?.[0] || user?.user_type}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem' }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>

        {/* Top Bar */}
        <div style={{ background: 'white', padding: '0.875rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{currentLabel}</h1>
            {!isConnected && (
              <span style={{ padding: '0.2rem 0.5rem', background: '#fef2f2', color: '#ef4444', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid #fecaca', letterSpacing: '0.05em' }}>
                OFFLINE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>

            {/* ── Notification Bell ── */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                id="notif-bell-btn"
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowAdminDropdown(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', position: 'relative', borderRadius: '10px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <Bell size={20} color="#64748b" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: 'bold', minWidth: '16px', height: '16px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translate(25%, -25%)' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '360px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15), 0 8px 20px -6px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>

                  {/* Header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span style={{ background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px' }}>{unreadCount} new</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Type Legend */}
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(notifTypeConfig).map(([type, cfg]) => (
                      <span key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                        {cfg.label}
                      </span>
                    ))}
                  </div>

                  {/* Notifications List */}
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {sortedNotifs.length === 0 ? (
                      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                        <Bell size={28} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>No notifications yet</p>
                        <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Click "Seed" in the Admin panel to generate samples</p>
                      </div>
                    ) : (
                      sortedNotifs.map(n => {
                        const cfg = getNotifConfig(n.type);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '10px 16px',
                              borderBottom: '1px solid #f8fafc',
                              cursor: n.isRead ? 'default' : 'pointer',
                              background: n.isRead ? 'transparent' : cfg.bg,
                              transition: 'background 0.15s',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              position: 'relative',
                            }}
                            onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.filter = 'brightness(0.97)'; }}
                            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                          >
                            {/* Type dot */}
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot, marginTop: '5px', flexShrink: 0 }} />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: n.isRead ? 500 : 700, color: '#0f172a', lineHeight: '1.4', flex: 1 }}>
                                  {n.title}
                                </p>
                                <span style={{ fontSize: '8px', fontWeight: 700, color: cfg.dot, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '1px 5px', borderRadius: '4px', background: cfg.bg, border: `1px solid ${cfg.dot}30`, flexShrink: 0 }}>
                                  {n.type}
                                </span>
                              </div>
                              <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4', wordBreak: 'break-word' }}>{n.message}</p>
                              <p style={{ margin: 0, fontSize: '9px', color: '#94a3b8', fontWeight: 500 }}>
                                {new Date((n.createdAt || n.created_at) as string).toLocaleString()}
                              </p>
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={(e) => deleteNotif(n.id, e)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.6, transition: 'opacity 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => { setShowNotifDropdown(false); router.push('/sync/broadcast'); }}
                      style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Send Broadcast →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Admin / Role Dropdown ── */}
            <div style={{ position: 'relative' }} ref={adminDropdownRef}>
              <button
                id="admin-panel-btn"
                onClick={() => { setShowAdminDropdown(!showAdminDropdown); setShowNotifDropdown(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px',
                  background: isAdmin ? '#eff6ff' : '#f0fdf4',
                  border: `1px solid ${isAdmin ? '#bfdbfe' : '#bbf7d0'}`,
                  borderRadius: '10px', cursor: 'pointer',
                  color: isAdmin ? '#2563eb' : '#16a34a',
                  fontSize: '12px', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.95)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                {isAdmin ? <Shield size={14} /> : <User size={14} />}
                {user?.roles?.[0] || user?.user_type}
                <ChevronDown size={12} style={{ transition: 'transform 0.15s', transform: showAdminDropdown ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Admin Dropdown */}
              {showAdminDropdown && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '240px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>

                  {/* User info */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{user?.info?.first_name} {user?.info?.last_name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>{user?.info?.email || 'Admin User'}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: '#eff6ff', color: '#2563eb', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Shield size={9} />{user?.roles?.[0] || user?.user_type}
                    </span>
                  </div>

                  {/* Admin Actions */}
                  <div style={{ padding: '8px' }}>
                    <p style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Admin Actions</p>

                    {isAdmin && (
                      <>
                        <button
                          id="seed-notifications-btn"
                          onClick={handleSeedNotifications}
                          disabled={seeding}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#0f172a', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Bell size={14} color="#2563eb" />
                          {seeding ? 'Seeding notifications...' : 'Seed All Notification Types'}
                        </button>

                        <button
                          id="go-broadcast-btn"
                          onClick={() => { setShowAdminDropdown(false); router.push('/sync/broadcast'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#0f172a', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Megaphone size={14} color="#f59e0b" />
                          Send Broadcast Message
                        </button>

                        <button
                          id="go-devices-btn"
                          onClick={() => { setShowAdminDropdown(false); router.push('/sync/devices'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#0f172a', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Cpu size={14} color="#7c3aed" />
                          Manage Devices
                        </button>

                        <button
                          id="go-health-btn"
                          onClick={() => { setShowAdminDropdown(false); router.push('/sync/health'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#10b981', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Activity size={14} color="#10b981" />
                          System Health
                        </button>

                        <button
                          id="go-backup-btn"
                          onClick={() => { setShowAdminDropdown(false); router.push('/sync/backup'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#0f172a', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Database size={14} color="#0284c7" />
                          Database Backup
                        </button>

                        <button
                          id="clear-all-notifs-btn"
                          onClick={() => { setShowAdminDropdown(false); clearAll(); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#ef4444', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Trash2 size={14} />
                          Clear All Notifications
                        </button>
                      </>
                    )}

                    <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

                    <button
                      id="go-settings-btn"
                      onClick={() => { setShowAdminDropdown(false); router.push('/sync/settings'); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#0f172a', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <Settings size={14} color="#64748b" />
                      Sync Settings
                    </button>

                    <button
                      id="topbar-logout-btn"
                      onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#ef4444', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
      </div>
    </SyncSocketProvider>
  );
}
