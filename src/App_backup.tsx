import React, { useState, useEffect } from 'react';
import { TwitterSettings } from './types/api';
import { twitterAPI } from './services/api';
import { CredentialsPanel } from './components/CredentialsPanel';
import { LoginPanel } from './components/LoginPanel';
import { UserSearchPanel } from './components/UserSearchPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { FollowersPanel } from './components/FollowersPanel';
import { StatusPanel } from './components/StatusPanel';
import { 
  Twitter, 
  Settings, 
  Menu, 
  X, 
  Key, 
  LogIn, 
  Search, 
  Clock, 
  Users, 
  Activity,
  Home,
  ChevronRight
} from 'lucide-react';

function App() {
  const [credentials, setCredentials] = useState<TwitterSettings[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('home');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await twitterAPI.getCredentials();
      setCredentials(response.data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'credentials', label: 'Credentials', icon: Key },
    { id: 'login', label: 'Login', icon: LogIn },
    { id: 'search', label: 'User Search', icon: Search },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'followers', label: 'Followers', icon: Users },
    { id: 'status', label: 'Status', icon: Activity },
  ];

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'credentials':
        return <CredentialsPanel />;
      case 'login':
        return <LoginPanel credentials={credentials} onLoginSuccess={handleLoginSuccess} />;
      case 'search':
        return <UserSearchPanel />;
      case 'timeline':
        return <TimelinePanel />;
      case 'followers':
        return <FollowersPanel />;
      case 'status':
        return <StatusPanel />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Dashboard Overview */}
            <div className="lg:col-span-2 xl:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <h3 className="text-sm font-medium">Total Credentials</h3>
                    <p className="text-2xl font-bold">{credentials.length}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <h3 className="text-sm font-medium">Login Status</h3>
                    <p className="text-2xl font-bold">{isLoggedIn ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <h3 className="text-sm font-medium">Active Tasks</h3>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <h3 className="text-sm font-medium">API Health</h3>
                    <p className="text-2xl font-bold">Good</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {menuItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-700">Dashboard loaded</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-700">System health check</p>
                    <p className="text-xs text-gray-500">2 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#000_1px,_transparent_0)] bg-[size:20px_20px]"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30"></div>
              <div className="relative bg-white p-2 rounded-full">
                <Twitter className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Twitter Scraper</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activePanel === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activePanel === item.id ? 'text-white' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isLoggedIn ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {menuItems.find(item => item.id === activePanel)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">Manage your Twitter scraping operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                {isLoggedIn ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Logged In
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                    Not Logged In
                  </span>
                )}
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <Settings className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderActivePanel()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
