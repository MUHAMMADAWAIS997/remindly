import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { api } from '@/services/api';
import {
  scheduleSubscriptionNotifications,
  cancelSubscriptionNotifications,
  scheduleAllSubscriptionNotifications,
} from '@/utils/notifications';

export interface SubscriptionItem {
  _id: string;
  name: string;
  category: 'Entertainment' | 'Education' | 'Health' | 'Utilities' | 'Finance' | 'Other';
  startDate: string;
  expiryDate: string;
  amount: number;
  notes?: string;
  statusInfo: {
    status: 'Active' | 'Expiring Soon' | 'Expired';
    daysLeft: number;
  };
}

export interface DashboardSummary {
  totalActive: number;
  totalExpired: number;
  upcomingRenewals: number;
  totalMonthlyOutflow: number;
  upcomingList: SubscriptionItem[];
}

interface SubscriptionState {
  subscriptions: SubscriptionItem[];
  currentSubscription: SubscriptionItem | null;
  summary: DashboardSummary | null;
  isLoading: boolean;
  isSummaryLoading: boolean;

  fetchSummary: () => Promise<void>;
  fetchSubscriptions: (statusFilter?: string, category?: string) => Promise<void>;
  fetchSubscriptionById: (id: string) => Promise<SubscriptionItem | null>;
  addSubscription: (data: Partial<SubscriptionItem>) => Promise<boolean>;
  updateSubscription: (id: string, data: Partial<SubscriptionItem>) => Promise<boolean>;
  deleteSubscription: (id: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  currentSubscription: null,
  summary: null,
  isLoading: false,
  isSummaryLoading: false,

  fetchSummary: async () => {
    set({ isSummaryLoading: true });
    try {
      const response = await api.get('/subscriptions/summary/dashboard');
      if (response.data?.success) {
        set({ summary: response.data.data, isSummaryLoading: false });
      }
    } catch (error: any) {
      console.error('Fetch summary error:', error);
      set({ isSummaryLoading: false });
    }
  },

  fetchSubscriptions: async (statusFilter = '', category = 'All') => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('statusFilter', statusFilter);
      if (category && category !== 'All') params.append('category', category);

      const response = await api.get(`/subscriptions?${params.toString()}`);
      if (response.data?.success) {
        set({ subscriptions: response.data.data, isLoading: false });
      }
    } catch (error: any) {
      console.error('Fetch subscriptions error:', error);
      Toast.show({
        type: 'error',
        text1: 'Fetch Error',
        text2: 'Failed to load subscriptions.',
      });
      set({ isLoading: false });
    }
  },

  fetchSubscriptionById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/subscriptions/${id}`);
      if (response.data?.success) {
        set({ currentSubscription: response.data.data, isLoading: false });
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subscription details.',
      });
      set({ isLoading: false });
      return null;
    }
  },

  addSubscription: async (data) => {
    set({ isLoading: true });
    try {
      await api.post('/subscriptions', data);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `Successfully added ${data.name}.`,
      });
      await get().fetchSummary();
      await get().fetchSubscriptions();
      const activeSubs = get().subscriptions.filter((s) => s.statusInfo?.status !== 'Expired');
      scheduleAllSubscriptionNotifications(activeSubs).catch(() => {});
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to add subscription.';
      Toast.show({
        type: 'error',
        text1: 'Error adding subscription',
        text2: message,
      });
      set({ isLoading: false });
      return false;
    }
  },

  updateSubscription: async (id, data) => {
    set({ isLoading: true });
    try {
      await api.put(`/subscriptions/${id}`, data);
      Toast.show({
        type: 'success',
        text1: 'Updated!',
        text2: `Subscription updated successfully.`,
      });
      await get().fetchSummary();
      await get().fetchSubscriptions();
      const updated = get().subscriptions.find((s) => s._id === id);
      if (updated) scheduleSubscriptionNotifications(updated).catch(() => {});
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update subscription.';
      Toast.show({
        type: 'error',
        text1: 'Update Error',
        text2: message,
      });
      set({ isLoading: false });
      return false;
    }
  },

  deleteSubscription: async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      cancelSubscriptionNotifications(id).catch(() => {});
      Toast.show({
        type: 'info',
        text1: 'Deleted',
        text2: 'Subscription record removed.',
      });
      await get().fetchSummary();
      await get().fetchSubscriptions();
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Delete Error',
        text2: 'Failed to delete subscription.',
      });
      return false;
    }
  },
}));
