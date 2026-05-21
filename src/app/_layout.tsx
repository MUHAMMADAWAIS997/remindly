import { Stack, router } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { theme } from '@/utils/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/api';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
  scheduleAllSubscriptionNotifications,
  needsDailyReschedule,
} from '@/utils/notifications';
import { InAppNotification } from '@/components/InAppNotification';
import { SubscriptionItem } from '@/store/useSubscriptionStore';

// Suppress system notification popup when app is in foreground — we show our own banner
// Wrapped in try/catch because expo-notifications throws in Expo Go on Android SDK 53+
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
} catch {}

interface BannerData {
  title: string;
  body: string;
  subscriptionId?: string;
}

export default function RootLayout() {
  const { checkAuth, isInitialized, user } = useAuthStore();
  const [banner, setBanner] = useState<BannerData | null>(null);

  // Initial setup: permissions + channel + notification listeners
  useEffect(() => {
    checkAuth();

    let foregroundSub: ReturnType<typeof Notifications.addNotificationReceivedListener> | null = null;
    let tapSub: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null = null;

    const initNotifications = async () => {
      try {
        await setupNotificationChannel();
        await requestNotificationPermissions();

        // Show in-app banner when a notification arrives while app is open
        foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
          const { title, body, data } = notification.request.content;
          setBanner({
            title: title ?? 'Reminder',
            body: body ?? '',
            subscriptionId: data?.subscriptionId as string | undefined,
          });
        });

        // Navigate when user taps a system notification (background/closed)
        tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
          const subscriptionId = response.notification.request.content.data?.subscriptionId as string | undefined;
          if (subscriptionId) {
            router.push(`/subscriptions/${subscriptionId}`);
          }
        });
      } catch {
        // Notifications not supported in this environment (e.g. Expo Go on Android SDK 53+)
      }
    };

    initNotifications();

    return () => {
      foregroundSub?.remove();
      tapSub?.remove();
    };
  }, []);

  // Once per day: fetch all subscriptions and schedule notifications
  useEffect(() => {
    if (!isInitialized || !user) return;

    const scheduleDaily = async () => {
      if (!(await needsDailyReschedule())) return;
      try {
        const response = await api.get('/subscriptions');
        if (response.data?.success) {
          const subs: SubscriptionItem[] = response.data.data;
          await scheduleAllSubscriptionNotifications(
            subs.filter((s) => s.statusInfo?.status !== 'Expired')
          );
        }
      } catch (err) {
        console.error('Daily notification scheduling failed', err);
      }
    };

    scheduleDaily();
  }, [isInitialized, user]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          primary: theme.colors.primary,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
        }
      }}>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
        {banner && (
          <InAppNotification
            key={`${banner.title}${banner.body}`}
            title={banner.title}
            body={banner.body}
            subscriptionId={banner.subscriptionId}
            onDismiss={() => setBanner(null)}
          />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
