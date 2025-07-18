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
