import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '@/utils/storage';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Android emulator uses 10.0.2.2 to reach host machine localhost.
  // For a physical device on the same WiFi, replace with your PC's local IP (e.g. 192.168.x.x).
  // Switch back to the Render URL when deploying the updated backend.
  return 'http://10.0.2.2:5000/api';
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
