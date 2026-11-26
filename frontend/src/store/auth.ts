import { create } from 'zustand';
import { api, TOKEN_KEY } from '@/lib/api';
import { resetSocket } from '@/lib/socket';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return set({ loading: false });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, loading: false });
    }
  },

  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    resetSocket();
    set({ user, loading: false });
  },

  refresh: async () => {
    const { data } = await api.get('/auth/me');
    set({ user: data.user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    resetSocket();
    set({ user: null });
  },
}));
