import React, { useState, useEffect } from 'react';
import { twitterAPI } from '../services/api';
import { HealthResponse, HealthService } from '../types/api';
import {
    Activity,
    Server,
    Database,
    Zap,
    Globe,
    CheckCircle,
    AlertCircle,
    XCircle,
    Clock,
    MemoryStick,
    HardDrive,
    Cpu,
    ArrowUpCircle,
    Settings,
    RefreshCw,
    TrendingUp,
    Eye
} from 'lucide-react';

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

export const HealthDashboard: React.FC = () => {
    const [healthData, setHealthData] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [animationKey, setAnimationKey] = useState(0);
    const [notifications] = useState<Array<{ id: string, message: string, type: 'success' | 'warning' | 'error' }>>([]);

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
        fetchHealthData();
        checkSystemHealth();
        fetchCeleryStats();
        const interval = setInterval(() => {
            fetchHealthData();
            checkSystemHealth();
            fetchCeleryStats();
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Trigger animation when data updates
        setAnimationKey(prev => prev + 1);
    }, [healthData]);

    useEffect(() => {
        // Keyboard shortcuts
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'r' || event.key === 'R') {
                fetchHealthData();
            }
            if (event.key === 'Escape') {
                setSelectedMetric(null);
                setHoveredCard(null);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
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

    const getCeleryStatusIcon = () => {
        return celeryStatus === 'online'
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <AlertCircle className="w-5 h-5 text-red-600" />;
    };

    const getCeleryStatusColor = () => {
        return celeryStatus === 'online' ? 'text-green-600' : 'text-red-600';
    };

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            const response = await twitterAPI.healthCheck();
            setHealthData(response);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch health data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'degraded':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'unhealthy':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'degraded':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'unhealthy':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Activity className="w-5 h-5 text-gray-600" />;
        }
    };

    const getServiceIcon = (serviceName: string) => {
        switch (serviceName) {
            case 'database':
                return <Database className="w-6 h-6" />;
            case 'redis':
                return <Zap className="w-6 h-6" />;
            case 'celery':
                return <Settings className="w-6 h-6" />;
            case 'twitter_scraper':
                return <Globe className="w-6 h-6" />;
            default:
                return <Server className="w-6 h-6" />;
        }
    };

    const formatBytes = (bytes: number) => {
        return `${bytes.toFixed(1)} MB`;
    };

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString();
    };

    const formatResponseTime = (ms: number) => {
        if (ms < 1000) {
            return `${ms.toFixed(1)}ms`;
        }
        return `${(ms / 1000).toFixed(1)}s`;
    };

    if (loading && !healthData) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header Skeleton */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gray-200 rounded-2xl">
                                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                            <div className="flex-1">
                                <div className="h-7 bg-gray-300 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-64"></div>
                            </div>
                            <div className="hidden md:block">
                                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                            </div>
                        </div>
                    </div>

                    {/* Main Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="p-3 bg-gray-200 rounded-2xl">
                                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-300 rounded w-20 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                                    <div className="h-2 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Services Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gray-200 rounded-xl">
                                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="h-5 bg-gray-300 rounded w-24"></div>
                                    </div>
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-300 rounded w-12"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Refresh Button Skeleton */}
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-200 rounded-xl animate-pulse">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!healthData) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">Failed to load health data</p>
                        <button
                            onClick={fetchHealthData}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            {/* Floating Notifications */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl shadow-lg backdrop-blur-lg border transform transition-all duration-300 animate-fadeIn ${notification.type === 'success' ? 'bg-green-100/90 border-green-200 text-green-800' :
                                notification.type === 'warning' ? 'bg-yellow-100/90 border-yellow-200 text-yellow-800' :
                                    'bg-red-100/90 border-red-200 text-red-800'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                                {notification.type === 'error' && <XCircle className="w-5 h-5" />}
                                <span className="text-sm font-medium">{notification.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header 1*/}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-2xl">
                                <Cpu className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Celery Tasks Monitor</h1>
                                <p className="text-gray-600">Monitoring Tasks</p>
                            </div>
                        </div>            
                    </div>
                </div>

                {/* Main Stats Grid */}
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
                                            {getCeleryStatusIcon()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">API Status</p>
                                            <p className="text-xs text-gray-500">
                                                Last checked: {formatTime(systemStatus.last_check)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${getCeleryStatusColor()} bg-white shadow-sm`}>
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

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        checkSystemHealth();
                                        fetchCeleryStats();
                                    }}
                                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    <Activity className="w-4 h-4" />
                                    <span className="font-medium">Refresh</span>
                                </button>
                                <button
                                    // onClick={async () => {
                                    //     try {
                                    //         const historyResponse = await twitterAPI.getTasksHistory();
                                    //         console.log('Tasks History:', historyResponse.data);
                                    //         // You could show this in a modal or alert for now
                                    //         alert(`Tasks History:\nCompleted: ${historyResponse.data?.completed || 0}\nFailed: ${historyResponse.data?.failed || 0}`);
                                    //     } catch (error) {
                                    //         console.error('Failed to fetch tasks history:', error);
                                    //         alert('Failed to fetch tasks history');
                                    //     }
                                    // }}
                                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    <Server className="w-4 h-4" />
                                    <span className="font-medium">Tasks History</span>
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
                                        style={{ width: celeryStatus === 'online' ? '100%' : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header 2 */}
                <div className="mt-8 md:mt-12 lg:mt-16 bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                                <Activity className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
                                <p className="text-gray-600">Real-time monitoring and system analytics</p>
                            </div>
                        </div>            <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600">Live data</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Last updated</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {lastUpdate.toLocaleTimeString()}
                                </p>
                            </div>
                            <button
                                onClick={fetchHealthData}
                                disabled={loading}
                                className="p-3 bg-gradient-to-r from-[#0fbcf9] to-[#0fbcf9]/80 hover:from-[#0fbcf9]/90 hover:to-[#0fbcf9] text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-[#0fbcf9]/20 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Overall Status */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Overall Status</h2>
                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${getStatusColor(healthData.data.status)}`}>
                                    {getStatusIcon(healthData.data.status)}
                                    <span className="font-medium capitalize">{healthData.data.status}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">            <div
                                className="bg-white/60 backdrop-blur-sm border border-[#0fbcf9]/20 rounded-2xl p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#0fbcf9]/10 hover:border-[#0fbcf9]/40 cursor-pointer"
                                onClick={() => setSelectedMetric('total')}
                            >
                                <div className={`text-2xl font-bold text-blue-600 transition-all duration-500 ${animationKey ? 'animate-pulse' : ''}`}>
                                    {healthData.data.details.total_services_checked}
                                </div>
                                <div className="text-sm text-gray-600">Total Services</div>
                            </div>            
                            <div
                                className="bg-white/60 backdrop-blur-sm border border-[#0fbcf9]/20 rounded-2xl p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#0fbcf9]/10 hover:border-[#0fbcf9]/40 cursor-pointer"
                                onClick={() => setSelectedMetric('healthy')}
                            >
                                    <div className={`text-2xl font-bold text-green-600 transition-all duration-500 ${animationKey ? 'animate-bounce' : ''}`}>
                                        {healthData.data.details.healthy_services}
                                    </div>
                                    <div className="text-sm text-gray-600">Healthy</div>
                                </div>            <div
                                    className="bg-white/60 backdrop-blur-sm border border-[#0fbcf9]/20 rounded-2xl p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#0fbcf9]/10 hover:border-[#0fbcf9]/40 cursor-pointer"
                                    onClick={() => setSelectedMetric('degraded')}
                                >
                                    <div className={`text-2xl font-bold text-yellow-600 transition-all duration-500 ${healthData.data.details.degraded_services > 0 && animationKey ? 'animate-pulse' : ''}`}>
                                        {healthData.data.details.degraded_services}
                                    </div>
                                    <div className="text-sm text-gray-600">Degraded</div>
                                </div>            <div
                                    className="bg-white/60 backdrop-blur-sm border border-[#0fbcf9]/20 rounded-2xl p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#0fbcf9]/10 hover:border-[#0fbcf9]/40 cursor-pointer"
                                    onClick={() => setSelectedMetric('unhealthy')}
                                >
                                    <div className={`text-2xl font-bold text-red-600 transition-all duration-500 ${healthData.data.details.unhealthy_services > 0 && animationKey ? 'animate-bounce' : ''}`}>
                                        {healthData.data.details.unhealthy_services}
                                    </div>
                                    <div className="text-sm text-gray-600">Unhealthy</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4">
                        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h2>
                            <div className="text-center">
                                <div className={`text-3xl font-bold mb-2 transition-all duration-500 ${healthData.data.response_time_ms < 1000 ? 'text-green-600' :
                                    healthData.data.response_time_ms < 3000 ? 'text-yellow-600 animate-pulse' :
                                        'text-red-600 animate-bounce'
                                    }`}>
                                    {formatResponseTime(healthData.data.response_time_ms)}
                                </div>
                                <p className="text-sm text-gray-600">Overall Response Time</p>

                                {/* Performance indicator */}
                                <div className="mt-4">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${healthData.data.response_time_ms < 1000 ? 'bg-green-100 text-green-800' :
                                        healthData.data.response_time_ms < 3000 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {healthData.data.response_time_ms < 1000 ? '🚀 Excellent' :
                                            healthData.data.response_time_ms < 3000 ? '⚡ Good' : '🐌 Slow'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Services Grid - Large Section */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {healthData.data.services.map((service: HealthService) => (<div
                                    key={service.service_name}
                                    onMouseEnter={() => setHoveredCard(service.service_name)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onClick={() => setSelectedMetric(service.service_name)} className={`bg-[#0fbcf9]/5 backdrop-blur-sm border border-[#0fbcf9]/20 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-[#0fbcf9]/10 hover:border-[#0fbcf9]/30 cursor-pointer group relative overflow-hidden ${hoveredCard === service.service_name ? 'ring-2 ring-[#0fbcf9]/50 shadow-xl bg-[#0fbcf9]/10' : ''
                                        } ${selectedMetric === service.service_name ? 'ring-2 ring-purple-400 bg-purple-50/40' : ''
                                        }`}
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-xl transition-all duration-300 transform group-hover:scale-110 ${getStatusColor(service.status)}`}>
                                                    {getServiceIcon(service.service_name)}
                                                </div>
                                                <div>                            <h3 className="font-semibold text-gray-900 capitalize transition-colors duration-300 group-hover:text-[#0fbcf9]">
                                                    {service.service_name.replace('_', ' ')}
                                                </h3>
                                                    <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">{service.message}</p>
                                                </div>
                                            </div>
                                            <div className="transform transition-all duration-300 group-hover:scale-110">
                                                {getStatusIcon(service.status)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Response Time</span>
                                                <span className={`text-sm font-medium transition-colors duration-300 ${service.response_time_ms < 1000 ? 'text-green-600' :
                                                    service.response_time_ms < 3000 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {formatResponseTime(service.response_time_ms)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Last Check</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(service.last_check).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detailed information on hover */}
                                        {hoveredCard === service.service_name && (
                                            <div className="mt-4 pt-4 border-t border-[#0fbcf9]/30 animate-fadeIn">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Details
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    {Object.entries(service.details).slice(0, 6).map(([key, value]) => (
                                                        <div key={key} className="truncate p-2 bg-[#0fbcf9]/10 backdrop-blur-sm rounded-lg border border-[#0fbcf9]/20">
                                                            <span className="text-gray-600 capitalize block">
                                                                {key.replace(/_/g, ' ')}:
                                                            </span>
                                                            <span className="text-gray-900 font-medium">
                                                                {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* System Metrics - Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* System Performance */}
                        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Cpu className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-600">CPU Usage</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {healthData.data.system.cpu_usage_percent}%
                                    </span>
                                </div>                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${Math.min(healthData.data.system.cpu_usage_percent, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <MemoryStick className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-600">Memory</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatBytes(healthData.data.system.memory_usage_mb)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <HardDrive className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm text-gray-600">Disk Usage</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {healthData.data.system.disk_usage_percent}%
                                    </span>
                                </div>                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${Math.min(healthData.data.system.disk_usage_percent, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Uptime & Environment */}
                        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment</h2>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Uptime</p>
                                        <p className="font-medium text-gray-900">
                                            {formatUptime(healthData.data.system.uptime_seconds)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Environment</p>
                                        <p className="font-medium text-gray-900 capitalize">
                                            {healthData.data.details.environment}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Eye className="w-5 h-5 text-orange-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Debug Mode</p>
                                        <p className="font-medium text-gray-900">
                                            {healthData.data.details.debug_mode ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
