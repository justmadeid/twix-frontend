import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TwitterUser } from '../types/api';
import TaskMonitor from './TaskMonitor';
import { UserPlus, UserMinus, User, Heart, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export const FollowersPanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [userCount, setUserCount] = useState(50);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [users, setUsers] = useState<TwitterUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchUsers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // Handle tab switching with automatic fetch
  const handleTabSwitch = async (tab: 'followers' | 'following') => {
    setActiveTab(tab);
    // If username is provided, automatically fetch data for the new tab
    if (username.trim() && !isLoading) {
      try {
        setIsLoading(true);
        setUsers([]);
        const response = tab === 'followers' 
          ? await twitterAPI.getUserFollowers(username, userCount)
          : await twitterAPI.getUserFollowing(username, userCount);
        setCurrentTaskId(response.data.task_id);
      } catch (error) {
        console.error('Auto-fetch failed:', error);
        setIsLoading(false);
      }
    }
  };

  // Auto-fetch followers when username is entered for the first time
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Clear existing data when username changes
    if (users.length > 0) {
      setUsers([]);
    }
  };

  // Auto-fetch followers when username is completed (on blur)
  const handleAutoFetch = async () => {
    if (username.trim() && !isLoading && users.length === 0) {
      // Default to fetching followers first
      setActiveTab('followers');
      try {
        setIsLoading(true);
        const response = await twitterAPI.getUserFollowers(username, userCount);
        setCurrentTaskId(response.data.task_id);
      } catch (error) {
        console.error('Auto-fetch failed:', error);
        setIsLoading(false);
      }
    }
  };

  const handleTaskComplete = (result: any) => {
    console.log('Fetch completed:', result);
    // Handle different possible result structures
    let usersData = [];
    if (result.users) {
      usersData = result.users;
    } else if (Array.isArray(result)) {
      usersData = result;
    } else if (result.data && Array.isArray(result.data)) {
      usersData = result.data;
    }
    
    setUsers(usersData || []);
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  const handleTaskError = (error: string) => {
    console.error('Fetch failed:', error);
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  // Safe number formatting function to prevent toString errors
  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    const numValue = Number(num);
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M';
    } else if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    return numValue.toString();
  };

  // Content-aware bento grid sizing for user cards
  const getBentoSize = (index: number, total: number, user: TwitterUser) => {
    const hasExtensiveInfo = !!(user.bio && user.location);
    const isHighFollowerCount = (user.followers_count || 0) > 10000;
    const isVerified = user.verified;
    
    // Calculate content density score
    const contentScore = 
      (hasExtensiveInfo ? 2 : 0) +
      (isHighFollowerCount ? 2 : 0) +
      (isVerified ? 1 : 0);
    
    // First card - enlarge if it has significant content
    if (index === 0 && total > 3 && contentScore >= 2) {
      return "md:col-span-2";
    }
    
    // High content density gets larger cards occasionally
    if (contentScore >= 3 && index % 8 === 0 && index > 0) {
      return "lg:col-span-2";
    }
    
    // Verified users or high followers get occasional wide treatment
    if ((isVerified || isHighFollowerCount) && index % 12 === 0 && index > 0) {
      return "md:col-span-2";
    }
    
    return "";
  };
  return (
    <div className="space-y-6">
      {/* Header Container - Bento Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-2xl border border-purple-500/20">
            <UserPlus className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Followers & Following</h2>
            <p className="text-sm text-gray-500 mt-1">
              Auto-fetches followers by default • Switch tabs to fetch following
            </p>
          </div>
          {/* User count display */}
          {users.length > 0 && (
            <div className="ml-auto hidden sm:block">
              <div className="px-3 py-1 bg-purple-500/10 text-purple-500 text-sm font-medium rounded-full">
                {users.length} {activeTab}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Bento Grid Form Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Tab Navigation - Bento Card */}
        <div className="col-span-12 lg:col-span-3">
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6 h-full hover:from-purple-500/15 hover:border-purple-500/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                  <UserPlus className="w-5 h-5 text-purple-500" />
                </div>
                <label className="text-sm font-bold text-gray-700 group-hover:text-purple-500 transition-colors duration-300">
                  Connection Type
                </label>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('followers')}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTab === 'followers'
                      ? 'bg-purple-500 text-white shadow-lg transform scale-[1.02]'
                      : 'bg-white/60 text-gray-600 hover:bg-white/80 hover:text-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <UserMinus className="w-4 h-4" />
                    <span>Followers</span>
                    {isLoading && activeTab === 'followers' && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent ml-1"></div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('following')}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTab === 'following'
                      ? 'bg-purple-500 text-white shadow-lg transform scale-[1.02]'
                      : 'bg-white/60 text-gray-600 hover:bg-white/80 hover:text-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Following</span>
                    {isLoading && activeTab === 'following' && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent ml-1"></div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Username Input - Bento Card */}
        <div className="col-span-12 lg:col-span-6">
          <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500/10 backdrop-blur-lg rounded-2xl border border-indigo-500/20 p-6 h-full hover:from-indigo-500/15 hover:border-indigo-500/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                  <User className="w-5 h-5 text-indigo-500" />
                </div>
                <label className="text-sm font-bold text-gray-700 group-hover:text-indigo-500 transition-colors duration-300">
                  Username
                </label>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={handleAutoFetch}
                className="w-full px-5 py-4 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:border-indigo-500/30 text-sm placeholder-gray-400 shadow-sm focus:shadow-md"
                placeholder="Enter username (without @) - Auto-fetches followers"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Section - Bento Card */}
        <div className="col-span-12 lg:col-span-3">
          <form onSubmit={handleFetchUsers} className="h-full">
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 h-full hover:bg-white/90 hover:border-purple-500/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-300">
                    <MessageCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-hover:text-purple-500 transition-colors duration-300">
                    Count: {userCount}
                  </label>
                </div>
                
                <select
                  value={userCount}
                  onChange={(e) => setUserCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 mb-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white text-sm"
                >
                  <option value={25}>25 users</option>
                  <option value={50}>50 users</option>
                  <option value={100}>100 users</option>
                  <option value={200}>200 users</option>
                </select>

                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm font-bold shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Fetching {activeTab}...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      {activeTab === 'followers' ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>Refresh {activeTab}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Task Monitor Section */}
      {currentTaskId && (
        <div className="p-4 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}

      {/* Loading Skeleton for Followers/Following */}
      {isLoading && currentTaskId && (
        <div className="space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gray-200 rounded-xl">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-7 bg-gray-300 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-14"></div>
              </div>
            ))}
          </div>

          {/* User Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {Array.from({ length: userCount }, (_, index) => {
              const isLargeSkeleton = index === 0 && userCount > 2;
              const skeletonClass = isLargeSkeleton ? "md:col-span-2 md:row-span-2" : "";

              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-md border border-gray-200 animate-pulse ${skeletonClass}`}
                >
                  {/* Banner header skeleton */}
                  <div className={`w-full bg-gray-300 relative ${isLargeSkeleton ? 'h-32' : 'h-24'}`}>
                    {/* Avatar skeleton */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`bg-gray-400 rounded-full mb-2 ${isLargeSkeleton ? 'w-16 h-16' : 'w-12 h-12'}`}></div>
                      <div className={`h-3 bg-gray-400 rounded w-20 mb-1 ${isLargeSkeleton ? 'h-4 w-24' : ''}`}></div>
                      <div className={`h-2 bg-gray-400 rounded w-16 ${isLargeSkeleton ? 'h-3 w-20' : ''}`}></div>
                    </div>
                  </div>

                  <div className={`${isLargeSkeleton ? 'p-6' : 'p-4'}`}>
                    {/* Stats skeleton */}
                    <div className={`grid gap-3 ${isLargeSkeleton ? 'grid-cols-4' : 'grid-cols-2'}`}>
                      <div className="text-center">
                        <div className={`bg-gray-300 rounded mb-1 ${isLargeSkeleton ? 'h-5' : 'h-4'}`}></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="text-center">
                        <div className={`bg-gray-300 rounded mb-1 ${isLargeSkeleton ? 'h-5' : 'h-4'}`}></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                      {isLargeSkeleton && (
                        <>
                          <div className="text-center">
                            <div className="h-5 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                          </div>
                          <div className="text-center">
                            <div className="h-5 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bio skeleton for large cards */}
                    {isLargeSkeleton && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    )}

                    {/* Additional skeleton elements for large cards */}
                    {isLargeSkeleton && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-4 bg-gray-200 rounded-full w-12"></div>
                          <div className="h-4 bg-gray-200 rounded-full w-16"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Stats Cards - when data is available */}
      {users.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Users Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Total</h3>
              </div>
              <p className="text-2xl font-bold text-purple-700 mb-1">{users.length}</p>
              <p className="text-xs text-purple-600">{activeTab}</p>
            </div>
          </div>

          {/* Verified Users Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                  <Heart className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Verified</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700 mb-1">
                {users.filter(user => user.verified).length}
              </p>
              <p className="text-xs text-blue-600">users</p>
            </div>
          </div>

          {/* Average Followers Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl border border-emerald-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-300">
                  <UserMinus className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors duration-300">Avg Followers</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-700 mb-1">
                {users.length > 0 
                  ? formatNumber(Math.round(users.reduce((sum, user) => sum + (user.followers_count || 0), 0) / users.length))
                  : '0'
                }
              </p>
              <p className="text-xs text-emerald-600">per user</p>
            </div>
          </div>

          {/* With Bio Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm rounded-2xl border border-orange-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors duration-300">
                  <MessageCircle className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 group-hover:text-orange-700 transition-colors duration-300">With Bio</h3>
              </div>
              <p className="text-2xl font-bold text-orange-700 mb-1">
                {users.filter(user => user.bio && user.bio.trim() !== '').length}
              </p>
              <p className="text-xs text-orange-600">users</p>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Status Message - when no data */}
      {!isLoading && !currentTaskId && users.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Fetch</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              💡 <strong>Auto-fetch:</strong> Enter a username and it will automatically fetch followers
            </p>
            <p>
              🔄 <strong>Switch tabs:</strong> Click "Following" tab to auto-fetch following list
            </p>
            <p>
              🔄 <strong>Refresh:</strong> Use the "Refresh" button to update current data
            </p>
          </div>
        </div>
      )}

      {/* Users Bento Grid - Enhanced Display */}
      {users.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                {activeTab === 'followers' ? <UserMinus className="w-5 h-5 text-slate-600" /> : <UserPlus className="w-5 h-5 text-slate-600" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'followers' ? 'Followers' : 'Following'} ({users.length})
              </h3>
            </div>
          </div>
          
          <div className="grid grid-fit-content grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[800px] overflow-y-auto custom-scrollbar">
            {users.map((user, index) => {
              const bentoClass = getBentoSize(index, users.length, user);
              const isLargeCard = bentoClass.includes('col-span-2');
              
              return (
                <div 
                  key={user.id} 
                  className={`group relative overflow-hidden card-compact content-fit p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 hover:bg-white/95 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up ${bentoClass}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* User Header */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0">
                      {user.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={user.display_name}
                          className={`rounded-2xl border-2 border-white shadow-sm group-hover:border-purple-300 transition-all duration-300 ${isLargeCard ? 'w-16 h-16' : 'w-12 h-12'}`}
                        />
                      ) : (
                        <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm group-hover:border-purple-300 transition-all duration-300 ${isLargeCard ? 'w-16 h-16' : 'w-12 h-12'}`}>
                          <User className={`text-gray-500 ${isLargeCard ? 'w-8 h-8' : 'w-6 h-6'}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-300 ${isLargeCard ? 'text-base' : 'text-sm'}`}>
                          {user.display_name}
                        </h4>
                        {user.verified && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className={`text-gray-500 truncate group-hover:text-purple-500 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Bio */}
                  {user.bio && (
                    <div className="mb-3">
                      <p className={`text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 ${
                        isLargeCard ? 'text-sm' : 'text-xs'
                      } ${
                        isLargeCard ? '' : 'line-clamp-3'
                      }`}>
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {/* Location & Join Date */}
                  {(user.location || user.created_at) && (
                    <div className="mb-3 space-y-1">
                      {user.location && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs truncate">{user.location}</span>
                        </div>
                      )}
                      {user.created_at && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">
                            Joined {format(new Date(user.created_at), 'MMM yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* User Stats */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <p className={`font-bold text-gray-900 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                          {formatNumber(user.followers_count)}
                        </p>
                        <p className="text-xs text-gray-500">followers</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-bold text-gray-900 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                          {formatNumber(user.following_count)}
                        </p>
                        <p className="text-xs text-gray-500">following</p>
                      </div>
                      {user.tweets && (
                        <div className="text-center">
                          <p className={`font-bold text-gray-900 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                            {formatNumber(user.tweets)}
                          </p>
                          <p className="text-xs text-gray-500">tweets</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
