import api from './api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  learningStreak?: number;
  points?: number;
  weeklyPoints?: number;
  avatarColor?: string;
  bio?: string;
  preferredDifficulty?: string;
  notificationsEnabled?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ProfileUpdateData {
  name?: string;
  avatarColor?: string;
  bio?: string;
  preferredDifficulty?: string;
  notificationsEnabled?: boolean;
}

export const authApi = {
  signup: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', { email, password, name });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = authApi.getToken();
      if (!token) return null;

      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local storage with latest user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data.user;
    } catch (error) {
      authApi.logout();
      return null;
    }
  },
  updateProfile: async (data: ProfileUpdateData): Promise<{ success: boolean; user: User; message?: string }> => {
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put('/auth/password', { currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to change password' };
    }
  },
};

// Handle 401 and 403 errors (unauthorized/forbidden) - this interceptor runs after api.ts interceptors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/signup');

      // Don't clear token or redirect if:
      // 1. We're on auth pages (login/signup)
      // 2. The error is from login/signup endpoints (user entered wrong credentials)
      // This prevents redirect loops and allows login errors to be shown to the user
      if (!isAuthPage && !isAuthEndpoint) {
        // Clear invalid token
        authApi.logout();
        // Show error message only if not a silent validation failure
        if (error.config?.url !== '/auth/me') {
          if (error.response?.data?.error) {
            toast.error(error.response.data.error);
          } else {
            toast.error('Session expired. Please login again.');
          }
        }
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

