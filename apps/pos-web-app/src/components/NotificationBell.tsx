'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, AlertTriangle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const [nr, cr] = await Promise.all([
        fetch(`${API_BASE}/notifications`),
        fetch(`${API_BASE}/notifications/unread/count`)
      ]);
      if (nr.ok) {
        const res = await nr.json();
        const d = res.data || res;
        
        // Filter out Sync-specific IT/Admin notifications for the Main Dashboard
        const syncKeywords = ['sync', 'queue', 'conflict', 'device', 'policy', 'record'];
        const fetchedNotifs = (Array.isArray(d) ? d : []).filter((n: any) => {
          const title = (n.title || '').toLowerCase();
          return !syncKeywords.some(keyword => title.includes(keyword));
        });
        
        setNotifications((prev) => {
          if (prev.length > 0) {
            const prevIds = new Set(prev.map(p => p.id));
            const freshlyArrived = fetchedNotifs.filter(n => (!n.is_read && !n.isRead) && !prevIds.has(n.id));
            
            freshlyArrived.forEach(n => {
              toast.custom((t) => (
                <div 
                  onClick={() => { toast.dismiss(t.id); handleNotificationClick(n as any); }}
                  style={{ padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', cursor: 'pointer', maxWidth: '350px' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>🔔 {n.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{n.message}</p>
                  </div>
                </div>
              ), { duration: 6000, position: 'top-right' });
            });
          }
          return fetchedNotifs;
        });
        
        // Calculate unread count based only on the filtered notifications
        const filteredUnreadCount = fetchedNotifs.filter((n: any) => !n.is_read && !n.isRead).length;
        setUnreadCount(filteredUnreadCount);
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
    setShowDropdown(false);
    
    // Smart routing based on notification content/type
    const title = n.title.toLowerCase();
    const msg = n.message.toLowerCase();
    
    if (title.includes('error') || title.includes('failed') || title.includes('අසාර්ථකයි') || n.type === 'ERROR') {
      router.push('/sync/errors');
    } else if (title.includes('conflict') || msg.includes('conflict') || title.includes('ගැටුම්')) {
      router.push('/sync/conflicts');
    } else if (title.includes('storage') || msg.includes('storage') || title.includes('database')) {
      router.push('/sync/devices'); // Redirecting to device manager since storage was removed
    } else if (title.includes('health') || title.includes('offline') || msg.includes('offline') || title.includes('device') || title.includes('update')) {
      router.push('/sync/devices');
    } else if (title.includes('inventory') || title.includes('stock') || title.includes('price')) {
      router.push('/inventory');
    } else if (title.includes('bill') || title.includes('invoice') || title.includes('sale')) {
      router.push('/billing');
    } else {
      router.push('/dashboard'); // Default fallback to main dashboard
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
      toast.success('All cleared');
    } catch {
      toast.error('Failed to clear');
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

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

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
      >
        <Bell size={20} color="#64748b" />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 6, background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid white' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '360px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Notifications</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{unreadCount} unread messages</p>
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

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {sortedNotifs.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <Bell size={28} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>No notifications yet</p>
              </div>
            ) : (
              sortedNotifs.map(n => {
                const cfg = getNotifConfig(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f8fafc',
                      cursor: n.isRead ? 'default' : 'pointer',
                      background: n.isRead ? 'transparent' : cfg.bg,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot, marginTop: '5px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: n.isRead ? 500 : 700, color: '#0f172a', lineHeight: '1.4', flex: 1 }}>
                          {n.title}
                        </p>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{n.message}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
                        {new Date((n.createdAt || n.created_at) as string).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteNotif(n.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '4px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
