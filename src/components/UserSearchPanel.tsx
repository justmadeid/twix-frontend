import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TwitterUser } from '../types/api';
import { TaskMonitor } from './TaskMonitor';
import { Search, Users, User } from 'lucide-react';

export const UserSearchPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(10);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TwitterUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setSearchResults([]);
      const response = await twitterAPI.searchUsers({
        name: searchQuery,
        limit: searchLimit,
      });
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      console.error('Search failed:', error);
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (result: any) => {
    console.log('Search completed:', result);
    setSearchResults(result.users || []);
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  const handleTaskError = (error: string) => {
    console.error('Search failed:', error);
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
          <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
            <Search className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Search Users</h2>
            <p className="text-sm text-gray-500">Find Twitter users by username or display name</p>
          </div>
        </div>
      </div>      <form onSubmit={handleSearch} className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Search Query
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
            placeholder="Enter username or name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Limit Results
          </label>
          <select
            value={searchLimit}
            onChange={(e) => setSearchLimit(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value={5}>5 users</option>
            <option value={10}>10 users</option>
            <option value={20}>20 users</option>
            <option value={50}>50 users</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Search Users</span>
            </>
          )}
        </button>
      </form>      {currentTaskId && (
        <div className="mb-8 p-4 bg-purple-50/50 backdrop-blur-sm rounded-xl border border-purple-100">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Search Results ({searchResults.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-200">
                <div className="flex-shrink-0">
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
