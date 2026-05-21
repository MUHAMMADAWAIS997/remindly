import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '@/utils/storage';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'https://remindly-backend-xyre.onrender.com/api';
  }

  return 'https://remindly-backend-xyre.onrender.com/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token from storage', error);
  }
  return config;
});
