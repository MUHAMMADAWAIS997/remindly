import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/utils/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { SubscriptionCard } from '@/components/SubscriptionCard';

const CATEGORIES = ['All', 'Entertainment', 'Education', 'Health', 'Utilities', 'Finance', 'Other'];
const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Expired', value: 'expired' },
];

export default function SubscriptionsScreen() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(filter || '');

  const { subscriptions, isLoading, fetchSubscriptions } = useSubscriptionStore();

  const loadData = useCallback(() => {
    fetchSubscriptions(selectedStatus, selectedCategory);
  }, [fetchSubscriptions, selectedStatus, selectedCategory]);

  useEffect(() => {
    if (filter) {
      setSelectedStatus(filter);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Status Filter Tabs */}
        <View style={styles.statusTabsContainer}>
          {STATUS_FILTERS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.statusTab, selectedStatus === tab.value && styles.statusTabActive]}
              onPress={() => setSelectedStatus(tab.value)}
            >
              <Text style={[styles.statusTabText, selectedStatus === tab.value && styles.statusTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories Horizontal Filter */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryPillText, selectedCategory === cat && styles.categoryPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subscriptions List */}
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.colors.primary} />
          }
        >
          {isLoading && subscriptions.length === 0 ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Subscriptions Found</Text>
              <Text style={styles.emptySubtitle}>Try a different filter.</Text>
            </View>
          ) : (
            subscriptions.map((item) => <SubscriptionCard key={item._id} item={item} />)
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
  statusTabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  statusTabActive: {
    backgroundColor: theme.colors.inputBackground,
  },
  statusTabText: {
    ...theme.typography.bodySm,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  statusTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  categoriesWrapper: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryPill: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    ...theme.typography.bodySm,
    color: theme.colors.text,
  },
  categoryPillTextActive: {
    color: theme.colors.card,
    fontWeight: '600',
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
