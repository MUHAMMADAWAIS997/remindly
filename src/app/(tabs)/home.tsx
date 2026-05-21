import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SubscriptionCard } from '@/components/SubscriptionCard';

export default function HomeScreen() {
  const { summary, isSummaryLoading, fetchSummary } = useSubscriptionStore();
  const { user } = useAuthStore();

  const loadDashboard = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalMonthly = summary?.totalMonthlyOutflow || 0;
  const activeCount = summary?.totalActive || 0;
  const upcomingCount = summary?.upcomingRenewals || 0;
  const expiredCount = summary?.totalExpired || 0;
  const upcomingList = summary?.upcomingList || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isSummaryLoading} onRefresh={loadDashboard} tintColor={theme.colors.primary} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.greeting}>Hi, {user?.name ? user.name.split(' ')[0] : 'there'}</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly spend</Text>
          <Text style={styles.summaryAmount}>${totalMonthly.toFixed(2)}</Text>
          <View style={styles.summaryFooter}>
            <Text style={styles.summarySubtext}>{activeCount} active subscriptions</Text>
          </View>
        </View>

        {/* Dashboard Stat Boxes */}
        <View style={styles.statsRow}>
          <Pressable
            style={[styles.statBox, { borderTopColor: theme.colors.primary }]}
            onPress={() => router.push('/(tabs)/subscriptions?filter=active')}
          >
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Pressable>
          <Pressable
            style={[styles.statBox, { borderTopColor: theme.colors.warning }]}
            onPress={() => router.push('/(tabs)/subscriptions?filter=upcoming')}
          >
            <Text style={styles.statNumber}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </Pressable>
          <Pressable
            style={[styles.statBox, { borderTopColor: theme.colors.error }]}
            onPress={() => router.push('/(tabs)/subscriptions?filter=expired')}
          >
            <Text style={styles.statNumber}>{expiredCount}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </Pressable>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/subscriptions')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Subscriptions List */}
        <View style={styles.listContainer}>
          {upcomingList.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No upcoming renewals</Text>
              <Text style={styles.emptyStateSubtitle}>Tap + to add your first subscription.</Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={() => router.push('/subscriptions/add')}>
                <Text style={styles.emptyAddButtonText}>Add Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingList.map((item) => <SubscriptionCard key={item._id} item={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  welcomeHeader: {
    paddingVertical: theme.spacing.xs,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subGreeting: {
    ...theme.typography.bodySm,
    color: theme.colors.textMuted,
  },
  summaryCard: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  summaryLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.primaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    ...theme.typography.h1,
    color: theme.colors.card,
    fontSize: 40,
    marginTop: theme.spacing.xs,
  },
  summaryFooter: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.dividerLight,
  },
  summarySubtext: {
    ...theme.typography.bodySm,
    color: theme.colors.primaryLight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderTopWidth: 4,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statNumber: {
    ...theme.typography.h2,
    fontSize: 28,
  },
  statLabel: {
    ...theme.typography.bodySm,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...theme.typography.h3,
  },
  seeAllText: {
    ...theme.typography.bodySm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtitle: {
    ...theme.typography.bodySm,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyAddButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  emptyAddButtonText: {
    ...theme.typography.button,
    fontSize: 14,
  },
});
