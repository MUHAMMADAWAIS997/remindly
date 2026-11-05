// Subscription Context for Remindly
// Manages the list of subscriptions, dashboard summary, and CRUD operations.
// Replaces Zustand with React's built-in createContext, useContext, and useState.

import React, { createContext, useContext, useState } from 'react';
import Toast from 'react-native-toast-message';
import { api } from '@/services/api';
import {
  scheduleSubscriptionNotifications,
  cancelSubscriptionNotifications,
  scheduleAllSubscriptionNotifications,
} from '@/utils/notifications';

// Create the Context with a default null value
export const SubscriptionContext = createContext(null);

// Provider component that wraps the application to share subscription state
export function SubscriptionProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Fetch the dashboard summary statistics
  const fetchSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const response = await api.get('/subscriptions/summary/dashboard');
      if (response.data?.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error('Fetch summary error:', error);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Fetch the list of subscriptions with optional status and category filters
  const fetchSubscriptions = async (statusFilter = '', category = 'All') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('statusFilter', statusFilter);
      }
      if (category && category !== 'All') {
        params.append('category', category);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/subscriptions${queryString}`);
      if (response.data?.success) {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
      Toast.show({
        type: 'error',
        text1: 'Fetch Error',
        text2: 'Failed to load subscriptions.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch details for a single subscription by ID
  const fetchSubscriptionById = async (id) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/subscriptions/${id}`);
      if (response.data?.success) {
        setCurrentSubscription(response.data.data);
        setIsLoading(false);
        return response.data.data;
      }
      setIsLoading(false);
      return null;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subscription details.',
      });
      setIsLoading(false);
      return null;
    }
  };

  // Add a new subscription
  const addSubscription = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/subscriptions', data);

      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `Successfully added ${data.name}.`,
      });

      // Refresh dashboard summary and subscription list
      await fetchSummary();
      const response = await api.get('/subscriptions');
      if (response.data?.success) {
        const freshList = response.data.data;
        setSubscriptions(freshList);

        // Schedule renewal notification alerts
        const activeSubs = freshList.filter((s) => s.statusInfo?.status !== 'Expired');
        scheduleAllSubscriptionNotifications(activeSubs).catch(() => {});
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to add subscription.';

      Toast.show({
        type: 'error',
        text1: 'Error adding subscription',
        text2: message,
      });

      setIsLoading(false);
      return false;
    }
  };

  // Update an existing subscription
  const updateSubscription = async (id, data) => {
    setIsLoading(true);
    try {
      await api.put(`/subscriptions/${id}`, data);

      Toast.show({
        type: 'success',
        text1: 'Updated!',
        text2: 'Subscription updated successfully.',
      });

      // Refresh dashboard summary and subscription list
      await fetchSummary();
      const response = await api.get('/subscriptions');
      if (response.data?.success) {
        const freshList = response.data.data;
        setSubscriptions(freshList);

        // Update scheduled notifications for this specific subscription
        const updated = freshList.find((s) => s._id === id);
        if (updated) {
          scheduleSubscriptionNotifications(updated).catch(() => {});
        }
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to update subscription.';

      Toast.show({
        type: 'error',
        text1: 'Update Error',
        text2: message,
      });

      setIsLoading(false);
      return false;
    }
  };

  // Delete a subscription
  const deleteSubscription = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      cancelSubscriptionNotifications(id).catch(() => {});

      Toast.show({
        type: 'info',
        text1: 'Deleted',
        text2: 'Subscription record removed.',
      });

      await fetchSummary();
      const response = await api.get('/subscriptions');
      if (response.data?.success) {
        setSubscriptions(response.data.data);
      }

      return true;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Delete Error',
        text2: 'Failed to delete subscription.',
      });
      return false;
    }
  };

  const contextValue = {
    subscriptions,
    currentSubscription,
    summary,
    isLoading,
    isSummaryLoading,
    fetchSummary,
    fetchSubscriptions,
    fetchSubscriptionById,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Simple custom hook to consume the SubscriptionContext in any screen
export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}

