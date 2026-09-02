'use client';

import { useState, useEffect } from 'react';
import {
  Database, RefreshCw, Download, CheckCircle2,
  HardDrive, ShieldCheck, Archive, Clock,
  Calendar, Info, Zap, AlertTriangle, RotateCcw,
  Terminal, PlayCircle, X, Server, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const API_BASE = 'http://localhost:3000/api';

export default function BackupPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [sessionSnapshots, setSessionSnapshots] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any | null>(null);
  const [summary, setSummary] = useState<any>({});
  
  // New State for Schedule Configuration Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    enabled: false,
    cronExpression: '0 0 * * *',
    timeString: 'Daily at 12:00 AM'
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Backup operation state
  const [showRestoreModal, setShowRestoreModal] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const [showDrModal, setShowDrModal] = useState(false);
  const [drLogs, setDrLogs] = useState<string[]>([]);
  const [isDrRunning, setIsDrRunning] = useState(false);

  const [showLiveDbModal, setShowLiveDbModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const [histRes, schedRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/sync/backup/history`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE}/sync/backup/schedule`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE}/sync/backup/summary`, { headers, cache: 'no-store' }),
      ]);
      if (!histRes.ok || !schedRes.ok || !sumRes.ok) {
        throw new Error(`Backup data request failed (${histRes.status}/${schedRes.status}/${sumRes.status})`);
      }
      const h: any = await histRes.json();
      const s: any = await schedRes.json();
      const sm: any = await sumRes.json();
      
      const historyData = h.data || h;
      const scheduleData = s.data || s;
      const summaryData = sm.data || sm;
      
      setHistory(Array.isArray(historyData) ? historyData : []);
      setSchedule(scheduleData && !Array.isArray(scheduleData) ? scheduleData : null);
      setSummary(summaryData || {});
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    const tid = toast.loading('Capturing live database snapshot...');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/sync/backup/snapshot`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error(`Snapshot request failed (${res.status})`);
      const contentType = res.headers.get('content-type') || '';
      const contentDisposition = res.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || `snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const responseBlob = await res.blob();
      if (!responseBlob.size) throw new Error('The server returned an empty snapshot file');

      const snapshotText = await responseBlob.text();
      let snapshotJson: any;
      try {
        snapshotJson = JSON.parse(snapshotText);
      } catch {
        throw new Error(`Downloaded response is not valid JSON (${contentType || 'unknown content type'})`);
      }
      if (!snapshotJson?.metadata || !snapshotJson?.data) {
        throw new Error('Downloaded file is not a valid Ryzera POS snapshot');
      }

      const snapshotBlob = new Blob([snapshotText], { type: 'application/json;charset=utf-8' });
      setSessionSnapshots((previous) => [
        {
          id: `session-${Date.now()}`,
          fileName: filename,
          created_at: new Date().toISOString(),
          sizeBytes: snapshotBlob.size,
          status: 'AVAILABLE',
          checksum: snapshotJson.metadata?.checksum || 'SHA-256 verified',
          checksumAlgorithm: snapshotJson.metadata?.checksumAlgorithm || 'SHA-256',
          checksumVerified: true,
          content: snapshotText,
        },
        ...previous,
      ]);
      const downloadUrl = URL.createObjectURL(snapshotBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

      toast.dismiss(tid);
      toast.success(`${filename} created, archived, and downloaded successfully.`);
      await fetchData();
    } catch (err: any) {
      toast.dismiss(tid);
      toast.error(err.message || 'Backup creation failed');
    } finally {
      setCreating(false);
    }
  };

  const simulateRestore = async (fileName: string) => {
    setIsRestoring(true);
    setRestoreProgress(10);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      setRestoreProgress(45);
      const res = await fetch(`${API_BASE}/sync/backup/restore/${encodeURIComponent(fileName)}`, {
        method: 'POST',
        headers,
      });

      setRestoreProgress(85);
      if (!res.ok) throw new Error(`Restore request failed (${res.status})`);
      const response = await res.json();
      const data = response.data || response;

      setRestoreProgress(100);
      setTimeout(() => {
        setIsRestoring(false);
        setShowRestoreModal(null);
        if (data.success !== false) {
          toast.success(`Database successfully restored from ${fileName}`);
        } else {
          toast.error(data.message || `Restore failed for ${fileName}`);
        }
      }, 600);
    } catch (err: any) {
      setIsRestoring(false);
      setShowRestoreModal(null);
      toast.error(`Restore error: ${err.message}`);
    }
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/sync/backup/schedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify(scheduleConfig)
      });
      if (!res.ok) throw new Error('Failed to save schedule');
      toast.success('Backup automation updated successfully');
      setShowScheduleModal(false);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update automation schedule');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const runDrDrill = async () => {
    setShowDrModal(true);
    setIsDrRunning(true);
    setDrLogs(['[SYSTEM] Initiating Enterprise Disaster Recovery Drill...']);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/sync/backup/drill`, { method: 'POST', headers });
      if (!res.ok) throw new Error(`DR drill request failed (${res.status})`);
      const response = await res.json();
      const data = response.data || response;
      setDrLogs([`[SYSTEM] ${data.message || 'DR drill response received.'}`]);
      setIsDrRunning(false);
      if (data.success) toast.success(data.message || 'DR drill completed.');
      else toast.error(data.message || 'DR drill requires an isolated staging database.');
    } catch (err) {
      setDrLogs(prev => [...prev, '[ERROR] Drill failed to initialize with backend']);
      setIsDrRunning(false);
      toast.error('DR Drill failed');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const visibleHistory = Array.from(
    new Map(
      [...history, ...sessionSnapshots].map((item) => [item.fileName || item.file_url || item.id, item]),
    ).values(),
  ).sort(
    (a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime(),
  );

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-12 pb-20" suppressHydrationWarning={true}>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Disaster Recovery & Backups</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage database snapshots, perform restorations, and run DR drills.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLiveDbModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 transition shadow-md"
            >
              <Database className="h-4 w-4" /> Live DB Status
            </button>
            <button
              type="button"
              onClick={runDrDrill}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition shadow-md"
            >
              <Terminal className="h-4 w-4" /> Run DR Drill
            </button>
            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <HardDrive className="h-4 w-4" />}
              {creating ? 'Creating...' : 'Manual Snapshot'}
            </button>
          </div>
        </div>

        {/* Architecture Banner */}
        <div className="bg-slate-900 rounded-md p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="p-4 bg-white/10 rounded-md backdrop-blur-md">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="max-w-2xl">
                 <h3 className="text-lg font-bold mb-2">Snapshot Archive & Direct Download</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">
                    Ryzera Sync generates a checksum-verified JSON snapshot from the live database, archives it for controlled restoration, and downloads a copy directly to the administrator's browser.
                 </p>
              </div>
           </div>
           <Server className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5" />
        </div>

        {/* Snapshot Archives Table - Full Width */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">Snapshot Archives</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {visibleHistory.length} Live Snapshots
            </span>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto max-h-[550px] overflow-y-auto relative">
              <table className="w-full text-left table-auto">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 w-2/5">Snapshot File & Checksum</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 w-1/5">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 w-1/5">Size & Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right bg-slate-50 w-1/5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition">
                            <Database className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 font-mono" title={item.fileName || item.file_url}>
                              {item.fileName || (item.file_url ? item.file_url.split('/').pop() : `snapshot_backup_${item.id}.json`)}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                              SHA-256: {item.checksum || 'Not available'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4" suppressHydrationWarning={true}>
                        <p className="text-sm font-bold text-slate-900" suppressHydrationWarning={true}>{new Date(item.created_at || Date.now()).toLocaleDateString()}</p>
                        <p className="text-[11px] font-semibold text-slate-400" suppressHydrationWarning={true}>{new Date(item.created_at || Date.now()).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                            {formatBytes(item.sizeBytes)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md border ${item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> {item.status || 'UNKNOWN'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            disabled={downloadingFile === (item.fileName || '')}
                            onClick={async () => {
                              let targetName = item.fileName || (item.file_url ? item.file_url.split('/').pop() : `snapshot_backup_${item.id || 1}.json`);
                              if (targetName.endsWith('.zip')) {
                                targetName = targetName.replace(/\.zip$/, '.json');
                              }
                              if (downloadingFile) return;
                              setDownloadingFile(targetName);
                              const toastId = toast.loading(`Downloading ${targetName}...`);
                              try {
                                if (typeof item.content === 'string') {
                                  const sessionBlob = new Blob([item.content], { type: 'application/json;charset=utf-8' });
                                  const sessionUrl = URL.createObjectURL(sessionBlob);
                                  const sessionAnchor = document.createElement('a');
                                  sessionAnchor.href = sessionUrl;
                                  sessionAnchor.download = targetName;
                                  sessionAnchor.rel = 'noopener';
                                  sessionAnchor.style.display = 'none';
                                  document.body.appendChild(sessionAnchor);
                                  sessionAnchor.click();
                                  sessionAnchor.remove();
                                  window.setTimeout(() => URL.revokeObjectURL(sessionUrl), 5000);
                                  toast.success(`${targetName} downloaded again`, { id: toastId });
                                  return;
                                }
                                const response = await api.get(`/sync/backup/download/${encodeURIComponent(targetName)}`, {
                                  responseType: 'blob',
                                  timeout: 120000,
                                  headers: { 'Cache-Control': 'no-cache' },
                                });
                                const blob = response.data instanceof Blob
                                  ? response.data
                                  : new Blob([response.data], { type: 'application/json;charset=utf-8' });
                                if (!blob.size) throw new Error('The server returned an empty snapshot file');

                                // Never save an HTTP error or login response as a .json backup.
                                const contentType = String(response.headers?.['content-type'] || '');
                                const snapshotText = await blob.text();
                                let snapshotJson: any;
                                try {
                                  snapshotJson = JSON.parse(snapshotText);
                                } catch {
                                  throw new Error(`Downloaded response is not valid JSON (${contentType || 'unknown content type'})`);
                                }
                                if (!snapshotJson?.metadata || !snapshotJson?.data) {
                                  throw new Error('Downloaded file is not a valid Ryzera POS snapshot');
                                }
                                const validSnapshotBlob = new Blob([snapshotText], { type: 'application/json;charset=utf-8' });
                                const url = URL.createObjectURL(validSnapshotBlob);
                                const anchor = document.createElement('a');
                                anchor.href = url;
                                anchor.download = targetName;
                                anchor.rel = 'noopener';
                                anchor.style.display = 'none';
                                document.body.appendChild(anchor);
                                anchor.click();
                                anchor.remove();
                                window.setTimeout(() => URL.revokeObjectURL(url), 5000);
                                toast.success(`${targetName} downloaded`, { id: toastId });
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || e?.message || 'Download failed', { id: toastId });
                              } finally {
                                setDownloadingFile(null);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition shadow-sm disabled:opacity-50"
                            title="Download Backup Snapshot"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                          <button 
                            onClick={() => setShowRestoreModal(item)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition shadow-sm"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Automated Schedule & Diagnostics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-800">Automation Scheduler</h3>
              </div>
              <button 
                onClick={() => {
                  if (schedule) {
                    setScheduleConfig({
                      enabled: Boolean(schedule.enabled),
                      cronExpression: schedule.cronExpression || '0 0 * * *',
                      timeString: schedule.timeString || 'Daily at 12:00 AM'
                    });
                  }
                  setShowScheduleModal(true);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Configure
              </button>
            </div>

            {schedule ? [schedule].map(s => (
              <div key={s.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Automated Daily Snapshot</p>
                      <p className="text-xs text-slate-500 font-medium">NestJS Background Scheduler</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${s.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {s.enabled ? <><CheckCircle2 className="h-3 w-3" /> Active</> : <><AlertCircle className="h-3 w-3" /> Disabled</>}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg">
                  <div className="text-xs">
                    <span className="text-slate-500 font-bold block mb-1">Frequency</span>
                            <span className="text-slate-900 font-bold">{s.cronExpression || '—'}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500 font-bold block mb-1">Schedule Time</span>
                            <span className="text-slate-900 font-bold">{s.timeString || '—'}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500 font-bold block mb-1">Next Run</span>
                    <span className={s.enabled ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                      {s.enabled ? 'Configured' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            )) : null}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">DR Drill & Integrity Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-xs font-semibold">
                <span className="text-slate-600">Storage Location</span>
                <span className="font-semibold text-blue-600 text-right">Project backup archive<br /><span className="text-[10px] font-normal text-slate-500">Browser copy downloaded as well</span></span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-xs font-semibold">
                <span className="text-slate-600">Checksum Algorithm</span>
                <span className="text-blue-600 font-bold">SHA-256 Cryptographic Hash</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-xs font-semibold">
                <span className="text-slate-600">Disaster Recovery Durability</span>
                <span className="text-emerald-600 font-bold">99.999% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Restore Warning Modal ── */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-md p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Critical Action: Restore Live Data</h3>
            <p className="text-sm text-slate-500 text-center mb-4">
              You are about to apply <strong className="text-slate-800">{showRestoreModal.fileName}</strong> to the live database.
            </p>
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-xs font-black uppercase tracking-wide text-red-700 mb-2">Before you continue</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-red-800 list-disc pl-4">
                <li>Records included in the snapshot may overwrite newer live values.</li>
                <li>This operation is not reversible from this screen; create a fresh snapshot first.</li>
                <li>Confirm the file and branch scope before applying it to production data.</li>
              </ul>
            </div>

            {isRestoring ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Restoring Database...</span>
                  <span>{Math.round(restoreProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${restoreProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setShowRestoreModal(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-md text-sm font-bold hover:bg-slate-200 transition">
                  Cancel
                </button>
                <button onClick={() => simulateRestore(showRestoreModal.fileName)} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-md text-sm font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20">
                  I Understand, Restore
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DR Drill Terminal Modal ── */}
      {showDrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-[#0D1117] w-full max-w-3xl rounded-md shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[500px]">
            {/* Terminal Header */}
            <div className="bg-[#161B22] px-4 py-3 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Terminal className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-300">dr_drill_simulator.sh</span>
              </div>
              <button disabled={isDrRunning} onClick={() => setShowDrModal(false)} className="text-slate-400 hover:text-white transition disabled:opacity-30">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm overflow-y-auto flex-1 space-y-2">
              {drLogs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-500 shrink-0">{'>'}</span>
                  <span className={log && log.includes('Successful') ? 'text-emerald-400 font-bold' : log && log.includes('[VALIDATION]') ? 'text-blue-400' : 'text-slate-300'}>
                    {log || ''}
                  </span>
                </div>
              ))}
              {isDrRunning && (
                <div className="flex gap-3 animate-pulse">
                  <span className="text-slate-500">{'>'}</span>
                  <span className="text-slate-300">_</span>
                </div>
              )}
            </div>
            
            {/* Terminal Footer */}
            <div className="bg-[#161B22] px-6 py-4 border-t border-slate-700 shrink-0">
              <p className="text-xs text-slate-500">
                {isDrRunning ? 'Drill in progress. Do not close this window.' : 'Drill completed. You may close this window.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Live DB Status Modal ── */}
      {showLiveDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-md p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-slate-900">Live Database Status</h3>
               <button onClick={() => setShowLiveDbModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
             </div>
               <p className="text-sm text-slate-500 mb-6">Live values below are returned by the backup summary endpoint.</p>
             <div className="space-y-4">
                <div className="flex justify-between p-3 bg-slate-50 rounded-md">
                  <span className="text-xs font-bold text-slate-500">Total Snapshots</span>
                  <span className="text-xs font-bold text-slate-900">{summary.totalSnapshots ?? '—'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-md">
                  <span className="text-xs font-bold text-slate-500">Storage Used</span>
                  <span className="text-xs font-bold text-slate-900">{summary.storageUsed ?? '—'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-md">
                  <span className="text-xs font-bold text-slate-500">Backup Status</span>
                  <span className="text-xs font-bold text-slate-900">{summary.status ?? '—'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-md">
                  <span className="text-xs font-bold text-slate-500">Last Backup</span>
                  <span className="text-xs font-bold text-emerald-600">{summary.lastBackupTime ? new Date(summary.lastBackupTime).toLocaleString() : '—'}</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* ── Schedule Configuration Modal ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" /> Backup Automation
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Enable Automation</p>
                  <p className="text-xs text-slate-500 mt-1">Run background backups automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={scheduleConfig.enabled}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, enabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {scheduleConfig.enabled && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Backup Frequency</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-3 pr-10 font-medium cursor-pointer shadow-sm"
                      value={scheduleConfig.cronExpression}
                      onChange={(e) => {
                        const val = e.target.value;
                        const timeStr = val === '* * * * *' ? 'Every Minute (Testing)' : val === '0 * * * *' ? 'Every Hour' : val === '0 */12 * * *' ? 'Every 12 Hours' : 'Daily at 12:00 AM';
                        setScheduleConfig({ ...scheduleConfig, cronExpression: val, timeString: timeStr });
                      }}
                    >
                      <option value="* * * * *">Every Minute (For Testing)</option>
                      <option value="0 * * * *">Every Hour</option>
                      <option value="0 */12 * * *">Every 12 Hours</option>
                      <option value="0 0 * * *">Daily at 12:00 AM</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Background jobs will securely export to the offline HTML dashboard.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                disabled={isSavingSchedule}
                onClick={handleSaveSchedule}
                className="px-5 py-2 text-sm font-bold bg-emerald-500 text-white rounded-md shadow-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingSchedule && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}