import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { api } from '@/services/api';
import { storage } from '@/utils/storage';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  gender: 'Male' | 'Female';
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    gender: 'Male' | 'Female',
    email: string,
    password: string,
  ) => Promise<boolean>;
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
      set({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          gender: user.gender,
          email: user.email,
        },
        isLoading: false,
      });

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: `Successfully logged in as ${user.firstName}`,
      });

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

  register: async (firstName, lastName, gender, email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', { firstName, lastName, gender, email, password });
      const { token, user } = response.data;

      await storage.setItem('auth_token', token);
      set({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          gender: user.gender,
          email: user.email,
        },
        isLoading: false,
      });

      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: `Welcome to Remindly, ${user.firstName}!`,
      });

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
      // Ignored for graceful local logout
    }
    await storage.removeItem('auth_token');
    set({ token: null, user: null });
    Toast.show({
      type: 'info',
      text1: 'Logged out',
      text2: 'You have been safely logged out.',
    });
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
        set({
          user: {
            id: response.data.data._id,
            firstName: response.data.data.firstName,
            lastName: response.data.data.lastName,
            name: response.data.data.name,
            gender: response.data.data.gender,
            email: response.data.data.email,
          },
        });
      }
    } catch (error) {
      await storage.removeItem('auth_token');
      set({ token: null, user: null });
    } finally {
      set({ isInitialized: true, isLoading: false });
    }
  },
}));
