import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { api } from '@/services/api';
import { router } from 'expo-router';
import { storage } from '@/utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await storage.setItem('auth_token', token);
      set({ token, user, isLoading: false });

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: `Successfully logged in as ${user.name}`,
      });

      router.replace('/(tabs)/home');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please check credentials.';
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: message,
      });
      set({ isLoading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;

      await storage.setItem('auth_token', token);
      set({ token, user, isLoading: false });

      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: `Welcome to Remindly, ${user.name}!`,
      });

      router.replace('/(tabs)/home');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed.';
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: message,
      });
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore server logout error
    }
    await storage.removeItem('auth_token');
    set({ token: null, user: null });
    Toast.show({
      type: 'info',
      text1: 'Logged out',
      text2: 'You have been safely logged out.',
    });
    router.replace('/login');
  },

  checkAuth: async () => {
    try {
      const token = await storage.getItem('auth_token');
      if (!token) {
        set({ isInitialized: true, isLoading: false });
        return;
      }

      set({ token });
      const response = await api.get('/auth/me');
      if (response.data?.success) {
        set({ user: { id: response.data.data._id, name: response.data.data.name, email: response.data.data.email } });
      }
    } catch (error) {
      await storage.removeItem('auth_token');
      set({ token: null, user: null });
    } finally {
      set({ isInitialized: true, isLoading: false });
    }
  },
}));
