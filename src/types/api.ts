// API Types
export interface TwitterCredentials {
  credential_name: string;
  username: string;
  password: string;
}

export interface TwitterSettings {
  id: string;
  credential_name: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface TaskStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  result?: any;
  error?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
}

// Task Overview Types
export interface TasksOverview {
  active_tasks: TaskStatus[];
  scheduled_tasks: TaskStatus[];
  registered_tasks: string[];
  worker_stats: {
    [key: string]: {
      pool: {
        implementation: string;
        'max-concurrency': number;
        processes: number[];
        'max-tasks-per-child': number;
        'put-guarded-by-semaphore': boolean;
        timeouts: number[];
        writes: {
          total: number;
          avg: string;
          all: string;
          raw: string;
          strategy: string;
          inqueues: {
            total: number;
            active: number;
          };
        };
      };
      total: any;
      rusage: {
        utime: number;
        stime: number;
        maxrss: number;
        ixrss: number;
        idrss: number;
        isrss: number;
        minflt: number;
        majflt: number;
        nswap: number;
        inblock: number;
        oublock: number;
        msgsnd: number;
        msgrcv: number;
        nsignals: number;
        nvcsw: number;
        nivcsw: number;
      };
      clock: string;
    };
  };
  summary: {
    active_count: number;
    scheduled_count: number;
    workers_count: number;
  };
}

export interface ActiveTasks {
  count: number;
  tasks: TaskStatus[];
}

export interface TasksHistory {
  completed: number;
  failed: number;
  total: number;
  recent_tasks: TaskStatus[];
}

export interface TwitterUser {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  verified: boolean;
  profile_image_url?: string;
  created_at: string;
  // Additional comprehensive fields from API
  tweets?: number;
  favorites?: number;
  location?: string;
  profile_banner?: string;
  profile_banner_url?: string;
  url?: string;
  description?: string;
  statuses_count?: number;
  favourites_count?: number;
  listed_count?: number;
  protected?: boolean;
  default_profile?: boolean;
  default_profile_image?: boolean;
  geo_enabled?: boolean;
  lang?: string;
  time_zone?: string;
  utc_offset?: number;
  profile_text_color?: string;
  profile_link_color?: string;
  profile_sidebar_fill_color?: string;
  profile_sidebar_border_color?: string;
  profile_background_color?: string;
  profile_background_image_url?: string;
  profile_background_tile?: boolean;
  profile_use_background_image?: boolean;
}

export interface TwitterFollow {
  id: string;
  username: string;
  name: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  followers: number;
  following: number;
  blue_verified: boolean;
  profile_image_url_https?: string;
  created_at: string;
  // Additional comprehensive fields from API
  tweets?: number;
  favorites?: number;
  location?: string;
  profile_banner?: string;
  profile_banner_url?: string;
  url?: string;
  description?: string;
  statuses_count?: number;
  favourites_count?: number;
  listed_count?: number;
  protected?: boolean;
  default_profile?: boolean;
  default_profile_image?: boolean;
  geo_enabled?: boolean;
  lang?: string;
  time_zone?: string;
  utc_offset?: number;
  profile_text_color?: string;
  profile_link_color?: string;
  profile_sidebar_fill_color?: string;
  profile_sidebar_border_color?: string;
  profile_background_color?: string;
  profile_background_image_url?: string;
  profile_background_tile?: boolean;
  profile_use_background_image?: boolean;
}

export interface Tweet {
  id: string;
  text: string;
  author: TwitterUser;
  created_at: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  is_retweet: boolean;
  media_urls?: string[];
  link?: string; // Link to the original tweet
}

// New timeline structure based on actual API response
export interface TimelineTweet {
  id: string;
  user_id: string;
  date: string;
  tweets: string; // The tweet text content
  screen_name: string;
  name: string;
  profile_image_url?: string;
  retweet: number;
  replies: number;
  link_media?: string;
  likes: number;
  link: string;
  views: number;
  quote: number;
  engagement: number;
  hashtags: string[];
  mentions: string[];
  source: string;
}

export interface TimelineMetadata {
  username: string;
  total_tweets: number;
  analysis_period: string;
  execution_time: number;
  cached: boolean;
}

export interface MentionStats {
  user_mention: string;
  count: number;
  percentage: number;
}

export interface TimelineResult {
  timelines: TimelineTweet[];
  hashtags: string[];
  mentions: MentionStats[];
  metadata: TimelineMetadata;
}

export interface TimelineData {
  user: TwitterUser;
  tweets: Tweet[];
  total_count: number;
  fetched_at: string;
}

export interface SearchUsersRequest {
  name: string;
  limit?: number;
}

export interface LoginRequest {
  credential_name: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  task_id?: string;
}

// Health Check Types
export interface HealthService {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  response_time_ms: number;
  last_check: string;
  details: {
    [key: string]: any;
  };
}

export interface HealthSystem {
  uptime_seconds: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  disk_usage_percent: number;
  python_version: string;
  application_version: string;
}

export interface HealthDetails {
  total_services_checked: number;
  healthy_services: number;
  degraded_services: number;
  unhealthy_services: number;
  environment: string;
  debug_mode: boolean;
  api_version: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    overall_health: string;
    services: HealthService[];
    system: HealthSystem;
    details: HealthDetails;
    response_time_ms: number;
  };
}
