'use client';

import { useState } from 'react';
import { Building2, DollarSign, Settings as SettingsIcon, Save, Bell, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('business');
  const [saving, setSaving] = useState(false);

  // Business Profile State
  const [businessProfile, setBusinessProfile] = useState({
    storeName: 'Ryzera Super Store',
    address: 'Colombo 05, Sri Lanka',
    phone: '011-2345678',
    email: 'info@ryzera.com',
    taxNumber: 'GST123456',
    businessReg: 'BR789012'
  });

  // Tax & Currency State
  const [taxSettings, setTaxSettings] = useState({
    currency: 'LKR',
    taxRate: 8,
    decimalPlaces: 2,
    taxLabel: 'VAT',
    enableTax: true
  });

  // Sync Settings State
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    maxRetries: 5,
    syncImages: false,
    interval: 30,
    retryDelay: 5,
    notifyOnFailure: true
  });

  const handleSave = (section: string) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`${section} settings saved successfully`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure your POS system preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 bg-white rounded-t-xl px-2">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-5 py-3 flex items-center gap-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'business' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="h-4 w-4" /> Business Profile
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-5 py-3 flex items-center gap-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'tax' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="h-4 w-4" /> Tax & Currency
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-5 py-3 flex items-center gap-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'sync' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SettingsIcon className="h-4 w-4" /> Sync Settings
          </button>
        </div>

        {/* Business Profile Tab */}
        {activeTab === 'business' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Business Profile</h2>
              <button 
                onClick={() => handleSave('Business Profile')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input 
                  type="text" 
                  value={businessProfile.storeName} 
                  onChange={(e) => setBusinessProfile({...businessProfile, storeName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Registration No.</label>
                <input 
                  type="text" 
                  value={businessProfile.businessReg} 
                  onChange={(e) => setBusinessProfile({...businessProfile, businessReg: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  rows={2}
                  value={businessProfile.address} 
                  onChange={(e) => setBusinessProfile({...businessProfile, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={businessProfile.phone} 
                  onChange={(e) => setBusinessProfile({...businessProfile, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={businessProfile.email} 
                  onChange={(e) => setBusinessProfile({...businessProfile, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number (GST/VAT)</label>
                <input 
                  type="text" 
                  value={businessProfile.taxNumber} 
                  onChange={(e) => setBusinessProfile({...businessProfile, taxNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tax & Currency Tab */}
        {activeTab === 'tax' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tax & Currency Settings</h2>
              <button 
                onClick={() => handleSave('Tax & Currency')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select 
                  value={taxSettings.currency} 
                  onChange={(e) => setTaxSettings({...taxSettings, currency: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="LKR">Sri Lankan Rupee (LKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Label</label>
                <input 
                  type="text" 
                  value={taxSettings.taxLabel} 
                  onChange={(e) => setTaxSettings({...taxSettings, taxLabel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="VAT, GST, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={taxSettings.taxRate} 
                  onChange={(e) => setTaxSettings({...taxSettings, taxRate: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
                <select 
                  value={taxSettings.decimalPlaces} 
                  onChange={(e) => setTaxSettings({...taxSettings, decimalPlaces: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">0</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={taxSettings.enableTax} 
                  onChange={(e) => setTaxSettings({...taxSettings, enableTax: e.target.checked})}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Enable Tax Calculation on Sales</span>
              </label>
            </div>
          </div>
        )}

        {/* Sync Settings Tab */}
        {activeTab === 'sync' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Sync Settings</h2>
              <button 
                onClick={() => handleSave('Sync Settings')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Auto-sync when online</p>
                  <p className="text-sm text-gray-500">Automatically sync data when internet connection is restored</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={syncSettings.autoSync} 
                    onChange={(e) => setSyncSettings({...syncSettings, autoSync: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Retry Attempts</label>
                <input 
                  type="number" 
                  value={syncSettings.maxRetries} 
                  onChange={(e) => setSyncSettings({...syncSettings, maxRetries: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">Number of retry attempts before marking as failed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retry Delay (seconds)</label>
                <input 
                  type="number" 
                  value={syncSettings.retryDelay} 
                  onChange={(e) => setSyncSettings({...syncSettings, retryDelay: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Sync product images</p>
                  <p className="text-sm text-gray-500">May increase sync time for large catalogs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={syncSettings.syncImages} 
                    onChange={(e) => setSyncSettings({...syncSettings, syncImages: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto-sync interval (minutes)</label>
                <input 
                  type="number" 
                  value={syncSettings.interval} 
                  onChange={(e) => setSyncSettings({...syncSettings, interval: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Send email notifications on failure</p>
                  <p className="text-sm text-gray-500">Get alerts when sync fails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={syncSettings.notifyOnFailure} 
                    onChange={(e) => setSyncSettings({...syncSettings, notifyOnFailure: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}