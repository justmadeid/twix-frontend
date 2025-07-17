import React, { useState } from 'react';
import { twitterAPI } from '../services/api';
import { TimelineData, Tweet } from '../types/api';
import TaskMonitor from './TaskMonitor';
import { MessageCircle, Heart, Repeat2, User } from 'lucide-react';
import { format } from 'date-fns';

export const TimelinePanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [tweetCount, setTweetCount] = useState(50);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setTimelineData(result);
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

  const formatTweetText = (text: string) => {
    if (text.length > 280) {
      return text.substring(0, 280) + '...';
    }
    return text;
  };
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Timeline</h2>
            <p className="text-sm text-gray-500">Fetch recent tweets from any user</p>
          </div>
        </div>
      </div>      <form onSubmit={handleFetchTimeline} className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
            placeholder="Enter username (without @)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Number of Tweets
          </label>
          <select
            value={tweetCount}
            onChange={(e) => setTweetCount(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value={10}>10 tweets</option>
            <option value={25}>25 tweets</option>
            <option value={50}>50 tweets</option>
            <option value={100}>100 tweets</option>
          </select>
        </div>        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Fetching Timeline...</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>Fetch Timeline</span>
            </>
          )}
        </button>
      </form>

      {currentTaskId && (
        <div className="mb-8 p-4 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-100">
          <TaskMonitor
            taskId={currentTaskId}
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}      {timelineData && (
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
            <div className="flex-shrink-0">
              {timelineData.user.profile_image_url ? (
                <img
                  src={timelineData.user.profile_image_url}
                  alt={timelineData.user.display_name}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-lg">{timelineData.user.display_name}</h3>
                {timelineData.user.verified && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">@{timelineData.user.username}</p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
                  {formatNumber(timelineData.user.followers_count)} followers
                </span>
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
                  {formatNumber(timelineData.user.following_count)} following
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Recent Tweets ({timelineData.tweets.length})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-4">
              {timelineData.tweets.map((tweet: Tweet) => (
                <div key={tweet.id} className="p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {tweet.author.profile_image_url ? (
                        <img
                          src={tweet.author.profile_image_url}
                          alt={tweet.author.display_name}
                          className="w-10 h-10 rounded-full border border-white"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-white">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {tweet.author.display_name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          @{tweet.author.username}
                        </span>
                        <span className="text-sm text-gray-400">·</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(tweet.created_at), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-3 leading-relaxed">{formatTweetText(tweet.text)}</p>                      <div className="flex items-center space-x-6 text-gray-500">
                        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{formatNumber(tweet.reply_count)}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Repeat2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{formatNumber(tweet.retweet_count)}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Heart className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{formatNumber(tweet.like_count)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
