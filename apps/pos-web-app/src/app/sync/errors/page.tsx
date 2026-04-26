'use client';

import { useState } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  XCircle, 
  RotateCw, 
  Download, 
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data - Replace with actual API calls
const mockFailedRecords = [
  {
    id: '1',
    orderId: 'INV-001',
    entity: 'Order #INV-001',
    product: 'Wireless Mouse',
    quantity: 5,
    error: 'Product SKU invalid',
    attempts: 3,
    maxAttempts: 5,
    createdAt: '2024-03-20T10:30:15Z',
    status: 'failed',
    details: 'SKU "MS-123" not found in database'
  },
  {
    id: '2',
    orderId: 'INV-002',
    entity: 'Order #INV-002',
    product: 'Sugar',
    quantity: 10,
    error: 'Customer email missing',
    attempts: 2,
    maxAttempts: 5,
    createdAt: '2024-03-20T09:45:00Z',
    status: 'failed',
    details: 'Customer email address is required for invoice'
  },
  {
    id: '3',
    orderId: 'INV-003',
    entity: 'Order #INV-003',
    product: 'Headphone',
    quantity: 2,
    error: 'Invalid tax rate',
    attempts: 5,
    maxAttempts: 5,
    createdAt: '2024-03-19T14:30:00Z',
    status: 'failed',
    details: 'Tax rate 8% not configured for this product category'
  },
];

const mockErrorLogs = [
  { id: 'ERR-001', time: '2024-03-20 10:30:15', type: 'Validation Error', details: 'SKU "MS-123" not found in database' },
  { id: 'ERR-002', time: '2024-03-20 09:45:00', type: 'Missing Data', details: 'Customer email address is required' },
  { id: 'ERR-003', time: '2024-03-19 14:30:00', type: 'Configuration Error', details: 'Tax rate not configured' },
  { id: 'ERR-004', time: '2024-03-19 11:15:00', type: 'Network Error', details: 'Connection timeout while syncing' },
];

export default function SyncErrors() {
  const [failedRecords, setFailedRecords] = useState(mockFailedRecords);
  const [errorLogs, setErrorLogs] = useState(mockErrorLogs);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Error list refreshed');
    }, 1000);
  };

  const handleRetry = async (id: string) => {
    setRetrying(id);
    setTimeout(() => {
      toast.success(`Retry initiated for record ${id}`);
      setFailedRecords(prev => prev.filter(record => record.id !== id));
      setRetrying(null);
    }, 1500);
  };

  const handleRetryAll = () => {
    toast.loading('Retrying all failed records...', { duration: 2000 });
    setTimeout(() => {
      toast.dismiss();
      toast.success('All retries initiated');
      setFailedRecords([]);
    }, 2000);
  };

  const handleExportLogs = () => {
    toast.success('Error logs exported successfully');
  };

  const handleIgnore = (id: string) => {
    toast.success(`Record ${id} ignored`);
    setFailedRecords(prev => prev.filter(record => record.id !== id));
  };

  const getAttemptsProgress = (attempts: number, maxAttempts: number) => {
    return (attempts / maxAttempts) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredRecords = filter === 'all' 
    ? failedRecords 
    : failedRecords.filter(record => record.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sync Errors</h1>
            <p className="text-gray-500 mt-1">Failed transactions that need attention</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleExportLogs}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export Logs
            </button>
          </div>
        </div>

        {/* Failed Count Card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{failedRecords.length}</p>
              <p className="text-red-700 font-medium">Failed Transactions</p>
              <p className="text-sm text-red-500">Requires manual intervention or retry</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            All ({failedRecords.length})
          </button>
          <button 
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Failed ({failedRecords.length})
          </button>
        </div>

        {/* Failed Records List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Failed Transactions</h2>
            {failedRecords.length > 0 && (
              <button 
                onClick={handleRetryAll}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Retry All
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No failed transactions</p>
                <p className="text-sm text-gray-400">All sync operations completed successfully</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div key={record.id} className="p-5 hover:bg-gray-50 transition-colors">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{record.entity}</h3>
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">FAILED</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{record.product} x {record.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-700 font-medium">{record.error}</p>
                        <p className="text-xs text-red-500 mt-1">{record.details}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Attempts: {record.attempts}/{record.maxAttempts}</span>
                      <span>{Math.round(getAttemptsProgress(record.attempts, record.maxAttempts))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all" 
                        style={{ width: `${getAttemptsProgress(record.attempts, record.maxAttempts)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleRetry(record.id)}
                      disabled={retrying === record.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <RotateCw className={`h-4 w-4 ${retrying === record.id ? 'animate-spin' : ''}`} />
                      {retrying === record.id ? 'Retrying...' : 'Retry'}
                    </button>
                    <button 
                      onClick={() => setSelectedError(selectedError === record.id ? null : record.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleIgnore(record.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Ignore
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedError === record.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Error Details</h4>
                      <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify({
                          id: record.id,
                          orderId: record.orderId,
                          product: record.product,
                          quantity: record.quantity,
                          error: record.error,
                          details: record.details,
                          attempts: record.attempts,
                          timestamp: record.createdAt
                        }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bulk Actions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Bulk Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleRetryAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Sync All - Try everything again
            </button>
            <button 
              onClick={handleExportLogs}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Error Report
            </button>
          </div>
        </div>

        {/* Error Log Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Error Log Preview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {errorLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{log.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">{log.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}