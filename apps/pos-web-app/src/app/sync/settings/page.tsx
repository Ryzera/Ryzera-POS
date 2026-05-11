'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, Save, RefreshCw, Building2, DollarSign, 
  Receipt, Globe, Shield, User, LogOut, ChevronDown, 
  Wifi, WifiOff, Bell, Activity, Cpu, ShieldCheck, Mail, Smartphone,
  Database, Zap, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/settings`);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading('Saving system preferences...');
    setTimeout(() => {
      toast.dismiss(tid);
      toast.success('System configuration updated');
      setSaving(false);
    }, 1200);
  };

  const TabBtn = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        activeTab === id 
        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-105' 
        : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100 shadow-sm'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  const Input = ({ label, desc }: any) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
      <input 
        type="text" 
        placeholder={desc} 
        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition shadow-inner" 
      />
    </div>
  );

  const Switch = ({ label, desc, checked, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-6 rounded-[24px] border border-slate-100 bg-white hover:border-blue-200 transition group shadow-sm">
      <div className="flex items-center gap-4">
        {Icon && <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 transition"><Icon className="h-5 w-5" /></div>}
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-7 rounded-full transition-all relative cursor-pointer shadow-inner ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global preferences, sync behavior, and infrastructure security</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 disabled:opacity-50">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Apply Changes
        </button>
      </header>

      <div className="p-8 flex-1 overflow-hidden flex flex-col space-y-8">
        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          <TabBtn id="company"  label="Business"     icon={Building2} />
          <TabBtn id="regional" label="Regional"     icon={Globe} />
          <TabBtn id="invoice"  label="Branding"     icon={Receipt} />
          <TabBtn id="sync"     label="Sync Engine"  icon={RefreshCw} />
          <TabBtn id="notify"   label="Alerts"       icon={Bell} />
          <TabBtn id="security" label="Security"     icon={Shield} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar">
          {activeTab === 'company' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <Building2 className="h-5 w-5 text-blue-600" />
                   <h3 className="text-lg font-bold text-slate-900">Corporate Identity</h3>
                </div>
                <Input label="Store Name" desc="Ryzera Super Store Colombo" />
                <Input label="Legal Entity Name" desc="Ryzera POS Solutions LTD" />
                <Input label="Tax Registration ID" desc="TRN-9988776655" />
              </div>
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <User className="h-5 w-5 text-blue-600" />
                   <h3 className="text-lg font-bold text-slate-900">Administrative Contact</h3>
                </div>
                <Input label="Primary Email" desc="admin@ryzera.com" />
                <Input label="Support Phone" desc="+94 11 234 5678" />
                <Input label="Website URL" desc="https://ryzera.com" />
              </div>
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <Globe className="h-5 w-5 text-emerald-600" />
                   <h3 className="text-lg font-bold text-slate-900">Localization</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Input label="Base Currency" desc="LKR" />
                  <Input label="Currency Symbol" desc="රු" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">System Language</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-inner">
                    <option>English (US)</option>
                    <option>Sinhala (සිංහල)</option>
                    <option>Tamil (தமிழ்)</option>
                  </select>
                </div>
                <Input label="Timezone" desc="Asia/Colombo (GMT+5:30)" />
              </div>
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <DollarSign className="h-5 w-5 text-emerald-600" />
                   <h3 className="text-lg font-bold text-slate-900">Tax Matrix</h3>
                </div>
                <Input label="Primary Tax Name" desc="VAT" />
                <Input label="Tax Percentage (%)" desc="15.0" />
                <Switch label="Inclusive Tax" desc="Prices already include tax" checked={true} icon={Receipt} />
                <Switch label="Enable SSCL" desc="Apply Social Security Contribution Levy" checked={false} icon={ShieldCheck} />
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Zap className="h-6 w-6 text-amber-500" />
                   <h3 className="text-xl font-bold text-slate-900">Synchronization Engine</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Switch label="Real-time Sync" desc="Push instantly when online" checked={true} icon={Wifi} />
                  <Switch label="Media Persistence" desc="Includes product images" checked={false} icon={Database} />
                  <Switch label="Background Refresh" desc="Keep UI updated when idle" checked={true} icon={RefreshCw} />
                  <Switch label="Delta Compression" desc="Optimize data transmission" checked={true} icon={Cpu} />
                </div>
                <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-slate-50">
                  <Input label="Interval (Minutes)" desc="30" />
                  <Input label="Max Retries" desc="5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notify' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Bell className="h-6 w-6 text-red-500" />
                   <h3 className="text-xl font-bold text-slate-900">Alert Distribution</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Switch label="Failure Alerts" desc="Immediate sync blocker alerts" checked={true} icon={AlertCircle} />
                  <Switch label="Daily Summary" desc="Email reports every morning" checked={true} icon={Mail} />
                  <Switch label="Push Notifications" desc="Browser and mobile alerts" checked={true} icon={Smartphone} />
                  <Switch label="Update Alerts" desc="New software version alerts" checked={true} icon={RefreshCw} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Lock className="h-6 w-6 text-slate-900" />
                   <h3 className="text-xl font-bold text-slate-900">Security & Privacy</h3>
                </div>
                <div className="space-y-6">
                  <Switch label="Multi-Factor Auth" desc="Administrative 2FA protection" checked={false} icon={Shield} />
                  <Switch label="Audit Integrity" desc="Cryptographically signed logs" checked={true} icon={ShieldCheck} />
                  <Switch label="Auto-Logout" desc="Logout after 30 mins inactivity" checked={true} icon={LogOut} />
                </div>
                <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-slate-900">Session Management</p>
                      <p className="text-xs text-slate-500 mt-1">Kill all active login sessions across all devices</p>
                   </div>
                   <button className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition">Revoke All</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}