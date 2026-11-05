// Notifications utility for scheduling and managing renewal alerts.
// Uses expo-notifications to schedule local device reminders before a subscription expires.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification channel ID required for Android 8.0+
const CHANNEL_ID = 'subscription-reminders';

// Key used in storage to track the timestamp of the last daily schedule run
const LAST_SCHEDULED_KEY = 'notifications_last_scheduled';

// 24 hours in milliseconds
const RESCHEDULE_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Configuration for when reminders should fire: 7 days, 3 days, 1 day before, and on renewal day
const REMINDER_CONFIG = [
  {
    id: '7d',
    daysBeforeExpiry: 7,
    getContent: (name) => ({
      title: 'Upcoming Renewal',
      body: `${name} renews in 7 days`,
    }),
  },
  {
    id: '3d',
    daysBeforeExpiry: 3,
    getContent: (name) => ({
      title: 'Renewing Soon',
      body: `${name} renews in 3 days`,
    }),
  },
  {
    id: '1d',
    daysBeforeExpiry: 1,
    getContent: (name) => ({
      title: 'Renewing Tomorrow',
      body: `${name} renews tomorrow!`,
    }),
  },
  {
    id: 'today',
    daysBeforeExpiry: 0,
    getContent: (name) => ({
      title: 'Expiring Today',
      body: `${name} expires today — renew now`,
    }),
  },
];

// Request permission to send notifications to the user
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Android requires a notification channel to display notifications with sound and vibrations
export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Subscription Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366F1',
    sound: 'default',
  });
}

// Cancel all scheduled reminder notifications for a specific subscription
export async function cancelSubscriptionNotifications(subscriptionId) {
  for (const reminder of REMINDER_CONFIG) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`${subscriptionId}_${reminder.id}`);
    } catch (err) {
      // Ignore cancellation errors if notification didn't exist
    }
  }
}

// Schedule future notification alerts (at 9:00 AM) for a single subscription
export async function scheduleSubscriptionNotifications(sub) {
  if (Platform.OS === 'web') return;

  // Don't schedule reminders for expired subscriptions
  if (sub.statusInfo?.status === 'Expired') {
    await cancelSubscriptionNotifications(sub._id);
    return;
  }

  // Cancel any previous notifications for this subscription to prevent duplicates
  await cancelSubscriptionNotifications(sub._id);

  const now = new Date();
  const expiry = new Date(sub.expiryDate);

  for (const reminder of REMINDER_CONFIG) {
    const triggerDate = new Date(expiry);
    triggerDate.setDate(triggerDate.getDate() - reminder.daysBeforeExpiry);
    triggerDate.setHours(9, 0, 0, 0); // Fire at 9:00 AM

    // Skip dates that have already passed
    if (triggerDate <= now) continue;

    const { title, body } = reminder.getContent(sub.name);

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `${sub._id}_${reminder.id}`,
        content: {
          title,
          body,
          data: { subscriptionId: sub._id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: CHANNEL_ID,
        },
      });
    } catch (err) {
      console.error(`Failed to schedule ${reminder.id} notification for ${sub.name}:`, err);
    }
  }
}

// Schedule notifications for a list of active subscriptions
export async function scheduleAllSubscriptionNotifications(subscriptions) {
  if (Platform.OS === 'web') return;

  for (const sub of subscriptions) {
    await scheduleSubscriptionNotifications(sub);
  }

  // Record timestamp to avoid unnecessary repeated scheduling on the same day
  await AsyncStorage.setItem(LAST_SCHEDULED_KEY, Date.now().toString());
}

// Check if more than 24 hours have passed since notifications were last scheduled
export async function needsDailyReschedule() {
  try {
    const lastRun = await AsyncStorage.getItem(LAST_SCHEDULED_KEY);
    if (!lastRun) return true;
    return Date.now() - parseInt(lastRun, 10) >= RESCHEDULE_INTERVAL_MS;
  } catch (error) {
    return true;
  }
}

