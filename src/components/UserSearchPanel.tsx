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
  }; return (
    <div className="space-y-6">
      {/* Header Container - Separate Bento Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-[#0fbcf9]/10 to-[#0fbcf9]/5 rounded-2xl border border-[#0fbcf9]/20">
            <Search className="w-6 h-6 text-[#0fbcf9]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Search Users</h2>
            <p className="text-sm text-gray-500 mt-1">Find Twitter users by username or display name</p>
          </div>
        </div>
      </div>

      {/* Bento Grid Form Layout */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search Input - Takes most space */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="bg-gradient-to-br from-[#0fbcf9]/10 to-[#0fbcf9]/5 backdrop-blur-sm rounded-2xl border border-[#0fbcf9]/20 p-6 h-full hover:from-[#0fbcf9]/15 hover:to-[#0fbcf9]/10 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-1.5 bg-[#0fbcf9]/10 rounded-lg">
                  <Search className="w-4 h-4 text-[#0fbcf9]" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Search Query
                </label>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0fbcf9] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white text-sm"
                placeholder="Enter username or name..."
                required
              />
            </div>
          </div>

          {/* Limit Selector - Medium space */}
          <div className="lg:col-span-3 xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 h-full hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Limit
                </label>
              </div>
              <select
                value={searchLimit}
                onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0fbcf9] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white text-sm"
              >
                <option value={5}>5 users</option>
                <option value={10}>10 users</option>
                <option value={20}>20 users</option>
                <option value={50}>50 users</option>
              </select>
            </div>
          </div>

          {/* Search Button - Takes remaining space */}
          <div className="lg:col-span-3 xl:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 h-full hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-1.5 bg-[#0fbcf9]/20 rounded-lg">
                  <Search className="w-4 h-4 text-[#0fbcf9]" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Action
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-[#0fbcf9] rounded-xl hover:bg-[#0fbcf9]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg backdrop-blur-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>      {currentTaskId && (
        <div className="mb-8 p-4 bg-[#0fbcf9]/10 backdrop-blur-sm rounded-xl border border-[#0fbcf9]/20">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#0fbcf9]/10 rounded-lg border border-[#0fbcf9]/20">
              <Users className="w-4 h-4 text-[#0fbcf9]" />
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
        </div>)}
    </div>
  );
};
