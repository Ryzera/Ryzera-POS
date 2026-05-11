'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, LayoutDashboard, List, Database, Activity, Cpu, AlertCircle, ShieldCheck,
  Send, Megaphone, Info, AlertTriangle, RefreshCw, X, Eye, Phone, Monitor, Smartphone,
  Zap, Radio, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [sending, setSending] = useState(false);

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
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Broadcast</h1>
          <p className="text-sm text-slate-500 mt-1">Deploy global announcements and system alerts to all connected terminals</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-sm">
             <Radio className="h-4 w-4 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">Broadcast Channel Active</span>
           </div>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Form */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                   <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Compose Dispatch</h3>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Priority</label>
                <div className="flex gap-3">
                  {[
                    { id: 'INFO', label: 'General', color: 'bg-blue-600', icon: Info },
                    { id: 'WARNING', label: 'Warning', color: 'bg-amber-500', icon: AlertTriangle },
                    { id: 'ERROR', label: 'Critical', color: 'bg-red-600', icon: AlertCircle },
                  ].map(t => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        type === t.id 
                        ? `border-transparent ${t.color} text-white shadow-xl shadow-${t.color.split('-')[1]}-600/20 scale-105` 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. System Maintenance Window" 
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-inner" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Broadcast Content</label>
                <textarea 
                  rows={5} 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Provide comprehensive details about the announcement..." 
                  className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition resize-none shadow-inner leading-relaxed" 
                />
              </div>

              <button 
                onClick={handleBroadcast} 
                disabled={sending}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-2xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50"
              >
                {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 rotate-12" />}
                {sending ? 'Deploying Protocol...' : 'Execute Broadcast'}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Eye className="h-4 w-4" /> Real-time Terminal Preview
               </h3>
               <div className="flex gap-4 text-slate-300">
                  <Monitor className="h-5 w-5 hover:text-slate-900 cursor-pointer transition" />
                  <Smartphone className="h-5 w-5 text-slate-900 cursor-pointer transition" />
               </div>
            </div>

            <div className="relative mx-auto w-full max-w-[340px] h-[640px] bg-slate-900 rounded-[56px] border-[12px] border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] p-8 overflow-hidden">
              {/* Device Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-[24px]" />
              
              {/* Simulated Terminal UI */}
              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <span>9:41 AM</span>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <div className="h-1.5 w-6 rounded-full bg-slate-700" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-5 w-28 bg-slate-800 rounded-lg" />
                  <div className="h-2.5 w-full bg-slate-800 rounded-full" />
                  <div className="h-2.5 w-2/3 bg-slate-800 rounded-full opacity-50" />
                </div>

                {/* Real Notification Preview */}
                {(title || message) && (
                  <div className="mt-10 p-6 rounded-[32px] bg-white shadow-2xl animate-in fade-in slide-in-from-top-6 duration-500 ring-4 ring-slate-800/10">
                    <div className="flex items-center gap-3 mb-4">
                       <div className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-sm ${
                         type === 'ERROR' ? 'bg-red-50 text-red-600' : 
                         type === 'WARNING' ? 'bg-amber-50 text-amber-600' : 
                         'bg-blue-50 text-blue-600'
                       }`}>
                         <Bell className="h-4 w-4" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ryzera Protocol</p>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-2 leading-tight">{title || 'Preview Heading'}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{message || 'Your message will appear here precisely as it will be displayed on all branch terminals.'}</p>
                    
                    <button className="mt-4 w-full py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">Dismiss</button>
                  </div>
                )}

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="h-20 bg-slate-800/20 rounded-3xl" />
                  <div className="h-20 bg-slate-800/20 rounded-3xl" />
                  <div className="h-20 bg-slate-800/20 rounded-3xl" />
                  <div className="h-20 bg-slate-800/20 rounded-3xl" />
                </div>
              </div>
              
              {/* Home Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}