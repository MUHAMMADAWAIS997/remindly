// API service for communicating with the Remindly backend server.
// Uses the standard JavaScript Fetch API instead of external libraries.

import { Platform } from 'react-native';
import { storage } from '@/utils/storage';

// Determine the server base URL depending on the platform.
// - Web: connects to http://localhost:5000/api
// - Android Emulator: connects to http://10.0.2.2:5000/api (special IP that maps to your PC's localhost)
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  return 'http://10.0.2.2:5000/api';
};

// Core request helper using the native Fetch API
async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  // Ensure the endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  // Start with default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Automatically attach the JWT auth token if user is logged in
  try {
    const token = await storage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error fetching token from storage:', err);
  }

  // Format request body if provided
  let body = options.body;
  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
  }

  // Set up a 60-second request timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body,
      signal: controller.signal,
    });

    // Parse JSON response body if present
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        data = null;
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    // Handle HTTP error statuses (like 400, 401, 404, 500)
    // We attach error.response to match the expected format in our stores
    if (!response.ok) {
      const error = new Error(
        data?.error || data?.message || `Request failed with status ${response.status}`
      );
      error.response = {
        status: response.status,
        data: data,
      };
      throw error;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Convenient HTTP method helpers (api.get, api.post, api.put, api.delete)
export const api = {
  get: (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post: (endpoint, data, options = {}) => {
    return request(endpoint, { ...options, method: 'POST', body: data });
  },

  put: (endpoint, data, options = {}) => {
    return request(endpoint, { ...options, method: 'PUT', body: data });
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};

