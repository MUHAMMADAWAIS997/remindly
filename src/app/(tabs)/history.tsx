import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { SubscriptionCard } from '@/components/SubscriptionCard';

export default function HistoryScreen() {
  const { subscriptions, isLoading, fetchSubscriptions } = useSubscriptionStore();

  const loadHistory = useCallback(() => {
    fetchSubscriptions('expired', 'All');
  }, [fetchSubscriptions]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const expiredList = subscriptions.filter(s => s.statusInfo?.status === 'Expired');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscription History</Text>
          <Text style={styles.subtitle}>Records of past and expired services</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadHistory} tintColor={theme.colors.primary} />
          }
        >
          {isLoading && expiredList.length === 0 ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : expiredList.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={54} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Expired Subscriptions</Text>
              <Text style={styles.emptySubtitle}>All your tracked subscriptions are currently active!</Text>
            </View>
          ) : (
            expiredList.map((item) => <SubscriptionCard key={item._id} item={item} dimmed />)
          )}
        </ScrollView>
      </View>
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
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
  },
  subtitle: {
    ...theme.typography.bodySm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  listContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    flexGrow: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    ...theme.typography.bodySm,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl,
  },
});
