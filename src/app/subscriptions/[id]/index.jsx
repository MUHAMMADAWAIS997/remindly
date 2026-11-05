import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { useSubscriptions } from '@/context/SubscriptionContext';

// SubscriptionDetailScreen shows full information about a single subscription.
// The subscription ID comes from the URL: /subscriptions/[id]
export default function SubscriptionDetailScreen() {
  // `id` is extracted from the dynamic route segment [id]
  const { id } = useLocalSearchParams();

  const { fetchSubscriptionById, deleteSubscription } = useSubscriptions();

  // `subscription` holds the loaded subscription data, or null if not found/loaded yet
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // useFocusEffect re-runs the load every time this screen comes into focus.
  // This ensures fresh data is shown if the user edits and comes back.
  useFocusEffect(
    useCallback(() => {
      const loadDetail = async () => {
        setLoading(true);
        if (id) {
          const data = await fetchSubscriptionById(id);
          setSubscription(data);
        }
        setLoading(false);
      };
      loadDetail();
    }, [id, fetchSubscriptionById])
  );

  // handleDelete shows a confirmation dialog before permanently removing the subscription.
  // Uses window.confirm on web and Alert.alert on native.
  const handleDelete = () => {
    const doDelete = async () => {
      if (id) {
        const success = await deleteSubscription(id);
        if (success) {
          router.back();
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently remove "${subscription?.name}"?`
      );
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Subscription',
        `Are you sure you want to permanently remove "${subscription?.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  // getStatusBadge returns colors and an icon based on the subscription's status string.
  // This drives the colored status tag shown on the detail card.
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Expiring Soon':
        return {
          bg: theme.colors.warningBg,
          text: theme.colors.warning,
          icon: <Ionicons name="time-outline" size={16} color={theme.colors.warning} />,
        };
      case 'Expired':
        return {
          bg: theme.colors.errorBg,
          text: theme.colors.error,
          icon: <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />,
        };
      default:
        // Active subscriptions get a green badge
        return {
          bg: theme.colors.successBg,
          text: theme.colors.success,
          icon: <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.success} />,
        };
    }
  };

  // Show a full-screen loading spinner while the subscription data is being fetched
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Show a "Not Found" state if the subscription wasn't returned from the API
  if (!subscription) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerLoading}>
          <Ionicons name="alert-circle-outline" size={54} color={theme.colors.textMuted} />
          <Text style={styles.notFoundText}>Subscription Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Compute the status badge and days remaining for the detail view
  const badge = getStatusBadge(subscription.statusInfo?.status);
  const daysLeft = subscription.statusInfo?.daysLeft ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header: back button, title, edit button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        {/* Pencil icon navigates to the Edit screen for this subscription */}
        <TouchableOpacity
          onPress={() => router.push(`/subscriptions/${id}/edit`)}
          style={styles.editButton}
        >
          <Ionicons name="pencil-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Main Info Card: name, category, amount, status */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            {/* Category badge shows the first letter of the category name */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryInitial}>{subscription.category[0]}</Text>
            </View>
            <View style={styles.titleArea}>
              <Text style={styles.subName}>{subscription.name}</Text>
              <Text style={styles.subCategory}>{subscription.category}</Text>
            </View>
          </View>

          <View style={styles.amountDivider} />

          {/* Amount row */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              ${subscription.amount.toFixed(2)}
              {subscription.billingCycle ? ` / ${subscription.billingCycle}` : ''}
            </Text>
          </View>

          {/* Status row — shows days remaining or status label */}
          <View style={styles.statusRow}>
            <Text style={styles.amountLabel}>Status</Text>
            <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
              {badge.icon}
              <Text style={[styles.statusText, { color: badge.text }]}>
                {daysLeft <= 7 && daysLeft >= 0
                  ? `${daysLeft} days remaining`
                  : subscription.statusInfo?.status || 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Card: start date and renewal date */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          <View style={styles.timelineRow}>
            <View style={styles.timelineIcon}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.timelineDetails}>
              <Text style={styles.timelineLabel}>Started</Text>
              <Text style={styles.timelineDate}>
                {new Date(subscription.startDate).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Vertical connector line between the two timeline rows */}
          <View style={styles.timelineConnector} />

          <View style={styles.timelineRow}>
            <View style={styles.timelineIcon}>
              <Ionicons name="alarm-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.timelineDetails}>
              <Text style={styles.timelineLabel}>Renews on</Text>
              <Text style={styles.timelineDate}>
                {new Date(subscription.expiryDate).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Card — only shown if the subscription has notes */}
        {subscription.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{subscription.notes}</Text>
          </View>
        ) : null}

        {/* Delete Button — triggers confirmation before deleting */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  editButton: {
    padding: theme.spacing.xs,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...theme.typography.h3,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  categoryBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInitial: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  titleArea: {
    flex: 1,
  },
  subName: {
    ...theme.typography.h2,
    marginBottom: 2,
  },
  subCategory: {
    ...theme.typography.bodySm,
    color: theme.colors.textMuted,
  },
  amountDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  amountLabel: {
    ...theme.typography.bodySm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  amountValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDetails: {
    flex: 1,
  },
  timelineLabel: {
    ...theme.typography.bodySm,
    color: theme.colors.textMuted,
  },
  timelineDate: {
    ...theme.typography.body,
    fontWeight: '600',
    marginTop: 2,
  },
  timelineConnector: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.border,
    marginLeft: 19,
    marginVertical: 4,
  },
  notesText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorBg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  deleteButtonText: {
    ...theme.typography.button,
    color: theme.colors.error,
  },
});
