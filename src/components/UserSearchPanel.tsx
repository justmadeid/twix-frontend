import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TwitterUser } from '../types/api';
import TaskMonitor from './TaskMonitor';
import { UserProfilePage } from './UserProfilePage';
import { Search, Users, User } from 'lucide-react';

export const UserSearchPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(10);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TwitterUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TwitterUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);

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
  }; const handleTaskComplete = (result: any) => {
    console.log('Search completed:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result || {}));

    // Handle different response structures
    let users = [];
    if (result?.users) {
      users = result.users;
    } else if (Array.isArray(result)) {
      users = result;
    } else if (result?.data?.users) {
      users = result.data.users;
    }

    console.log('Users found:', users);
    console.log('Users count:', users.length);    // Map the API response to match our TwitterUser interface
    const mappedUsers = (users || []).map((user: any) => {
      console.log('Mapping user:', user);
      return {
        id: user.user_id || user.id,
        username: user.screen_name || user.username,
        display_name: user.name || user.display_name,
        bio: user.bio || user.description || '',
        followers_count: user.followers || user.followers_count || 0,
        following_count: user.following || user.following_count || 0,
        verified: user.verified || false,
        profile_image_url: user.avatar || user.profile_image_url,
        created_at: user.created || user.created_at,
        // Additional comprehensive fields
        tweets: user.tweets || user.statuses_count || 0,
        favorites: user.favorites || user.favourites_count || 0,
        location: user.location || '',
        profile_banner: user.profile_banner || user.profile_banner_url,
        url: user.url || '',
        listed_count: user.listed_count || 0,
        protected: user.protected || false,
        default_profile: user.default_profile || false,
        default_profile_image: user.default_profile_image || false,
        geo_enabled: user.geo_enabled || false,
        lang: user.lang || '',
        time_zone: user.time_zone || '',
        utc_offset: user.utc_offset || 0,
        profile_text_color: user.profile_text_color || '',
        profile_link_color: user.profile_link_color || '',
        profile_sidebar_fill_color: user.profile_sidebar_fill_color || '',
        profile_sidebar_border_color: user.profile_sidebar_border_color || '',
        profile_background_color: user.profile_background_color || '',
        profile_background_image_url: user.profile_background_image_url || '',
        profile_background_tile: user.profile_background_tile || false,
        profile_use_background_image: user.profile_use_background_image || false,
      };
    });

    console.log('Mapped users:', mappedUsers);
    setSearchResults(mappedUsers);
    setCurrentTaskId(null);
    setIsLoading(false);
  };
  const handleTaskError = (error: string) => {
    console.error('Search failed:', error);
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  const handleViewProfile = (user: TwitterUser) => {
    setSelectedUser(user);
    setShowProfile(true);
  };

  const handleBackToSearch = () => {
    setShowProfile(false);
    setSelectedUser(null);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showProfile && selectedUser ? (
          <UserProfilePage 
            user={selectedUser} 
            onBack={handleBackToSearch}
          />
        ) : (
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
          {/* Search stats */}
          {searchResults.length > 0 && (
            <div className="ml-auto hidden sm:block">
              <div className="px-3 py-1 bg-[#0fbcf9]/10 text-[#0fbcf9] text-sm font-medium rounded-full">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </div>{/* Enhanced Bento Grid Form Layout */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-12 gap-4">
          {/* Search Input - Enhanced styling */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-7">
            <div className="group relative overflow-hidden bg-gradient-to-br from-[#0fbcf9]/10 backdrop-blur-lg rounded-2xl border border-[#0fbcf9]/20 p-6 h-full hover:from-[#0fbcf9]/10 hover:to-[#0fbcf9]/15 hover:border-[#0fbcf9]/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0fbcf9]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#0fbcf9]/10 rounded-xl group-hover:bg-[#0fbcf9]/20 group-hover:scale-110 transition-all duration-300">
                    <Search className="w-5 h-5 text-[#0fbcf9]" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-hover:text-[#0fbcf9] transition-colors duration-300">
                    Search Query
                  </label>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#0fbcf9] focus:border-[#0fbcf9] bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:border-[#0fbcf9]/30 text-sm placeholder-gray-400 shadow-sm focus:shadow-md"
                  placeholder="Enter username, name, or keywords..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Limit Selector - Enhanced styling */}
          <div className="col-span-6 lg:col-span-3 xl:col-span-2">
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 h-full hover:bg-white/90 hover:border-[#0fbcf9]/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#0fbcf9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-[#0fbcf9]/10 group-hover:scale-110 transition-all duration-300">
                    <Users className="w-5 h-5 text-gray-600 group-hover:text-[#0fbcf9] transition-colors duration-300" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-hover:text-[#0fbcf9] transition-colors duration-300">
                    Limit
                  </label>
                </div>
                <select
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                  className="w-full px-4 py-4 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#0fbcf9] focus:border-[#0fbcf9] bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:border-[#0fbcf9]/30 text-sm shadow-sm focus:shadow-md"
                >
                  <option value={5}>5 users</option>
                  <option value={10}>10 users</option>
                  <option value={20}>20 users</option>
                  <option value={50}>50 users</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Button - Enhanced with animation */}
          <div className="col-span-6 lg:col-span-3 xl:col-span-3">
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 h-full hover:bg-white/90 hover:border-[#0fbcf9]/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0fbcf9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#0fbcf9]/20 rounded-xl group-hover:bg-[#0fbcf9]/30 group-hover:scale-110 transition-all duration-300">
                    <Search className="w-5 h-5 text-[#0fbcf9]" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-hover:text-[#0fbcf9] transition-colors duration-300">
                    Action
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || currentTaskId !== null}
                  className="w-full px-5 py-4 bg-gradient-to-r from-[#0fbcf9] to-[#0fbcf9]/90 text-white rounded-xl hover:from-[#0fbcf9]/90 hover:to-[#0fbcf9] hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm font-bold shadow-lg backdrop-blur-sm border border-[#0fbcf9]/20"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>Search Users</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>      {/* Task Monitor Section */}
      {currentTaskId && (
        <div className="mb-8 p-4 bg-[#0fbcf9]/10 backdrop-blur-sm rounded-xl border border-[#0fbcf9]/20">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}      {/* Loading Skeleton - Simplified Style */}
      {isLoading && currentTaskId && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl animate-pulse">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <div>
                <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {Array.from({ length: searchLimit }, (_, index) => {
              const isLargeSkeleton = index === 0 && searchLimit > 2;
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}{/* Results Container - Bento Grid Layout */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-[#0fbcf9]/10 to-[#0fbcf9]/5 rounded-2xl border border-[#0fbcf9]/20">
                <Users className="w-6 h-6 text-[#0fbcf9]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
                <p className="text-sm text-gray-500 mt-1">Found {searchResults.length} users</p>
              </div>
            </div>
          </div>          {/* Bento Grid User Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {searchResults.map((user, index) => {
              // Create bento grid variety with different card sizes
              const getBentoSize = (index: number, total: number) => {
                // First card is always large if we have more than 2 users
                if (index === 0 && total > 2) {
                  return "md:col-span-2 md:row-span-2";
                }
                // Every 5th card (starting from 4th) spans 2 columns
                if ((index - 3) % 5 === 0 && index > 2) {
                  return "lg:col-span-2";
                }
                // Every 7th card spans 2 rows (but not if it's already spanning columns)
                if ((index - 6) % 7 === 0 && index > 5 && (index - 3) % 5 !== 0) {
                  return "xl:row-span-2";
                }
                // Random medium cards
                if (index === 2 && total > 6) {
                  return "lg:col-span-2 xl:col-span-1";
                }
                return "";
              }; const isLargeCard = index === 0 && searchResults.length > 2;
              const bentoClass = getBentoSize(index, searchResults.length); return (<div
                key={user.id}
                className={`group relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 ${bentoClass}`}
              >
                {/* Profile Banner Background for Header Section */}
                <div className="relative">                  {user.profile_banner ? (
                  <div
                    className={`w-full relative ${isLargeCard ? 'h-48' : 'h-32'}`}
                    style={{
                      backgroundImage: `url(${user.profile_banner})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >                      {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                  </div>) : (
                  <div className={`w-full bg-gradient-to-r from-gray-400 to-gray-500 relative ${isLargeCard ? 'h-32' : 'h-24'}`}>                      {/* Dark overlay for consistency */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                  </div>
                )}

                  {/* User Avatar and Info overlaid on banner */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">                    {/* User Avatar */}
                    <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
                      {user.profile_image_url ? (<img
                        src={user.profile_image_url}
                        alt={user.display_name}
                        className={`rounded-full border-2 border-white mt-1 shadow-lg group-hover:border-blue-300 transition-all duration-300 ${isLargeCard ? 'w-16 h-16' : 'w-12 h-12'}`}
                      />) : (
                        <div className={`bg-white/20 rounded-full flex items-center justify-center border-2 border-white group-hover:border-blue-300 transition-all duration-300 ${isLargeCard ? 'w-16 h-16' : 'w-12 h-12'}`}>
                          <User className={`text-white ${isLargeCard ? 'w-8 h-8' : 'w-6 h-6'}`} />
                        </div>
                      )}
                    </div>

                    {/* User Name and Username */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">                        
                        <h4 className={`font-semibold text-white truncate drop-shadow-md group-hover:text-blue-200 transition-colors duration-300 ${isLargeCard ? 'text-base' : 'text-sm'}`}>
                        {user.display_name}
                      </h4>
                        {user.verified && (
                          <span className={`text-blue-300 group-hover:text-blue-200 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>✓</span>
                        )}
                      </div>
                      <p className={`text-white/90 truncate drop-shadow-md group-hover:text-white transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </div>                {/* Comprehensive Stats Section */}
                <div className={`${isLargeCard ? 'p-6' : 'p-4'} space-y-4`}>
                  {/* Main Stats Grid */}
                  <div className={`grid gap-3 ${isLargeCard ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    <div className="text-center bg-gray-50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                      <div className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 ${isLargeCard ? 'text-lg' : 'text-sm'}`}>
                        {formatNumber(user.followers_count)}
                      </div>
                      <div className={`text-gray-500 group-hover:text-blue-500 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>Followers</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                      <div className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 ${isLargeCard ? 'text-lg' : 'text-sm'}`}>
                        {formatNumber(user.following_count)}
                      </div>
                      <div className={`text-gray-500 group-hover:text-blue-500 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>Following</div>
                    </div>

                    {/* Additional stats for large cards */}
                    {isLargeCard && (
                      <>
                        <div className="text-center bg-gray-50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                          <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {formatNumber(user.tweets || 0)}
                          </div>
                          <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-300">Tweets</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2 group-hover:bg-blue-50 transition-colors duration-300">
                          <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {formatNumber(user.favorites || 0)}
                          </div>
                          <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-300">Likes</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-2">
                    {/* Location and Date for all cards */}
                    <div className={`grid gap-2 ${isLargeCard ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {user.location && (
                        <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 rounded-lg p-2 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className={`truncate ${isLargeCard ? 'text-sm' : 'text-xs'}`}>{user.location}</span>
                        </div>
                      )}
                      {user.created_at && (
                        <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 rounded-lg p-2 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className={`truncate ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                            Joined {new Date(user.created_at).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Account Status Indicators */}
                    <div className="flex flex-wrap gap-1">
                      {user.protected && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200 transition-colors duration-300">
                          🔒 Private
                        </span>
                      )}
                      {!user.protected && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors duration-300">
                          🌍 Public
                        </span>
                      )}
                      {user.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors duration-300">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio for all cards (with different line limits) */}
                  {user.bio && (
                    <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-blue-50 transition-colors duration-300">
                      <p className={`text-gray-600 group-hover:text-blue-700 transition-colors duration-300 ${isLargeCard ? 'text-sm line-clamp-4' : 'text-xs line-clamp-2'}`}>
                        {user.bio}
                      </p>
                    </div>
                  )}                  {/* Engagement Rate for large cards */}
                  {isLargeCard && (user.tweets || 0) > 0 && (user.favorites || 0) > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                          Engagement: {(((user.favorites || 0) / (user.tweets || 1)) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                          Likes per Tweet Ratio
                        </div>
                      </div>
                    </div>
                  )}
                </div>                {/* Hover-only View Profile Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">                  <button 
                    onClick={() => handleViewProfile(user)}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >                    View Profile                  </button>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
          </div>
        )}
      </div>
    </div>
  );
};