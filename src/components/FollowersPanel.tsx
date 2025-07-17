import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TwitterUser } from '../types/api';
import { TaskMonitor } from './TaskMonitor';
import { UserPlus, UserMinus, User } from 'lucide-react';

export const FollowersPanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [userCount, setUserCount] = useState(50);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [users, setUsers] = useState<TwitterUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setIsLoading(true);
      setUsers([]);
      const response = activeTab === 'followers' 
        ? await twitterAPI.getUserFollowers(username, userCount)
        : await twitterAPI.getUserFollowing(username, userCount);
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      console.error('Fetch failed:', error);
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (result: any) => {
    console.log('Fetch completed:', result);
    setUsers(result.users || []);
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  const handleTaskError = (error: string) => {
    console.error('Fetch failed:', error);
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Followers & Following</h2>
            <p className="text-sm text-gray-500">Explore user connections and relationships</p>
          </div>
        </div>
      </div>      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8 p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl">
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'followers'
              ? 'bg-white text-indigo-700 shadow-sm transform scale-[1.02]'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <UserMinus className="w-4 h-4" />
            <span>Followers</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'following'
              ? 'bg-white text-indigo-700 shadow-sm transform scale-[1.02]'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Following</span>
          </div>
        </button>
      </div>      <form onSubmit={handleFetchUsers} className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
            placeholder="Enter username (without @)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Number of Users
          </label>
          <select
            value={userCount}
            onChange={(e) => setUserCount(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value={25}>25 users</option>
            <option value={50}>50 users</option>
            <option value={100}>100 users</option>
            <option value={200}>200 users</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Fetching {activeTab}...</span>
            </>
          ) : (
            <>
              {activeTab === 'followers' ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>Fetch {activeTab}</span>
            </>
          )}
        </button>
      </form>

      {currentTaskId && (
        <div className="mb-8 p-4 bg-indigo-50/50 backdrop-blur-sm rounded-xl border border-indigo-100">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              {activeTab === 'followers' ? <UserMinus className="w-4 h-4 text-indigo-600" /> : <UserPlus className="w-4 h-4 text-indigo-600" />}
            </div>
            <h3 className="font-semibold text-gray-900">{activeTab === 'followers' ? 'Followers' : 'Following'} ({users.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-200">                <div className="flex-shrink-0">
                  {user.profile_image_url ? (
                    <img
                      src={user.profile_image_url}
                      alt={user.display_name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.display_name}
                    </p>
                    {user.verified && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">@{user.username}</p>
                  {user.bio && (
                    <p className="text-xs text-gray-500 truncate mb-2">{user.bio}</p>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      {formatNumber(user.followers_count)} followers
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      {formatNumber(user.following_count)} following
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
