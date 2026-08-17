'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, Save, RefreshCw, Building2, DollarSign, 
  Receipt, Globe, Shield, User, LogOut, ChevronDown, 
  Wifi, WifiOff, Bell, Activity, Cpu, ShieldCheck, Mail, Smartphone,
  Database, Zap, Lock, AlertCircle, Image as ImageIcon, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Record<string, any>>({
    storeName: 'Ryzera Super Store',
    legalEntity: 'Ryzera POS Solutions LTD',
    taxId: 'TRN-9988776655',
    email: 'admin@ryzera.com',
    phone: '+94 11 234 5678',
    website: 'https://ryzera.com',
    currency: 'LKR',
    symbol: 'රු',
    language: 'English (US)',
    timezone: 'Asia/Colombo (GMT+5:30)',
    taxName: 'VAT',
    taxPercent: '15.0',
    inclusiveTax: true,
    enableSscl: false,
    realTimeSync: true,
    mediaPersistence: false,
    backgroundRefresh: true,
    deltaCompression: true,
    syncInterval: '30',
    maxRetries: '5',
    failureAlerts: true,
    dailySummary: true,
    pushNotifications: true,
    updateAlerts: true,
    mfa: false,
    auditIntegrity: true,
    autoLogout: true,
    invoiceHeader: 'Welcome to Ryzera',
    invoiceFooter: 'Thank you for shopping with us!',
    logoUrl: ''
  });

  const handleChange = (key: string, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sync/settings`);
      const data = await res.json();
      if (data && data.length > 0) {
        const loadedSettings: any = { ...settings };
        data.forEach((s: any) => {
          if (s.value === 'true') loadedSettings[s.key] = true;
          else if (s.value === 'false') loadedSettings[s.key] = false;
          else loadedSettings[s.key] = s.value;
        });
        setSettings(loadedSettings);
      }
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading('Saving system preferences...');
    try {
      const payload = Object.keys(settings).map(key => ({
        key,
        value: String(settings[key])
      }));

      await fetch(`${API_BASE}/sync/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      toast.dismiss(tid);
      toast.success('System configuration updated');
    } catch (err) {
      toast.dismiss(tid);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const TabBtn = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
        activeTab === id 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]' 
        : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-slate-200 shadow-sm'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  const Input = ({ label, desc, settingKey }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
      <input 
        type="text" 
        placeholder={desc} 
        value={settings[settingKey] || ''}
        onChange={(e) => handleChange(settingKey, e.target.value)}
        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-inner" 
      />
    </div>
  );

  const Switch = ({ label, desc, settingKey, icon: Icon }: any) => {
    const checked = !!settings[settingKey];
    return (
    <div onClick={() => handleChange(settingKey, !checked)} className="flex items-center justify-between p-6 rounded-[24px] border border-slate-100 bg-white hover:border-blue-200 transition-all group shadow-sm cursor-pointer hover:shadow-md">
      <div className="flex items-center gap-4">
        {Icon && <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"><Icon className="h-5 w-5" /></div>}
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-7 rounded-full transition-all relative shadow-inner ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </div>
    </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 px-4">
        <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration</h2>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Manage global preferences, sync behavior, and infrastructure security</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Real-world Branch Override Mockup */}
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
               <Building2 className="h-5 w-5 text-slate-400" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Editing Scope</span>
                  <select className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer appearance-none pr-4">
                     <option>Global (All Branches)</option>
                     <option>Colombo Main Branch</option>
                     <option>Kandy Branch</option>
                  </select>
               </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50">
              {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Apply Changes
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          <TabBtn id="company"  label="Business"     icon={Building2} />
          <TabBtn id="regional" label="Regional"     icon={Globe} />
          <TabBtn id="invoice"  label="Branding"     icon={Receipt} />
          <TabBtn id="sync"     label="Sync Engine"  icon={RefreshCw} />
          <TabBtn id="notify"   label="Alerts"       icon={Bell} />
          <TabBtn id="security" label="Security"     icon={Shield} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 pr-4 pb-20 custom-scrollbar">
          {activeTab === 'company' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <Building2 className="h-6 w-6 text-blue-600" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Corporate Identity</h3>
                </div>
                <Input settingKey="storeName" label="Store Name" desc="Ryzera Super Store Colombo" />
                <Input settingKey="legalEntity" label="Legal Entity Name" desc="Ryzera POS Solutions LTD" />
                <Input settingKey="taxId" label="Tax Registration ID" desc="TRN-9988776655" />
              </div>
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <User className="h-6 w-6 text-blue-600" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Administrative Contact</h3>
                </div>
                <Input settingKey="email" label="Primary Email" desc="admin@ryzera.com" />
                <Input settingKey="phone" label="Support Phone" desc="+94 11 234 5678" />
                <Input settingKey="website" label="Website URL" desc="https://ryzera.com" />
              </div>
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <Globe className="h-6 w-6 text-emerald-600" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Localization</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Input settingKey="currency" label="Base Currency" desc="LKR" />
                  <Input settingKey="symbol" label="Currency Symbol" desc="රු" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">System Language</label>
                  <select 
                    value={settings.language || 'English (US)'}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner cursor-pointer">
                    <option>English (US)</option>
                    <option>Sinhala (සිංහල)</option>
                    <option>Tamil (தமிழ்)</option>
                  </select>
                </div>
                <Input settingKey="timezone" label="Timezone" desc="Asia/Colombo (GMT+5:30)" />
              </div>
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 mb-2">
                   <DollarSign className="h-6 w-6 text-emerald-600" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tax Matrix</h3>
                </div>
                <Input settingKey="taxName" label="Primary Tax Name" desc="VAT" />
                <Input settingKey="taxPercent" label="Tax Percentage (%)" desc="15.0" />
                <Switch settingKey="inclusiveTax" label="Inclusive Tax" desc="Prices already include tax" icon={Receipt} />
                <Switch settingKey="enableSscl" label="Enable SSCL" desc="Apply Social Security Levy" icon={ShieldCheck} />
              </div>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Receipt className="h-6 w-6 text-purple-600" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Invoice & Branding</h3>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Store Logo</label>
                    
                    {settings.logoUrl ? (
                      <div className="relative inline-block group">
                        <img src={settings.logoUrl} alt="Store Logo" className="h-32 object-contain bg-slate-50 border border-slate-200 rounded-xl p-2" />
                        <button 
                          onClick={() => handleChange('logoUrl', '')}
                          className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-[20px] p-8 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors cursor-pointer group">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform mb-3">
                          <ImageIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">Click to upload logo image</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">SVG, PNG, JPG up to 2MB</p>
                      </label>
                    )}
                  </div>

                  <Input settingKey="invoiceHeader" label="Receipt Header Message" desc="Welcome to Ryzera Super Store!" />
                  <Input settingKey="invoiceFooter" label="Receipt Footer Message" desc="Thank you for shopping with us. Come again!" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Zap className="h-6 w-6 text-amber-500" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Synchronization Engine</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Switch settingKey="realTimeSync" label="Real-time Sync" desc="Push instantly when online" icon={Wifi} />
                  <Switch settingKey="mediaPersistence" label="Media Persistence" desc="Includes product images" icon={Database} />
                  <Switch settingKey="backgroundRefresh" label="Background Refresh" desc="Keep UI updated when idle" icon={RefreshCw} />
                  <Switch settingKey="deltaCompression" label="Delta Compression" desc="Optimize data transmission" icon={Cpu} />
                </div>
                <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-50">
                  <Input settingKey="syncInterval" label="Interval (Minutes)" desc="30" />
                  <Input settingKey="maxRetries" label="Max Retries" desc="5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notify' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Bell className="h-6 w-6 text-red-500" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Alert Distribution</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Switch settingKey="failureAlerts" label="Failure Alerts" desc="Immediate sync blocker alerts" icon={AlertCircle} />
                  <Switch settingKey="dailySummary" label="Daily Summary" desc="Email reports every morning" icon={Mail} />
                  <Switch settingKey="pushNotifications" label="Push Notifications" desc="Browser and mobile alerts" icon={Smartphone} />
                  <Switch settingKey="updateAlerts" label="Update Alerts" desc="New software version alerts" icon={RefreshCw} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Lock className="h-6 w-6 text-slate-900" />
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security & Privacy</h3>
                </div>
                <div className="space-y-6">
                  <Switch settingKey="mfa" label="Multi-Factor Auth" desc="Administrative 2FA protection required" icon={Shield} />
                  <Switch settingKey="auditIntegrity" label="Audit Integrity" desc="Cryptographically signed logs" icon={ShieldCheck} />
                  <Switch settingKey="autoLogout" label="Auto-Logout" desc="Logout after 30 mins inactivity" icon={LogOut} />
                </div>
                <div className="mt-10 pt-10 border-t border-slate-50 flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-slate-900 tracking-tight">Session Management</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Kill all active login sessions across all devices instantly</p>
                   </div>
                   <button className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all">Revoke All</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}