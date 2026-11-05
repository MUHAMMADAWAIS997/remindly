import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { SubscriptionCard } from '@/components/SubscriptionCard';

// HistoryScreen shows expired subscriptions.
// Cards are rendered with the `dimmed` prop to visually indicate they are expired.
export default function HistoryScreen() {
  const { subscriptions, isLoading, fetchSubscriptions } = useSubscriptions();

  // loadHistory fetches only expired subscriptions from the API.
  const loadHistory = useCallback(() => {
    fetchSubscriptions('expired', 'All');
  }, [fetchSubscriptions]);

  // Fetch expired subscriptions when the screen first loads.
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Filter to only items whose status is 'Expired' (extra safety check).
  const expiredList = subscriptions.filter((s) => s.statusInfo?.status === 'Expired');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>

        {/* Expired Subscriptions List — pull-to-refresh supported */}
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadHistory} tintColor={theme.colors.primary} />
          }
        >
          {isLoading && expiredList.length === 0 ? (
            // Show a loading spinner on initial load
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : expiredList.length === 0 ? (
            // Empty state when there are no expired subscriptions
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={54} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Nothing here</Text>
              <Text style={styles.emptySubtitle}>All your subscriptions are active.</Text>
            </View>
          ) : (
            // Render dimmed cards for each expired subscription
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

