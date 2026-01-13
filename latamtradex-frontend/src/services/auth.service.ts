import { apiClient } from '@/lib/api-client';
import type { RegisterData, LoginData, AuthResponse, ApiResponse } from '@/types';

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  saveAuth(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
