
'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle, Package, Check, X, Database, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

// Mock data - Replace with actual API calls later
const mockSyncStatus = {
  pending: 12,
  synced: 245,
  failed: 3,
  total: 260
};

const mockQueueData = [
  { id: 1, item: 'Wireless Mouse', quantity: 5, status: 'synced' },
  { id: 2, item: 'Headphone', quantity: 2, status: 'pending' },
  { id: 3, item: 'Sugar', quantity: 10, status: 'failed' },
  { id: 4, item: 'Phone Cover', quantity: 3, status: 'pending' },
];

const mockActivityData = [
  { time: '10:45 AM', action: 'Sales synced', count: 45, status: 'success' },
  { time: '10:30 AM', action: 'Products updated', count: 12, status: 'success' },
  { time: '10:15 AM', action: 'Sync failed', count: 1, status: 'failed' },
  { time: '09:00 AM', action: 'Auto-sync completed', count: 78, status: 'success' },
];

const chartData = [
  { name: 'Mon', sync: 45, pending: 5 },
  { name: 'Tue', sync: 52, pending: 3 },
  { name: 'Wed', sync: 48, pending: 7 },
  { name: 'Thu', sync: 61, pending: 4 },
  { name: 'Fri', sync: 55, pending: 6 },
  { name: 'Sat', sync: 42, pending: 2 },
  { name: 'Sun', sync: 38, pending: 8 },
];

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const [syncStatus, setSyncStatus] = useState(mockSyncStatus);
  const [queueData, setQueueData] = useState(mockQueueData);
  const [activityData, setActivityData] = useState(mockActivityData);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Dashboard refreshed');
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Synced</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Failed</span>;
      default:
        return null;
    }
  };

  const pieData = [
    { name: 'Synced', value: syncStatus.synced, color: '#10B981' },
    { name: 'Pending', value: syncStatus.pending, color: '#F59E0B' },
    { name: 'Failed', value: syncStatus.failed, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sync Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your offline sync status and queue</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Connection Status */}
        <div className={`rounded-xl p-6 shadow-sm ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 text-lg">ONLINE - Connected to Server</p>
                  <p className="text-sm text-green-600">Real-time sync is active</p>
                  <p className="text-xs text-green-500 mt-1">Last sync: Today {new Date().toLocaleTimeString()}</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <WifiOff className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-700 text-lg">OFFLINE - Working Locally</p>
                  <p className="text-sm text-red-600">Data will sync when connection resumes</p>
                  <p className="text-xs text-red-500 mt-1">Sales are being stored locally</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Sync</p>
                <p className="text-3xl font-bold text-yellow-600">{syncStatus.pending}</p>
                <p className="text-xs text-gray-400 mt-1">Waiting to sync</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Synced</p>
                <p className="text-3xl font-bold text-green-600">{syncStatus.synced}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully synced</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-3xl font-bold text-red-600">{syncStatus.failed}</p>
                <p className="text-xs text-gray-400 mt-1">Need attention</p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-3xl font-bold text-gray-700">{syncStatus.total}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sync Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sync" stroke="#10B981" strokeWidth={2} name="Synced" />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sync Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sync Queue Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Sync Queue</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queueData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">{item.item}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {activityData.map((activity, idx) => (
              <div key={idx} className="px-6 py-3 flex items-center gap-3 text-sm hover:bg-gray-50">
                {activity.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-gray-500">{activity.time}</span>
                <span className="text-gray-700">{activity.action}</span>
                <span className="text-gray-500">({activity.count} items)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}