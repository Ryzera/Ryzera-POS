'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, LayoutDashboard, List, Database, Activity, Cpu, AlertCircle, ShieldCheck,
  Send, Megaphone, Info, AlertTriangle, RefreshCw, X, Eye, Phone, Monitor, Smartphone, Tablet,
  Zap, Radio, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [sending, setSending] = useState(false);
  const [targetBranch, setTargetBranch] = useState('ALL');
  const [targetRole, setTargetRole] = useState('ALL_STAFF');
  const [previewDevice, setPreviewDevice] = useState<'POS_TERMINAL' | 'TABLET' | 'MOBILE'>('POS_TERMINAL');

  const handleBroadcast = async () => {
    if (!title || !message) return toast.error('Please fill all fields');
    setSending(true);
    const tid = toast.loading('Propagating broadcast to all terminals...');
    try {
      const res = await fetch(`${API_BASE}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type })
      });
      if (res.ok) {
        toast.dismiss(tid);
        toast.success('Broadcast successfully deployed');
        setTitle('');
        setMessage('');
      }
    } catch (err) { toast.dismiss(tid); toast.error('Broadcast failed'); }
  };

  return (
    <div className="w-full px-4 sm:px-8 pb-12 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Internal Broadcast</h2>
            <p className="text-sm text-slate-500 mt-1">Deploy global announcements and system alerts to all connected terminals</p>
          </div>
          <div className="flex items-center gap-3">

          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full">
          {/* Form */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                   <Megaphone className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Compose Dispatch</h3>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Priority</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: 'INFO', label: 'General', color: 'bg-blue-600', icon: Info },
                    { id: 'WARNING', label: 'Warning', color: 'bg-amber-500', icon: AlertTriangle },
                    { id: 'ERROR', label: 'Critical', color: 'bg-red-600', icon: AlertCircle },
                  ].map(t => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                        type === t.id 
                        ? `border-transparent ${t.color} text-white shadow-xl shadow-${t.color.split('-')[1]}-600/20 scale-105` 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <t.icon className="h-5 w-5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Branch</label>
                  <select 
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Connected Branches</option>
                    <option value="HQ">Colombo HQ (Master)</option>
                    <option value="KANDY_01">Kandy Branch 01</option>
                    <option value="GALLE_MAIN">Galle Main Branch</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition cursor-pointer"
                  >
                    <option value="ALL_STAFF">All Terminal Staff</option>
                    <option value="MANAGERS">Managers & Admins Only</option>
                    <option value="CASHIERS">Cashiers Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="System Maintenance Alert"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Message Payload</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  rows={4}
                  placeholder="System wide database synchronization will occur tonight at 02:00 AM..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition resize-none"
                />
              </div>

              <button 
                onClick={handleBroadcast} 
                disabled={sending}
                className="w-full py-4 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Dispatch Global Broadcast
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Eye className="h-4 w-4" /> Live Notification Preview
               </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 sm:p-10 flex items-center justify-center min-h-[500px] h-[calc(100%-40px)]">
                {(title || message) ? (
                  <div className="w-full max-w-xl p-8 rounded-xl bg-white shadow-xl border border-slate-200 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                       <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm ${
                         type === 'ERROR' ? 'bg-red-50 text-red-600' : 
                         type === 'WARNING' ? 'bg-amber-50 text-amber-600' : 
                         'bg-blue-50 text-blue-600'
                       }`}>
                         <Bell className="h-5 w-5" />
                       </div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Alert</p>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 leading-tight break-words">{title || 'Untitled'}</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap break-words">{message || '...'}</p>
                    
                    <button className="mt-8 w-full py-3.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider transition">
                       Acknowledge
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center opacity-50">
                     <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                       <Megaphone className="h-6 w-6 text-slate-400" />
                     </div>
                     <p className="text-sm font-bold text-slate-500">Preview Area</p>
                     <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Start typing to see how your broadcast will appear on branch terminals.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
  );
}