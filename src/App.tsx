import React, { useState, useEffect } from 'react';
import { TwitterSettings } from './types/api';
import { twitterAPI } from './services/api';
import { CredentialsPanel } from './components/CredentialsPanel';
import { UserSearchPanel } from './components/UserSearchPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { FollowersPanel } from './components/FollowersPanel';
import { StatusPanel } from './components/StatusPanel';
import { HealthDashboard } from './components/HealthDashboard';
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
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

type PanelId =
  | 'home'
  | 'credentials'
  | 'search'
  | 'timeline'
  | 'followers'
  | 'status';

type MenuItem = {
  id: PanelId;
  label: string;
  icon: React.ElementType;
};

function App() {
  const [credentials, setCredentials] = useState<TwitterSettings[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>('home');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await twitterAPI.getCredentials();
      setCredentials(response.data as TwitterSettings[]);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'credentials', label: 'Credentials & Login', icon: Key },
    { id: 'search', label: 'User Search', icon: Search },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'followers', label: 'Followers', icon: Users },
    { id: 'status', label: 'Status', icon: Activity },
  ];
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'credentials':
        return <CredentialsPanel />;
      case 'search':
        return <UserSearchPanel />;
      case 'timeline':
        return <TimelinePanel />;
      case 'followers':
        return <FollowersPanel />;
      case 'status':
        return <StatusPanel />;      default:
        return <HealthDashboard />;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* Background with grid pattern */}
      <div className="absolute inset-0 bg-[#0fbcf9]/5 backdrop-blur-3xl"></div>      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1d5db 1px, transparent 1px),
            linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          maskImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 4px,
              black 4px,
              black 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 4px,
              black 4px,
              black 6px
            )
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 4px,
              black 4px,
              black 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 4px,
              black 4px,
              black 6px
            )
          `,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in'
        }}
      ></div>
      <div className="relative z-10">
        {/* Floating Header */}
        <header className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg mb-6 sticky top-4 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-[#0fbcf9]/30 rounded-full blur"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-2 rounded-full border border-[#0fbcf9]/20">
                    <Twitter className="w-5 h-5 text-[#0fbcf9]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Twix</h1>
                  <p className="text-xs text-gray-500">
                    {menuItems.find((item) => item.id === activePanel)?.label || 'Dashboard'}
                  </p>
                </div>
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
        </header>        <div className="flex gap-6">
          {/* Sidebar Desktop */}          <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-20'}`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-4 sticky top-24">
              <nav className="space-y-3">
                {/* Toggle Button - Styled like menuItems */}
                <div className="relative group">
                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className={`w-full flex items-center ${sidebarExpanded ? 'space-x-3 px-4 py-3' : 'justify-center p-3'} rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100/70 hover:scale-[1.01] hover:backdrop-blur-sm`}
                  >
                    {sidebarExpanded ? (
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    {sidebarExpanded && (
                      <span className="text-sm font-medium">Collapse</span>
                    )}
                  </button>

                  {/* Tooltip for collapsed state */}
                  {!sidebarExpanded && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Expand
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200/50"></div>
                {menuItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => setActivePanel(item.id)}
                      className={`w-full flex items-center ${sidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl transition-all duration-200 ${activePanel === item.id
                        ? 'bg-[#0fbcf9] text-white shadow-lg transform scale-[1.02] backdrop-blur-sm border border-[#0fbcf9]/20'
                        : 'text-gray-700 hover:bg-[#0fbcf9]/10 hover:scale-[1.01] hover:backdrop-blur-sm'
                        }`}
                    >
                      <item.icon className={`w-5 h-5 ${activePanel === item.id ? 'text-white' : 'text-gray-500'}`} />
                      {sidebarExpanded && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </button>

                    {/* Tooltip for collapsed state */}
                    {!sidebarExpanded && (
                      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {sidebarExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600">
                      {isLoggedIn ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              )}

              {!sidebarExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200/50 flex justify-center">
                  <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              )}
            </div>
          </aside>

          {/* Sidebar Mobile */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                <div className="h-full bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-[#0fbcf9]/30 rounded-full blur"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm p-2 rounded-full border border-[#0fbcf9]/20">
                          <Twitter className="w-5 h-5 text-[#0fbcf9]" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-gray-900">Twix</h1>
                        <p className="text-xs text-gray-500">Dashboard</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <nav className="space-y-3">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActivePanel(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activePanel === item.id
                          ? 'bg-[#0fbcf9] text-white shadow-lg transform scale-[1.02] backdrop-blur-sm border border-[#0fbcf9]/20'
                          : 'text-gray-700 hover:bg-[#0fbcf9]/10 hover:scale-[1.01] hover:backdrop-blur-sm'
                          }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${activePanel === item.id ? 'text-white' : 'text-gray-500'}`}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {isLoggedIn ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-none">{renderActivePanel()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
