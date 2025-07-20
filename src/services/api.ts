import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  TwitterCredentials,
  TwitterSettings,
  TaskStatus,
  TasksOverview,
  ActiveTasks,
  TasksHistory,
  SearchUsersRequest,
  LoginRequest,
  ApiResponse,
  HealthResponse,
} from '../types/api';

class TwitterScraperAPI {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:8000/api/v1';
  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // Reduced from 30 seconds to 15 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for API key
    this.api.interceptors.request.use((config) => {
      const apiKey = localStorage.getItem('api_key');
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('api_key');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Settings Management
  async saveCredentials(credentials: TwitterCredentials): Promise<ApiResponse<TwitterSettings>> {
    const response: AxiosResponse<ApiResponse<TwitterSettings>> = await this.api.post(
      '/twitter/settings',
      credentials
    );
    return response.data;
  }
  async getCredentials(): Promise<ApiResponse<TwitterSettings[]>> {
    const response: AxiosResponse<ApiResponse<TwitterSettings[]>> = await this.api.get(
      '/twitter/settings'
    );
    return response.data;
  }
  async updateCredentials(id: string, credentials: TwitterCredentials): Promise<ApiResponse<TwitterSettings>> {
    const response: AxiosResponse<ApiResponse<TwitterSettings>> = await this.api.put(
      `/twitter/settings/${id}`,
      credentials
    );
    return response.data;
  }

  async deleteCredentials(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(
      `/twitter/settings/${id}`
    );
    return response.data;
  }

  // Authentication
  async login(request: LoginRequest): Promise<ApiResponse<{ task_id: string }>> {
    const response: AxiosResponse<ApiResponse<{ task_id: string }>> = await this.api.post(
      '/twitter/login',
      request
    );
    return response.data;
  }  // Task Management
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatus>> {
    const response: AxiosResponse<ApiResponse<TaskStatus>> = await this.api.get(
      `/twitter/tasks/${taskId}`,
      { timeout: 10000 } // 10 second timeout for task status requests
    );
    console.log('Task status API response:', response.data);
    return response.data;
  }

  // User Operations
  async searchUsers(request: SearchUsersRequest): Promise<ApiResponse<{ task_id: string }>> {
    const response: AxiosResponse<ApiResponse<{ task_id: string }>> = await this.api.post(
      '/twitter/search/users',
      request
    );
    return response.data;
  }

  async getUserTimeline(
    username: string,
    count: number = 50
  ): Promise<ApiResponse<{ task_id: string }>> {
    const response: AxiosResponse<ApiResponse<{ task_id: string }>> = await this.api.get(
      `/twitter/users/${username}/timeline`,
      { params: { count } }
    );
    return response.data;
  }

  async getUserFollowers(
    username: string,
    count: number = 50
  ): Promise<ApiResponse<{ task_id: string }>> {
    const response: AxiosResponse<ApiResponse<{ task_id: string }>> = await this.api.get(
      `/twitter/users/${username}/followers`,
      { params: { count } }
    );
    return response.data;
  }

  async getUserFollowing(
    username: string,
    count: number = 50
  ): Promise<ApiResponse<{ task_id: string }>> {
    const response: AxiosResponse<ApiResponse<{ task_id: string }>> = await this.api.get(
      `/twitter/users/${username}/following`,
      { params: { count } }
    );
    return response.data;
  }
  // Health Check
  async healthCheck(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await this.api.get(
      '/twitter/health'
    );
    return response.data;
  }

  // Task Management
  async getTasksOverview(): Promise<ApiResponse<TasksOverview>> {
    const response: AxiosResponse<ApiResponse<TasksOverview>> = await this.api.get(
      '/twitter/tasks/'
    );
    return response.data;
  }

  async getActiveTasks(): Promise<ApiResponse<ActiveTasks>> {
    const response: AxiosResponse<ApiResponse<ActiveTasks>> = await this.api.get(
      '/twitter/tasks/active'
    );
    return response.data;
  }

  async getTasksHistory(): Promise<ApiResponse<TasksHistory>> {
    const response: AxiosResponse<ApiResponse<TasksHistory>> = await this.api.get(
      '/twitter/tasks/history'
    );
    return response.data;
  }

  // Set API Key
  setApiKey(apiKey: string): void {
    localStorage.setItem('api_key', apiKey);
  }

  // Get API Key
  getApiKey(): string | null {
    return localStorage.getItem('api_key');
  }

  // Clear API Key
  clearApiKey(): void {
    localStorage.removeItem('api_key');
  }
}

export const twitterAPI = new TwitterScraperAPI();
