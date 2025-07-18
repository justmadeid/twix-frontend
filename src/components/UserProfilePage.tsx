import React, { useState, useEffect } from 'react';
import { TwitterUser } from '../types/api';
import { twitterAPI } from '../services/api';
import TaskMonitor from './TaskMonitor';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Shield, 
  Users, 
  MessageCircle, 
  Heart,
  Globe,
  Clock,
  Palette,
  User as UserIcon
} from 'lucide-react';

interface UserProfilePageProps {
  user: TwitterUser;
  onBack: () => void;
}

interface FollowUser {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  followers_count: number;
  verified: boolean;
  profile_image_url?: string;
  protected: boolean;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followersTaskId, setFollowersTaskId] = useState<string | null>(null);
  const [followingTaskId, setFollowingTaskId] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };
  const loadFollowers = async () => {
    try {
      setLoadingFollowers(true);
      const response = await twitterAPI.getUserFollowers(user.username, 50);
      setFollowersTaskId(response.data.task_id);
    } catch (error) {
      console.error('Failed to load followers:', error);
      setLoadingFollowers(false);
    }
  };

  const loadFollowing = async () => {
    try {
      setLoadingFollowing(true);
      const response = await twitterAPI.getUserFollowing(user.username, 50);
      setFollowingTaskId(response.data.task_id);
    } catch (error) {
      console.error('Failed to load following:', error);
      setLoadingFollowing(false);
    }
  };

  const handleFollowersComplete = (result: any) => {
    console.log('Followers loaded:', result);
    let users = [];
    if (result?.users) {
      users = result.users;
    } else if (Array.isArray(result)) {
      users = result;
    }

    const mappedFollowers = users.map((follower: any) => ({
      id: follower.user_id || follower.id,
      username: follower.screen_name || follower.username,
      display_name: follower.name || follower.display_name,
      bio: follower.bio || follower.description || '',
      followers_count: follower.followers || follower.followers_count || 0,
      verified: follower.verified || false,
      profile_image_url: follower.avatar || follower.profile_image_url,
      protected: follower.protected || false,
    }));

    setFollowers(mappedFollowers);
    setFollowersTaskId(null);
    setLoadingFollowers(false);
  };

  const handleFollowingComplete = (result: any) => {
    console.log('Following loaded:', result);
    let users = [];
    if (result?.users) {
      users = result.users;
    } else if (Array.isArray(result)) {
      users = result;
    }

    const mappedFollowing = users.map((followingUser: any) => ({
      id: followingUser.user_id || followingUser.id,
      username: followingUser.screen_name || followingUser.username,
      display_name: followingUser.name || followingUser.display_name,
      bio: followingUser.bio || followingUser.description || '',
      followers_count: followingUser.followers || followingUser.followers_count || 0,
      verified: followingUser.verified || false,
      profile_image_url: followingUser.avatar || followingUser.profile_image_url,
      protected: followingUser.protected || false,
    }));

    setFollowing(mappedFollowing);
    setFollowingTaskId(null);
    setLoadingFollowing(false);
  };

  const handleTaskError = (error: string) => {
    console.error('Task failed:', error);
    setFollowersTaskId(null);
    setFollowingTaskId(null);
    setLoadingFollowers(false);
    setLoadingFollowing(false);
  };

  useEffect(() => {
    // Load followers by default
    loadFollowers();
  }, []);

  useEffect(() => {
    if (activeTab === 'following' && following.length === 0 && !loadingFollowing && !followingTaskId) {
      loadFollowing();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Search</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* User Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Banner */}
          <div className="relative h-48 md:h-64">
            {user.profile_banner ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${user.profile_banner})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-6">
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.display_name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-gray-500" />
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.display_name}</h1>
                {user.verified && (
                  <span className="text-blue-500 text-xl">✓</span>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">
                  {user.bio}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(user.followers_count)}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(user.following_count)}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(user.tweets || 0)}</div>
                <div className="text-sm text-gray-500">Tweets</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(user.favorites || 0)}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.created_at && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
              )}
              {user.url && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <LinkIcon className="w-4 h-4" />
                  <a href={user.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                    Website
                  </a>
                </div>
              )}
              {user.protected && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <Shield className="w-4 h-4" />
                  <span>Protected Account</span>
                </div>
              )}
              {user.lang && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>Language: {user.lang.toUpperCase()}</span>
                </div>
              )}
              {user.time_zone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Timezone: {user.time_zone}</span>
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            {(user.tweets || 0) > 0 && (user.favorites || 0) > 0 && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Engagement Rate: {(((user.favorites || 0) / (user.tweets || 1)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Average likes per tweet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Followers/Following Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === 'followers'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Followers ({formatNumber(user.followers_count)})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === 'following'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Following ({formatNumber(user.following_count)})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Task Monitors */}
            {followersTaskId && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <TaskMonitor
                  taskId={followersTaskId}
                  onComplete={handleFollowersComplete}
                  onError={handleTaskError}
                />
              </div>
            )}
            {followingTaskId && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <TaskMonitor
                  taskId={followingTaskId}
                  onComplete={handleFollowingComplete}
                  onError={handleTaskError}
                />
              </div>
            )}

            {/* Content based on active tab */}
            {activeTab === 'followers' && (
              <div>
                {loadingFollowers && !followersTaskId ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading followers...</p>
                  </div>
                ) : followers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followers.map((follower) => (
                      <div key={follower.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-start space-x-3">
                          {follower.profile_image_url ? (
                            <img
                              src={follower.profile_image_url}
                              alt={follower.display_name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <h3 className="font-medium text-gray-900 truncate">{follower.display_name}</h3>
                              {follower.verified && <span className="text-blue-500 text-sm">✓</span>}
                              {follower.protected && <Shield className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-gray-500 truncate">@{follower.username}</p>
                            {follower.bio && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{follower.bio}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNumber(follower.followers_count)} followers
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No followers data available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div>
                {loadingFollowing && !followingTaskId ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading following...</p>
                  </div>
                ) : following.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {following.map((followingUser) => (
                      <div key={followingUser.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-start space-x-3">
                          {followingUser.profile_image_url ? (
                            <img
                              src={followingUser.profile_image_url}
                              alt={followingUser.display_name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <h3 className="font-medium text-gray-900 truncate">{followingUser.display_name}</h3>
                              {followingUser.verified && <span className="text-blue-500 text-sm">✓</span>}
                              {followingUser.protected && <Shield className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-gray-500 truncate">@{followingUser.username}</p>
                            {followingUser.bio && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{followingUser.bio}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNumber(followingUser.followers_count)} followers
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No following data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
