import React, { useState, useEffect } from 'react';
import { twitterAPI } from '../services/api';
import { Activity, CheckCircle, Clock, AlertCircle, Server } from 'lucide-react';

interface SystemStatus {
  api_status: 'online' | 'offline' | 'degraded';
  last_check: string;
  response_time: number;
}

interface CeleryStats {
  active: number;
  processed: number;
  failed: number;
  workers: number;
}

export const StatusPanel: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api_status: 'offline',
    last_check: new Date().toISOString(),
    response_time: 0,
  });
  
  const [celeryStats, setCeleryStats] = useState<CeleryStats>({
    active: 0,
    processed: 0,
    failed: 0,
    workers: 0,
  });
  
  const [celeryStatus, setCeleryStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    checkSystemHealth();
    fetchCeleryStats();
    
    const interval = setInterval(() => {
      checkSystemHealth();
      fetchCeleryStats();
    }, 10000); // Check every 10 seconds for more frequent updates
    
    return () => clearInterval(interval);
  }, []);

  const fetchCeleryStats = async () => {
    try {
      // Fetch overview tasks data from the new API endpoint
      const overviewResponse = await twitterAPI.getTasksOverview();
      
      if (overviewResponse.data) {
        const overview = overviewResponse.data;
        
        // Fetch history for processed and failed counts
        const historyResponse = await twitterAPI.getTasksHistory();
        let processedCount = 0;
        let failedCount = 0;
        
        if (historyResponse.data) {
          const history = historyResponse.data;
          processedCount = history.completed || 0;
          failedCount = history.failed || 0;
        }

        setCeleryStats({
          active: overview.summary.active_count,
          processed: processedCount,
          failed: failedCount,
          workers: overview.summary.workers_count,
        });

        setCeleryStatus('online');
      } else {
        console.error('Tasks API failed:', overviewResponse.message);
        setCeleryStatus('offline');
      }
    } catch (error) {
      console.error('Failed to fetch Celery stats:', error);
      setCeleryStatus('offline');
    }
  };

  const checkSystemHealth = async () => {
    try {
      const startTime = Date.now();
      await twitterAPI.healthCheck();
      const endTime = Date.now();
      
      setSystemStatus({
        api_status: 'online',
        last_check: new Date().toISOString(),
        response_time: endTime - startTime,
      });
    } catch (error) {
      setSystemStatus({
        api_status: 'offline',
        last_check: new Date().toISOString(),
        response_time: 0,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'offline':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Server className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCeleryStatusIcon = () => {
    return celeryStatus === 'online' 
      ? <CheckCircle className="w-5 h-5 text-green-600" />
      : <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getCeleryStatusColor = () => {
    return celeryStatus === 'online' ? 'text-green-600' : 'text-red-600';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of system health and task processing</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          
          {/* API Status - Large Card */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">System Health Monitor</h2>
                <p className="text-sm text-gray-500">API & Celery worker status</p>
              </div>
            </div>
            
            <div className="flex-grow flex flex-col justify-center space-y-4">
              {/* API Status */}
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                      {getStatusIcon(systemStatus.api_status)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">API Status</p>
                      <p className="text-xs text-gray-500">
                        Last checked: {formatTime(systemStatus.last_check)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(systemStatus.api_status)} bg-white shadow-sm`}>
                      {systemStatus.api_status.charAt(0).toUpperCase() + systemStatus.api_status.slice(1)}
                    </span>
                    {systemStatus.response_time > 0 && (
                      <p className="text-xs text-gray-500 mt-2">{systemStatus.response_time}ms response</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Celery Status */}
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                      {getCeleryStatusIcon()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Celery Workers</p>
                      <p className="text-xs text-gray-500">{celeryStats.workers} active workers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${getCeleryStatusColor()} bg-white shadow-sm`}>
                      {celeryStatus.charAt(0).toUpperCase() + celeryStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
                
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    checkSystemHealth();
                    fetchCeleryStats();
                  }}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Refresh Status</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Tasks Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-xl border border-blue-200 p-6 flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-blue-900">Active Tasks</span>
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <p className="text-4xl font-bold text-blue-700 mb-2">{celeryStats.active}</p>
              <p className="text-sm text-blue-600">Currently processing</p>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-xl border border-green-200 p-6 flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-green-900">Completed</span>
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <p className="text-4xl font-bold text-green-700 mb-2">{celeryStats.processed}</p>
              <p className="text-sm text-green-600">Successfully finished</p>
            </div>
          </div>

          {/* Failed Tasks Card */}
          <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-3xl shadow-xl border border-red-200 p-6 flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-500 rounded-xl shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-red-900">Failed Tasks</span>
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <p className="text-4xl font-bold text-red-700 mb-2">{celeryStats.failed}</p>
              <p className="text-sm text-red-600">Require attention</p>
            </div>
          </div>

          {/* Celery Workers Overview Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl shadow-xl border border-purple-200 p-6 flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-xl shadow-lg">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-purple-900">Celery Workers</span>
            </div>
            <div className="flex-grow flex flex-col justify-center space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-700 mb-1">{celeryStats.workers}</p>
                <p className="text-sm text-purple-600">Active Workers</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-700">Connection</span>
                  <span className={`text-sm font-semibold ${celeryStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    {celeryStatus === 'online' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${celeryStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{width: celeryStatus === 'online' ? '100%' : '0%'}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
