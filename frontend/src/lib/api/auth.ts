import { apiClient } from './client';
import { AuthResponse, User } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organization: string;
  role?: 'admin' | 'manager' | 'analyst' | 'viewer';
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/auth/login', credentials);
    if (response.data && response.data.tokens) {
      apiClient.setToken(response.data.tokens.accessToken);
      return {
        token: response.data.tokens.accessToken,
        user: response.data.user
      };
    }
    throw new Error('Invalid response format');
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/auth/register', data);
    if (response.data && response.data.tokens) {
      apiClient.setToken(response.data.tokens.accessToken);
      return {
        token: response.data.tokens.accessToken,
        user: response.data.user
      };
    }
    throw new Error('Invalid response format');
  },

  async refresh(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh');
  },

  async logout(): Promise<void> {
    await apiClient.delete('/auth/logout');
    apiClient.clearToken();
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  },

  async updateProfile(data: { firstName: string; lastName: string; organization: string }): Promise<User> {
    const response = await apiClient.put<any>('/auth/profile', data);
    return response.data || response;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put('/auth/change-password', data);
  }
};