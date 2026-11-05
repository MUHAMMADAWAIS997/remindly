// SubscriptionCard Component
// Renders an individual subscription card displaying its name, category, status, cost, and renewal date.
// Tapping the card navigates to the detailed view for that subscription.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';

// Map each subscription category to an appropriate Ionicons icon
const CATEGORY_ICONS = {
  Entertainment: 'tv-outline',
  Education: 'book-outline',
  Health: 'heart-outline',
  Utilities: 'flash-outline',
  Finance: 'wallet-outline',
  Other: 'apps-outline',
};

// Helper function to return colors and icons based on subscription status
function getStatusBadge(status) {
  switch (status) {
    case 'Expiring Soon':
      return {
        bg: theme.colors.warningBg,
        text: theme.colors.warning,
        icon: <Ionicons name="time-outline" size={14} color={theme.colors.warning} />,
      };
    case 'Expired':
      return {
        bg: theme.colors.errorBg,
        text: theme.colors.error,
        icon: <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />,
      };
    default:
      return {
        bg: theme.colors.successBg,
        text: theme.colors.success,
        icon: <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.success} />,
      };
  }
}

export function SubscriptionCard({ item, dimmed = false }) {
  // Determine current status and remaining days
  const status = item.statusInfo?.status || 'Active';
  const daysLeft = item.statusInfo?.daysLeft ?? 0;
  const badge = getStatusBadge(status);

  // If expiring in 7 days or less, show countdown label (e.g. "3d left")
  const statusLabel = daysLeft >= 0 && daysLeft <= 7 ? `${daysLeft}d left` : status;

  // Format renewal date nicely (e.g. "Nov 24, 2026")
  const formattedDate = new Date(item.expiryDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      style={[styles.card, dimmed && styles.dimmed]}
      onPress={() => router.push(`/subscriptions/${item._id}`)}
    >
      {/* Left side: Category icon and details */}
      <View style={styles.left}>
        <View style={styles.badge}>
          <Ionicons
            name={CATEGORY_ICONS[item.category] || 'apps-outline'}
            size={22}
            color={dimmed ? theme.colors.textMuted : theme.colors.primary}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.meta}>
            <Text style={styles.category} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={styles.bullet}>•</Text>
            <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
              {badge.icon}
              <Text style={[styles.statusText, { color: badge.text }]} numberOfLines={1}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right side: Amount and expiry date */}
      <View style={styles.right}>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  dimmed: {
    opacity: 0.85,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
    paddingRight: 8,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  category: {
    ...theme.typography.bodySm,
  },
  bullet: {
    color: theme.colors.textMuted,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginLeft: 4,
  },
  amount: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
