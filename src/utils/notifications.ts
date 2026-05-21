import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionItem } from '@/store/useSubscriptionStore';

const CHANNEL_ID = 'subscription-reminders';
const LAST_SCHEDULED_KEY = 'notifications_last_scheduled';
const RESCHEDULE_INTERVAL_MS = 24 * 60 * 60 * 1000;

const REMINDER_CONFIG = [
  {
    id: '7d',
    daysBeforeExpiry: 7,
    getContent: (name: string) => ({
      title: 'Upcoming Renewal',
      body: `${name} renews in 7 days`,
    }),
  },
  {
    id: '3d',
    daysBeforeExpiry: 3,
    getContent: (name: string) => ({
      title: 'Renewing Soon',
      body: `${name} renews in 3 days`,
    }),
  },
  {
    id: '1d',
    daysBeforeExpiry: 1,
    getContent: (name: string) => ({
      title: 'Renewing Tomorrow',
      body: `${name} renews tomorrow!`,
    }),
  },
  {
    id: 'today',
    daysBeforeExpiry: 0,
    getContent: (name: string) => ({
      title: 'Expiring Today',
      body: `${name} expires today — renew now`,
    }),
  },
];

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Subscription Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366F1',
    sound: 'default',
  });
}

export async function cancelSubscriptionNotifications(subscriptionId: string): Promise<void> {
  for (const { id } of REMINDER_CONFIG) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`${subscriptionId}_${id}`);
    } catch {}
  }
}

export async function scheduleSubscriptionNotifications(sub: SubscriptionItem): Promise<void> {
  if (Platform.OS === 'web') return;
  if (sub.statusInfo?.status === 'Expired') {
    await cancelSubscriptionNotifications(sub._id);
    return;
  }

  await cancelSubscriptionNotifications(sub._id);

  const now = new Date();
  const expiry = new Date(sub.expiryDate);

  for (const { id, daysBeforeExpiry, getContent } of REMINDER_CONFIG) {
    const triggerDate = new Date(expiry);
    triggerDate.setDate(triggerDate.getDate() - daysBeforeExpiry);
    triggerDate.setHours(9, 0, 0, 0);

    if (triggerDate <= now) continue;

    const { title, body } = getContent(sub.name);

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `${sub._id}_${id}`,
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
      console.error(`Failed to schedule ${id} notification for ${sub.name}`, err);
    }
  }
}

export async function scheduleAllSubscriptionNotifications(subscriptions: SubscriptionItem[]): Promise<void> {
  if (Platform.OS === 'web') return;
  for (const sub of subscriptions) {
    await scheduleSubscriptionNotifications(sub);
  }
  await AsyncStorage.setItem(LAST_SCHEDULED_KEY, Date.now().toString());
}

export async function needsDailyReschedule(): Promise<boolean> {
  try {
    const lastRun = await AsyncStorage.getItem(LAST_SCHEDULED_KEY);
    if (!lastRun) return true;
    return Date.now() - parseInt(lastRun) >= RESCHEDULE_INTERVAL_MS;
  } catch {
    return true;
  }
}
