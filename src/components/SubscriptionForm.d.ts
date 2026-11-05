import React from 'react';

export interface SubscriptionFormValues {
  name: string;
  category: 'Entertainment' | 'Education' | 'Health' | 'Utilities' | 'Finance' | 'Other';
  amount: number;
  billingCycle?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  expiryDate: string;
  notes: string;
}

export declare function SubscriptionForm(props: {
  submitLabel: string;
  defaultValues?: {
    name?: string;
    category?: 'Entertainment' | 'Education' | 'Health' | 'Utilities' | 'Finance' | 'Other';
    amount?: string;
    billingCycle?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    expiryDate?: Date;
    notes?: string;
  };
  onValidSubmit: (values: SubscriptionFormValues) => Promise<void>;
}): React.JSX.Element;

