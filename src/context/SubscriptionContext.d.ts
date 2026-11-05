import React from 'react';

export interface SubscriptionItem {
  _id: string;
  name: string;
  category: 'Entertainment' | 'Education' | 'Health' | 'Utilities' | 'Finance' | 'Other';
  startDate: string;
  expiryDate: string;
  amount: number;
  billingCycle?: 'daily' | 'weekly' | 'monthly' | 'yearly';
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

export interface SubscriptionContextType {
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

export declare const SubscriptionContext: React.Context<SubscriptionContextType | null>;
export declare function SubscriptionProvider(props: { children: React.ReactNode }): React.JSX.Element;
export declare function useSubscriptions(): SubscriptionContextType;
