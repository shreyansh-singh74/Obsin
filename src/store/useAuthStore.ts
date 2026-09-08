import { create } from 'zustand';
import { GithubUser } from '@/types';

interface AuthState {
  token: string;
  user: GithubUser | null;
  setAuth: (token: string, user: GithubUser | null) => void;
  setToken: (token: string) => void;
  clearToken: () => void;
  /**
   * Self-heal: if a token exists but the user profile is missing
   * (e.g. token set via a path that never fetched /user), fetch it.
   * Safe to call multiple times; no-op when offline or nothing to do.
   */
  hydrateUser: () => Promise<void>;
}

const TOKEN_KEY = 'obsin_gh_token'
const USER_KEY = 'obsin_gh_user';


const getInitialUser = (): GithubUser | null => {
  try {
    const item = localStorage.getItem(USER_KEY);
    return item && item !== 'undefined' ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: getInitialUser(),
  setAuth: (token: string, user: GithubUser | null) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    else {
      localStorage.removeItem(USER_KEY);
    }
    set({ token, user });
  },
  setToken: (token: string) => {
    get().setAuth(token, get().user);
  },
  clearToken: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    set({ token: '', user: null });
  },
  hydrateUser: async () => {
    const { token, user, setAuth } = get();
    if (!token || user) return;
    // Avoid a doomed network round-trip when offline.
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
      const { fetchAuthenticationUser } = await import('@/engine/github/auth');
      const profile = await fetchAuthenticationUser(token);
      setAuth(token, profile);
    } catch (err) {
      console.warn('hydrateUser: could not fetch GitHub profile:', err);
    }
  },
}));
