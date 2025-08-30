import { apiClient } from './client';
import { AuthResponse, User } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'analyst';
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    apiClient.setToken(response.token);
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    apiClient.setToken(response.token);
    return response;
  },

  async refresh(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh');
  },

  async logout(): Promise<void> {
    await apiClient.delete('/auth/logout');
    apiClient.clearToken();
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }
};