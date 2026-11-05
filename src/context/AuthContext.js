// Authentication Context for Remindly
// Manages the current logged-in user, JWT authentication token, and login/register/logout actions.
// Uses React's built-in createContext, useContext, and useState for beginner-friendly state management.

import React, { createContext, useContext, useState } from 'react';
import Toast from 'react-native-toast-message';
import { api } from '@/services/api';
import { storage } from '@/utils/storage';

// Create the Context with a default null value
export const AuthContext = createContext(null);

// Provider component that wraps the application to share authentication state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check storage on app launch to see if the user is already logged in
  const checkAuth = async () => {
    try {
      const savedToken = await storage.getItem('auth_token');
      if (!savedToken) {
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      setToken(savedToken);
      const response = await api.get('/auth/me');
      if (response.data?.success) {
        const userData = response.data.data;
        setUser({
          id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name,
          gender: userData.gender,
          email: userData.email,
        });
      }
    } catch (error) {
      // If the token is expired or invalid, clear local storage
      await storage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
    }
  };

  // Log in with email and password
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: loggedInUser } = response.data;

      // Save token to persistent storage
      await storage.setItem('auth_token', receivedToken);

      setToken(receivedToken);
      setUser({
        id: loggedInUser.id,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        name: loggedInUser.name,
        gender: loggedInUser.gender,
        email: loggedInUser.email,
      });
      setIsLoading(false);

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: `Successfully logged in as ${loggedInUser.firstName}`,
      });

      return true;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Login failed. Please check credentials.';

      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: message,
      });

      setIsLoading(false);
      return false;
    }
  };

  // Register a new user account
  const register = async (firstName, lastName, gender, email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        gender,
        email,
        password,
      });
      const { token: receivedToken, user: newUser } = response.data;

      // Save token to persistent storage
      await storage.setItem('auth_token', receivedToken);

      setToken(receivedToken);
      setUser({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        name: newUser.name,
        gender: newUser.gender,
        email: newUser.email,
      });
      setIsLoading(false);

      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: `Welcome to Remindly, ${newUser.firstName}!`,
      });

      return true;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed.';

      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: message,
      });

      setIsLoading(false);
      return false;
    }
  };

  // Log out the current user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignored for graceful local logout
    }

    await storage.removeItem('auth_token');
    setToken(null);
    setUser(null);

    Toast.show({
      type: 'info',
      text1: 'Logged out',
      text2: 'You have been safely logged out.',
    });
  };

  const contextValue = {
    user,
    token,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Simple custom hook to consume the AuthContext in any screen
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

