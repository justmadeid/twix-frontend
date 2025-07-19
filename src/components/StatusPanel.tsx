import React, { useState, useEffect } from 'react';
import { twitterAPI } from '../services/api';
import { Activity, CheckCircle, Clock, AlertCircle, Server } from 'lucide-react';

interface SystemStatus {
  api_status: 'online' | 'offline' | 'degraded';
  last_check: string;
  response_time: number;
}

export const StatusPanel: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api_status: 'offline',
    last_check: new Date().toISOString(),
    response_time: 0,
  });  const [activeTasks] = useState<number>(0);
  const [completedTasks] = useState<number>(0);
  const [failedTasks] = useState<number>(0);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <p className="text-sm text-gray-500">Monitor API health and task activity</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
        {/* API Status */}
        <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              {getStatusIcon(systemStatus.api_status)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">API Status</p>
              <p className="text-xs text-gray-500">
                Last checked: {formatTime(systemStatus.last_check)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${getStatusColor(systemStatus.api_status)} bg-gray-50 px-3 py-1 rounded-lg`}>
              {systemStatus.api_status.charAt(0).toUpperCase() + systemStatus.api_status.slice(1)}
            </p>
            {systemStatus.response_time > 0 && (
              <p className="text-xs text-gray-500 mt-1">{systemStatus.response_time}ms</p>
            )}
          </div>
        </div>        {/* Task Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-blue-200 rounded-md">
                <Clock className="w-4 h-4 text-blue-700" />
              </div>
              <span className="text-sm font-semibold text-blue-900">Active</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{activeTasks}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-green-200 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-700" />
              </div>
              <span className="text-sm font-semibold text-green-900">Completed</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{completedTasks}</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-700" />
              </div>
              <span className="text-sm font-semibold text-red-900">Failed</span>
            </div>
            <p className="text-3xl font-bold text-red-700">{failedTasks}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <Activity className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={checkSystemHealth}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-left text-gray-700 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl border border-white/40 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="p-1 bg-orange-100 rounded-md">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <span className="font-medium">Refresh Status</span>
            </button>
            <button
              onClick={() => window.open('http://localhost:5555', '_blank')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-left text-gray-700 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl border border-white/40 transition-all duration-200 transform hover:scale-[1.02]"            >
              <div className="p-1 bg-blue-100 rounded-md">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">Open Celery Monitor</span>            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};
