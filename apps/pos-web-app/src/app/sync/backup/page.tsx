'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Database, RefreshCw, Download, Search, CheckCircle2,
  Eye, X, Plus, Clock, Calendar, Trash2, HardDrive,
  History, ShieldCheck, ArrowRight, Save, ShieldAlert,
  Archive, Cloud
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function BackupPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ frequency: 'DAILY', time: '02:00', branchId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [histRes, schedRes] = await Promise.all([
        fetch(`${API_BASE}/backup/history`),
        fetch(`${API_BASE}/sync/backup/schedule`)
      ]);
      setHistory(await histRes.json());
      setSchedules(await schedRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    const tid = toast.loading('Capturing database snapshot...');
    try {
      await fetch(`${API_BASE}/backup`, { method: 'POST' });
      toast.dismiss(tid);
      toast.success('Snapshot captured successfully');
      fetchData();
    } catch (err) { toast.dismiss(tid); toast.error('Backup failed'); }
    finally { setCreating(false); }
  };

  const handleCreateSchedule = async () => {
    try {
      await fetch(`${API_BASE}/sync/backup/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
      toast.success('Backup protocol scheduled');
      setShowScheduleModal(false);
      fetchData();
    } catch (err) { toast.error('Failed to schedule'); }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await fetch(`${API_BASE}/sync/backup/schedule/${id}`, { method: 'DELETE' });
      toast.success('Protocol removed');
      fetchData();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleRestore = async (fileName: string) => {
    if (!confirm(`CAUTION: Restoring ${fileName} will overwrite current data. A rollback point will be created automatically. Continue?`)) return;
    
    const tid = toast.loading('Reverting system state...');
    try {
      await fetch(`${API_BASE}/backup/restore/${fileName}`, { method: 'POST' });
      toast.dismiss(tid);
      toast.success('System state reverted');
      fetchData();
    } catch (err) { toast.dismiss(tid); toast.error('Restoration failed'); }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database Backup</h1>
          <p className="text-sm text-slate-500 mt-1">Configure automated snapshots and multi-regional data redundancy</p>
        </div>
        <button onClick={handleCreateBackup} disabled={creating}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 disabled:opacity-50">
          {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <HardDrive className="h-4 w-4" />}
          {creating ? 'Processing...' : 'Manual Snapshot'}
        </button>
      </header>

      <div className="p-8 flex-1 overflow-y-auto space-y-10 custom-scrollbar">
        {/* Protocol Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-900 rounded-xl text-white">
                  <Calendar className="h-5 w-5" />
               </div>
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Execution Protocols</h3>
            </div>
            <button onClick={() => setShowScheduleModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-2">
              <Plus className="h-3 w-3" /> New Protocol
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.length === 0 ? (
              <div className="col-span-full py-16 bg-white border border-dashed border-slate-200 rounded-[32px] text-center text-slate-400">
                 <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                 <p className="text-sm font-bold">No active backup protocols</p>
                 <p className="text-xs mt-1">Add a schedule to automate your data safety.</p>
              </div>
            ) : schedules.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative group hover:shadow-md transition">
                <button onClick={() => handleDeleteSchedule(s.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Cloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{s.frequency}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">{s.time} UTC EXECUTION</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100/50">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target: Cloud HQ</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-900 rounded-xl text-white">
                <Archive className="h-5 w-5" />
             </div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Snapshot Archives</h3>
          </div>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Archive Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creation Timestamp</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Redundancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition">
                           <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{item.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Size: 42.5 MB</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-xs font-bold text-slate-900">{new Date(item.createdAt).toLocaleTimeString()}</p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100/50">
                        <ShieldCheck className="h-3 w-3" /> VERIFIED
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleRestore(item.fileName)} className="p-2.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition" title="Restore Snapshot">
                            <RefreshCw className="h-5 w-5" />
                          </button>
                          <button className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Offload Archive">
                            <Download className="h-5 w-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-2xl font-bold text-slate-900">Backup Protocol</h3>
              <p className="text-sm text-slate-500 mt-1 uppercase font-black tracking-widest">Automate infrastructure safety</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Frequency</label>
                <select value={newSchedule.frequency} onChange={e => setNewSchedule({...newSchedule, frequency: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[20px] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition">
                  <option value="HOURLY">Hourly Protocol</option>
                  <option value="DAILY">Daily Protocol</option>
                  <option value="WEEKLY">Weekly Protocol</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Execution Time (UTC)</label>
                <input type="time" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-[20px] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition" />
              </div>
            </div>
            <div className="p-10 bg-white border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowScheduleModal(false)} className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition">Cancel</button>
              <button onClick={handleCreateSchedule} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">Init Protocol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}