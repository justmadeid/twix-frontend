import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TimelineData, Tweet, TimelineResult } from '../types/api';
import TaskMonitor from './TaskMonitor';
import { MessageCircle, Heart, Repeat2, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export const TimelinePanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [tweetCount] = useState(50); // Fixed to 50 tweets
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convert the new API response format to the expected TimelineData format
  const convertTimelineResult = (result: TimelineResult): TimelineData => {
    const { timelines, metadata } = result;
    
    // Ensure we have valid data
    if (!timelines || !Array.isArray(timelines) || !metadata) {
      throw new Error('Invalid timeline data structure');
    }
    
    // Create a mock user object from the first tweet or metadata
    const firstTweet = timelines[0];
    const mockUser = {
      id: firstTweet?.user_id || '0',
      username: metadata.username,
      display_name: firstTweet?.name || metadata.username,
      bio: '',
      followers_count: 0,
      following_count: 0,
      verified: false,
      profile_image_url: '',
      created_at: new Date().toISOString(),
    };

    // Convert timeline tweets to the expected Tweet format
    const convertedTweets: Tweet[] = timelines.map(timeline => ({
      id: timeline.id || '',
      text: timeline.tweets || '',
      author: {
        id: timeline.user_id || '0',
        username: timeline.screen_name || '',
        display_name: timeline.name || 'Unknown User',
        bio: '',
        followers_count: 0,
        following_count: 0,
        verified: false,
        profile_image_url: '', // API doesn't provide this
        created_at: new Date().toISOString(),
      },
      created_at: timeline.date || new Date().toISOString(),
      retweet_count: timeline.retweet || 0,
      like_count: timeline.likes || 0,
      reply_count: timeline.replies || 0,
      is_retweet: false,
      media_urls: timeline.link_media ? [timeline.link_media] : [],
      link: timeline.link || '', // Include the tweet link
    }));

    return {
      user: mockUser,
      tweets: convertedTweets,
      total_count: metadata.total_tweets || convertedTweets.length,
      fetched_at: metadata.analysis_period || new Date().toISOString(),
    };
  };

  const handleFetchTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setIsLoading(true);
      setTimelineData(null);
      const response = await twitterAPI.getUserTimeline(username, tweetCount);
      setCurrentTaskId(response.data.task_id);
    } catch (error) {
      console.error('Timeline fetch failed:', error);
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (result: any) => {
    console.log('Timeline fetch completed:', result);
    try {
      // Check if result has the new structure
      if (result && result.timelines && result.metadata) {
        console.log('Converting new API format...');
        const convertedData = convertTimelineResult(result);
        setTimelineData(convertedData);
      } else if (result && result.user && result.tweets) {
        // Old format - use directly
        console.log('Using legacy API format...');
        setTimelineData(result);
      } else {
        console.error('Unknown result format:', result);
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error processing timeline data:', error);
      // Show a user-friendly error or try to handle gracefully
      alert('Error processing timeline data. Please try again.');
    }
    setCurrentTaskId(null);
    setIsLoading(false);
  };

  const handleTaskError = (error: string) => {
    console.error('Timeline fetch failed:', error);
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
    <div className="space-y-6">
      {/* Header Container - Separate Bento Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/20">
            <MessageCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Timeline</h2>
            <p className="text-sm text-gray-500 mt-1">Fetch recent tweets from any user</p>
          </div>
          {/* Timeline stats */}
          {timelineData && (
            <div className="ml-auto hidden sm:block">
              <div className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-medium rounded-full">
                {timelineData.tweets.length} tweet{timelineData.tweets.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Bento Grid Form Layout */}
      <form onSubmit={handleFetchTimeline} className="mb-8">
        <div className="grid grid-cols-12 gap-4">
          {/* Username Input - Enhanced styling */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/20 p-6 h-full hover:from-blue-500/10 hover:to-blue-500/15 hover:border-blue-500/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-hover:text-blue-500 transition-colors duration-300">
                    Username
                  </label>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:border-blue-500/30 text-sm placeholder-gray-400 shadow-sm focus:shadow-md"
                  placeholder="Enter username (without @)..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Fetch Button - Enhanced with animation */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 h-full hover:bg-white/90 hover:border-blue-500/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-300">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-hover:text-blue-500 transition-colors duration-300">
                    Action
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="w-full px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-500/90 text-white rounded-xl hover:from-blue-500/90 hover:to-blue-500 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm font-bold shadow-lg backdrop-blur-sm border border-blue-500/20"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Fetching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Fetch Timeline</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Task Monitor Section */}
      {currentTaskId && (
        <div className="mb-8 p-4 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}

      {/* Loading Skeleton for Timeline */}
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

          {/* Data Visualization Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-200 rounded-xl">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <div className="h-5 bg-gray-300 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <div className="h-5 bg-gray-300 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-lg">
                    <div className="h-5 bg-gray-300 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-200 rounded-xl">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-40"></div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tweet Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {Array.from({ length: tweetCount }, (_, index) => {
              const isLargeSkeleton = index === 0 && tweetCount > 2;
              const skeletonClass = isLargeSkeleton ? "md:col-span-2 md:row-span-2" : "";

              return (
                <div
                  key={index}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 animate-pulse ${skeletonClass}`}
                >
                  {/* Header skeleton */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>

                  {/* Content skeleton */}
                  <div className="space-y-3 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    {isLargeSkeleton && (
                      <>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </>
                    )}
                  </div>

                  {/* Stats skeleton */}
                  <div className={`grid gap-2 ${isLargeSkeleton ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-6"></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-6"></div>
                    </div>
                    {isLargeSkeleton && (
                      <>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-6"></div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-6"></div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Date skeleton */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Data Visualization - Enhanced Bento Cards */}
      {timelineData && (
        <div className="space-y-6">
          {/* User Stats Cards - Separate Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Fetched Tweets Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-2xl border border-emerald-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-300">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors duration-300">Fetched</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-700 mb-1">{timelineData.tweets.length}</p>
                <p className="text-xs text-emerald-600">tweets</p>
              </div>
            </div>

            {/* Total Tweets Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Total</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700 mb-1">{formatNumber(timelineData.total_count)}</p>
                <p className="text-xs text-blue-600">tweets</p>
              </div>
            </div>

            {/* Average Engagement Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Avg Likes</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700 mb-1">
                  {timelineData.tweets.length > 0 
                    ? formatNumber(Math.round(timelineData.tweets.reduce((sum, tweet) => sum + tweet.like_count, 0) / timelineData.tweets.length))
                    : 0
                  }
                </p>
                <p className="text-xs text-purple-600">per tweet</p>
              </div>
            </div>

            {/* Fetch Date Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm rounded-2xl border border-orange-100/50 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors duration-300">
                    <Repeat2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 group-hover:text-orange-700 transition-colors duration-300">Fetched</h3>
                </div>
                <p className="text-2xl font-bold text-orange-700 mb-1">{format(new Date(timelineData.fetched_at), 'MMM d')}</p>
                <p className="text-xs text-orange-600">{format(new Date(timelineData.fetched_at), 'yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Data Visualizations - Enhanced cards with potential for hashtags/mentions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tweet Activity Visualization */}
            <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tweet Activity</h3>
              </div>
              <div className="space-y-4">
                {/* Engagement breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatNumber(timelineData.tweets.reduce((sum, tweet) => sum + tweet.like_count, 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">Total Retweets</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatNumber(timelineData.tweets.reduce((sum, tweet) => sum + tweet.retweet_count, 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">Total Replies</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatNumber(timelineData.tweets.reduce((sum, tweet) => sum + tweet.reply_count, 0))}
                    </p>
                  </div>
                </div>
                {/* Most engaged tweet */}
                {timelineData.tweets.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Most Engaged Tweet</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {timelineData.tweets.reduce((prev, current) => 
                        (prev.like_count + prev.retweet_count) > (current.like_count + current.retweet_count) ? prev : current
                      ).text}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Media & Links Visualization */}
            <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-violet-100/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <ExternalLink className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Content Analysis</h3>
              </div>
              <div className="space-y-4">
                {/* Content stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">With Media</p>
                    <p className="text-xl font-bold text-violet-600">
                      {timelineData.tweets.filter(tweet => tweet.media_urls && tweet.media_urls.length > 0).length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">With Links</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {timelineData.tweets.filter(tweet => tweet.link && tweet.link.trim() !== '').length}
                    </p>
                  </div>
                </div>
                {/* Average text length */}
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Average Tweet Length</p>
                  <p className="text-2xl font-bold text-violet-600">
                    {timelineData.tweets.length > 0 
                      ? Math.round(timelineData.tweets.reduce((sum, tweet) => sum + tweet.text.length, 0) / timelineData.tweets.length)
                      : 0
                    } characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Tweets - Enhanced Bento Grid */}
          <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Tweets</h3>
              </div>
              <div className="text-sm text-gray-500">
                @{timelineData.user.username}
              </div>
            </div>
            
            <div className="grid grid-fit-content grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[1000px] overflow-y-auto custom-scrollbar"
                 style={{ gridAutoRows: 'max-content' }}>
              {timelineData.tweets.map((tweet: Tweet, index: number) => {
                // Content-aware bento grid sizing - OPTIMIZED to minimize empty space
                // Only enlarges cards when content truly warrants more space
                const getBentoSize = (index: number, total: number, tweet: Tweet) => {
                  const hasMedia = tweet.media_urls && tweet.media_urls.length > 0;
                  const hasMultipleMedia = tweet.media_urls && tweet.media_urls.length > 1;
                  const isVeryLongTweet = tweet.text.length > 300;
                  const isLongTweet = tweet.text.length > 200;
                  const isMediumTweet = tweet.text.length > 120;
                  const isHighEngagement = (tweet.like_count + tweet.retweet_count + tweet.reply_count) > 500;
                  const isMediumEngagement = (tweet.like_count + tweet.retweet_count + tweet.reply_count) > 100;
                  
                  // Calculate content density score
                  const contentScore = 
                    (hasMultipleMedia ? 3 : hasMedia ? 2 : 0) +
                    (isVeryLongTweet ? 3 : isLongTweet ? 2 : isMediumTweet ? 1 : 0) +
                    (isHighEngagement ? 2 : isMediumEngagement ? 1 : 0);
                  
                  // First card - only enlarge if it has significant content
                  if (index === 0 && total > 3 && contentScore >= 4) {
                    return "md:col-span-2 md:row-span-2";
                  }
                  if (index === 0 && total > 3 && contentScore >= 2) {
                    return "md:col-span-2";
                  }
                  
                  // High content density gets larger cards
                  if (contentScore >= 5) {
                    if (index % 5 === 0 && index > 0) {
                      return "md:col-span-2 md:row-span-2";
                    }
                    return "md:col-span-2";
                  }
                  
                  // Medium-high content density gets wide cards
                  if (contentScore >= 3 && index % 7 === 0 && index > 0) {
                    return "lg:col-span-2";
                  }
                  
                  // Multiple media always gets at least wide treatment
                  if (hasMultipleMedia) {
                    return "md:col-span-2";
                  }
                  
                  // Very long tweets without media get tall cards for readability
                  if (isVeryLongTweet && !hasMedia && index % 8 === 0 && index > 0) {
                    return "row-span-2";
                  }
                  
                  return "";
                };

                const isLargeCard = index === 0 && timelineData.tweets.length > 3 && 
                  ((tweet.media_urls?.length ?? 0) > 0 || tweet.text.length > 200 || 
                   (tweet.like_count + tweet.retweet_count + tweet.reply_count) > 100);
                const bentoClass = getBentoSize(index, timelineData.tweets.length, tweet);
                
                return (
                  <div 
                    key={tweet.id} 
                    className={`group relative overflow-hidden tweet-card card-compact content-fit p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 hover:bg-white/95 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up ${bentoClass}`}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      // Remove fixed min-heights and let content determine the height
                    }}
                  >
                    {/* Tweet Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        {tweet.author.profile_image_url ? (
                          <img
                            src={tweet.author.profile_image_url}
                            alt={tweet.author.display_name}
                            className={`rounded-2xl border-2 border-white shadow-sm group-hover:border-blue-300 transition-all duration-300 ${isLargeCard ? 'w-16 h-16' : 'w-12 h-12'}`}
                          />
                        ) : (
                          <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm group-hover:border-blue-300 transition-all duration-300 ${isLargeCard ? 'w-16 h-16' : 'w-12 h-12'}`}>
                            <User className={`text-gray-500 ${isLargeCard ? 'w-8 h-8' : 'w-6 h-6'}`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300 ${isLargeCard ? 'text-base' : 'text-sm'}`}>
                            {tweet.author.display_name}
                          </h4>
                          {tweet.author.username && (
                            <span className={`text-gray-500 truncate group-hover:text-blue-500 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                              @{tweet.author.username}
                            </span>
                          )}
                        </div>
                        <span className={`text-gray-500 group-hover:text-blue-400 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                          {format(new Date(tweet.created_at), isLargeCard ? 'MMM d, yyyy • h:mm a' : 'MMM d • h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tweet Content */}
                    <div className="tweet-content mb-3">
                      <p className={`text-gray-900 leading-relaxed whitespace-pre-wrap break-words group-hover:text-gray-800 transition-colors duration-300 ${
                        isLargeCard ? 'text-base' : 'text-sm'
                      } ${
                        // Smart content clamping - only clamp when necessary to prevent empty space
                        isLargeCard ? '' : // No clamping for large cards
                        bentoClass.includes('col-span-2') && bentoClass.includes('row-span-2') ? '' : // No clamping for 2x2 cards
                        bentoClass.includes('col-span-2') && tweet.text.length > 400 ? 'line-clamp-6' : // Wide cards with very long text
                        bentoClass.includes('row-span-2') ? '' : // No clamping for tall cards (they have vertical space)
                        bentoClass.includes('col-span-2') && tweet.text.length > 250 ? 'line-clamp-4' : // Wide cards with long text
                        tweet.text.length > 300 ? 'line-clamp-4' : // Very long tweets in normal cards
                        tweet.text.length > 180 ? 'line-clamp-3' : // Long tweets get minimal clamping
                        '' // Short and medium tweets no clamping to avoid empty space
                      }`}>
                        {tweet.text}
                      </p>
                    </div>
                    
                    {/* Media Display */}
                    {tweet.media_urls && tweet.media_urls.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {tweet.media_urls.map((mediaUrl, mediaIndex) => {
                          const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') || mediaUrl.includes('video');
                          return (
                            <div key={mediaIndex} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 group-hover:border-gray-300 transition-all duration-300">
                              {isVideo ? (
                                <video 
                                  controls 
                                  className={`w-full object-cover ${isLargeCard ? 'max-h-96' : 'max-h-64'}`}
                                  poster={mediaUrl.replace(/\.(mp4|mov)$/, '.jpg')}
                                >
                                  <source src={mediaUrl} type="video/mp4" />
                                  <div className="p-4 text-center text-gray-500 text-sm">
                                    Your browser does not support video playback.
                                  </div>
                                </video>
                              ) : (
                                <img 
                                  src={mediaUrl} 
                                  alt="Tweet media" 
                                  className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${isLargeCard ? 'max-h-96' : 'max-h-64'}`}
                                  onError={(e) => {
                                    e.currentTarget.parentElement!.style.display = 'none';
                                  }}
                                  onClick={() => window.open(mediaUrl, '_blank')}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Enhanced Tweet Stats */}
                    <div className="engagement-stats flex items-center justify-between text-gray-500 transition-colors duration-300 mt-auto pt-2">
                      <div className={`flex items-center ${isLargeCard ? 'space-x-4' : 'space-x-2'}`}>
                        <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer group/stat">
                          <MessageCircle className={`${isLargeCard ? 'w-5 h-5' : 'w-4 h-4'} group-hover/stat:scale-110 transition-transform duration-200`} />
                          <span className={`font-medium group-hover/stat:font-semibold transition-all duration-200 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>{formatNumber(tweet.reply_count)}</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-green-600 transition-colors cursor-pointer group/stat">
                          <Repeat2 className={`${isLargeCard ? 'w-5 h-5' : 'w-4 h-4'} group-hover/stat:scale-110 transition-transform duration-200`} />
                          <span className={`font-medium group-hover/stat:font-semibold transition-all duration-200 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>{formatNumber(tweet.retweet_count)}</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-red-600 transition-colors cursor-pointer group/stat">
                          <Heart className={`${isLargeCard ? 'w-5 h-5' : 'w-4 h-4'} group-hover/stat:scale-110 transition-transform duration-200`} />
                          <span className={`font-medium group-hover/stat:font-semibold transition-all duration-200 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>{formatNumber(tweet.like_count)}</span>
                        </div>
                        {tweet.link && (
                          <button
                            onClick={() => window.open(tweet.link, '_blank')}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer p-1 rounded group/stat"
                            title="View original tweet"
                          >
                            <ExternalLink className={`${isLargeCard ? 'w-5 h-5' : 'w-4 h-4'} group-hover/stat:scale-110 transition-transform duration-200`} />
                            {isLargeCard && <span className="text-sm font-medium group-hover/stat:font-semibold transition-all duration-200">View</span>}
                          </button>
                        )}
                      </div>
                      {tweet.created_at && (
                        <div className={`text-gray-400 group-hover:text-gray-500 transition-colors duration-300 ${isLargeCard ? 'text-sm' : 'text-xs'}`}>
                          {format(new Date(tweet.created_at), 'h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
