import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '@/utils/theme';
import { useSubscriptionStore, SubscriptionItem } from '@/store/useSubscriptionStore';
import { SubscriptionForm, SubscriptionFormValues } from '@/components/SubscriptionForm';

export default function EditSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null);
  const [fetching, setFetching] = useState(true);

  const { fetchSubscriptionById, updateSubscription } = useSubscriptionStore();

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

  const handleSubmit = async (values: SubscriptionFormValues) => {
    if (!id) return;
    const success = await updateSubscription(id, values);
    if (success) {
      router.back();
    } else {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update subscription. Please try again.' });
    }
  };

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Subscription</Text>
          <View style={{ width: 24 }} />
        </View>
        <SubscriptionForm
          submitLabel="Save Changes"
          defaultValues={subscription ? {
            name: subscription.name,
            category: subscription.category,
            amount: subscription.amount.toString(),
            expiryDate: new Date(subscription.expiryDate),
            notes: subscription.notes,
          } : undefined}
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
