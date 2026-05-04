import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('aics_token'),
  user: JSON.parse(localStorage.getItem('aics_user') || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('aics_token', token);
    localStorage.setItem('aics_user', JSON.stringify(user));
    set({ token, user });
  },

  setToken: (token) => {
    localStorage.setItem('aics_token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('aics_token');
    localStorage.removeItem('aics_user');
    set({ token: null, user: null });
  },

  isLoggedIn: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',
}));
