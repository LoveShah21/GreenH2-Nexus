import { create } from 'zustand';
import { User } from '@/types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),
  clearAuth: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));