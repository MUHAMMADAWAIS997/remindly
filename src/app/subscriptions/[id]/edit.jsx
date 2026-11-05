import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '@/utils/theme';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { SubscriptionForm } from '@/components/SubscriptionForm';

// EditSubscriptionScreen loads an existing subscription by ID and lets the user update it.
// The subscription ID comes from the dynamic route: /subscriptions/[id]/edit
export default function EditSubscriptionScreen() {
  // `id` is the subscription's MongoDB _id, extracted from the URL
  const { id } = useLocalSearchParams();

  // `subscription` holds the full subscription data fetched from the API
  const [subscription, setSubscription] = useState(null);
  // `fetching` is true while the initial data load is in progress
  const [fetching, setFetching] = useState(true);

  const { fetchSubscriptionById, updateSubscription } = useSubscriptions();

  // Load the subscription data when the screen mounts (or when `id` changes).
  useEffect(() => {
    const loadDetail = async () => {
      setFetching(true);
      if (id) {
        const sub = await fetchSubscriptionById(id);
        setSubscription(sub);
      }
      setFetching(false);
    };
    loadDetail();
  }, [id]);

  // handleSubmit is called by SubscriptionForm when the user submits valid changes.
  // `values` contains all validated form fields.
  const handleSubmit = async (values) => {
    if (!id) return;
    const success = await updateSubscription(id, values);
    if (success) {
      // Go back to the detail screen on success
      router.back();
    } else {
      // Show an error toast if the API call failed
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update subscription. Please try again.',
      });
    }
  };

  // Show a loading spinner while the existing subscription data is being fetched
  if (fetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* KeyboardAvoidingView prevents the keyboard from covering the form inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header with back button and screen title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Subscription</Text>
          {/* Spacer keeps the title visually centered */}
          <View style={{ width: 24 }} />
        </View>

        {/* The shared form is pre-filled with the existing subscription's values.
            When subscription is null (not found), defaultValues is undefined and
            the form renders with empty default values. */}
        <SubscriptionForm
          submitLabel="Save Changes"
          defaultValues={
            subscription
              ? {
                  name: subscription.name,
                  category: subscription.category,
                  // amount is stored as a number in the DB; the form expects a string
                  amount: subscription.amount.toString(),
                  billingCycle: subscription.billingCycle || 'monthly',
                  // expiryDate is stored as an ISO string; the form expects a Date object
                  expiryDate: new Date(subscription.expiryDate),
                  notes: subscription.notes,
                }
              : undefined
          }
          onValidSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h3,
  },
});

