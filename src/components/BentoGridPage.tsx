import React, { useState, useEffect } from 'react';
import {
  Settings,
  Search,
  Users,
  Activity,
  Key,
  Clock,
  BarChart3,
  Database,
  Twitter,
  Calendar,
  Download,
  BookOpen,
  Video,
  Headphones,
  ExternalLink,
  Target,
  Trophy,
  Zap,
  Home,
  ChevronRight
} from 'lucide-react';

type PanelId = 'home' | 'credentials' | 'search' | 'timeline' | 'followers' | 'status';

interface BentoGridPageProps {
  onNavigate?: (panel: PanelId) => void;
}

interface MenuShortcut {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
}

const BentoGridPage: React.FC<BentoGridPageProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Main app shortcuts
  const mainShortcuts: MenuShortcut[] = [
    {
      id: 'credentials',
      title: 'Credentials',
      description: 'Manage Twitter API keys',
      icon: Key,
      color: 'bg-blue-500',
      action: () => onNavigate?.('credentials')
    },
    {
      id: 'search',
      title: 'User Search',
      description: 'Search Twitter users',
      icon: Search,
      color: 'bg-green-500',
      action: () => onNavigate?.('search')
    },
    {
      id: 'timeline',
      title: 'Timeline',
      description: 'View user timelines',
      icon: Clock,
      color: 'bg-purple-500',
      action: () => onNavigate?.('timeline')
    },
    {
      id: 'followers',
      title: 'Followers',
      description: 'Analyze followers',
      icon: Users,
      color: 'bg-orange-500',
      action: () => onNavigate?.('followers')
    },
    {
      id: 'status',
      title: 'System Status',
      description: 'API health monitoring',
      icon: Activity,
      color: 'bg-red-500',
      action: () => onNavigate?.('status')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Data insights',
      icon: BarChart3,
      color: 'bg-indigo-500',
      action: () => console.log('Analytics coming soon!')
    }
  ];

  // Quick action shortcuts
  const quickActions = [
    { icon: Calendar, label: 'Schedule', color: 'bg-blue-400' },
    { icon: Download, label: 'Export', color: 'bg-green-400' },
    { icon: Settings, label: 'Settings', color: 'bg-gray-400' },
    { icon: BookOpen, label: 'Guide', color: 'bg-purple-400' },
    { icon: Video, label: 'Streams', color: 'bg-red-400' },
    { icon: Headphones, label: 'Audio', color: 'bg-pink-400' },
    { icon: Trophy, label: 'Updates', color: 'bg-yellow-400' },
    { icon: ExternalLink, label: 'Links', color: 'bg-teal-400' }
  ];

  // Stats data
  const stats = [
    { label: 'API Requests', value: '12,345', icon: Target, change: '+15%' },
    { label: 'Success Rate', value: '98.5%', icon: Trophy, change: '+2.1%' },
    { label: 'Data Collected', value: '1.2M', icon: Database, change: '+8.3%' }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 auto-rows-min">
          
          {/* Hero Banner - Large */}
          <div className="col-span-full lg:col-span-6 xl:col-span-6 row-span-2">
            <div className="relative h-100 lg:h-100 rounded-2xl overflow-hidden">
              <img 
                src="/banner.png" 
                alt="Twitter Scraper Banner" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoGridPage;
