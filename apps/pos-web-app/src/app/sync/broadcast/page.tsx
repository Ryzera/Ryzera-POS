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

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="ALL_STAFF">All Terminal Staff</option>
                    <option value="MANAGERS">Managers & Admins Only</option>
                    <option value="CASHIERS">Cashiers Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. System Maintenance Window" 
                  className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-inner" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Broadcast Content</label>
                <textarea 
                  rows={6} 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Provide comprehensive details about the announcement..." 
                  className="w-full px-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl text-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition resize-none shadow-inner leading-relaxed" 
                />
              </div>

              <button 
                onClick={handleBroadcast} 
                disabled={sending}
                className="w-full py-6 bg-slate-900 text-white rounded-[24px] text-base font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-2xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50"
              >
                {sending ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 rotate-12" />}
                {sending ? 'Deploying Protocol...' : 'Execute Broadcast'}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 h-full">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Eye className="h-5 w-5" /> Live Notification Preview
               </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[40px] p-6 sm:p-12 flex items-center justify-center min-h-[600px] h-[calc(100%-40px)]">
                {(title || message) ? (
                  <div className="w-full max-w-xl p-10 rounded-3xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4 mb-8">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${
                         type === 'ERROR' ? 'bg-red-50 text-red-600' : 
                         type === 'WARNING' ? 'bg-amber-50 text-amber-600' : 
                         'bg-blue-50 text-blue-600'
                       }`}>
                         <Bell className="h-6 w-6" />
                       </div>
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest">System Alert</p>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-4 leading-tight break-words">{title || 'Untitled'}</h4>
                    <p className="text-base text-slate-600 font-medium leading-relaxed whitespace-pre-wrap break-words">{message || '...'}</p>
                    
                    <button className="mt-10 w-full py-5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-black text-slate-500 uppercase tracking-widest transition">
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