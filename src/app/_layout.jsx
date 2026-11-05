import { Stack, router } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { theme } from '@/utils/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { api } from '@/services/api';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
  scheduleAllSubscriptionNotifications,
  needsDailyReschedule,
} from '@/utils/notifications';
import { InAppNotification } from '@/components/InAppNotification';

// When the app is in the foreground, suppress the system notification popup.
// We show our own in-app banner instead.
// Wrapped in try/catch because expo-notifications can throw in Expo Go on Android SDK 53+.
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

// RootLayoutContent is the inner component that reads from AuthContext.
// It must live inside AuthProvider, so it's separated from RootLayout below.
function RootLayoutContent() {
  const { checkAuth, isInitialized, user } = useAuth();

  // banner holds the notification data to display as an in-app banner.
  // null means no banner is currently visible.
  const [banner, setBanner] = useState(null);

  // Run once on mount: check if the user is already logged in,
  // set up the notification channel, and register notification listeners.
  useEffect(() => {
    checkAuth();

    // These hold references to the listeners so we can clean them up later.
    let foregroundSub = null;
    let tapSub = null;

    const initNotifications = async () => {
      try {
        await setupNotificationChannel();
        await requestNotificationPermissions();

        // Listen for notifications that arrive while the app is open.
        // Show our custom in-app banner instead of the system popup.
        foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
          const { title, body, data } = notification.request.content;
          setBanner({
            title: title ?? 'Reminder',
            body: body ?? '',
            subscriptionId: data?.subscriptionId,
          });
        });

        // Listen for a tap on a system notification (when app is in background or closed).
        // Navigate to that subscription's detail screen.
        tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
          const subscriptionId = response.notification.request.content.data?.subscriptionId;
          if (subscriptionId) {
            router.push(`/subscriptions/${subscriptionId}`);
          }
        });
      } catch {
        // Notifications are not supported in this environment (e.g. Expo Go on Android SDK 53+).
      }
    };

    initNotifications();

    // Cleanup: remove listeners when this component unmounts.
    return () => {
      foregroundSub?.remove();
      tapSub?.remove();
    };
  }, []);

  // Once per day: fetch all subscriptions and schedule their reminder notifications.
  // Only runs after auth is confirmed and a user is logged in.
  useEffect(() => {
    if (!isInitialized || !user) return;

    const scheduleDaily = async () => {
      // Skip if notifications were already scheduled today.
      if (!(await needsDailyReschedule())) return;
      try {
        const response = await api.get('/subscriptions');
        if (response.data?.success) {
          const subs = response.data.data;
          // Only schedule notifications for non-expired subscriptions.
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
    // ThemeProvider syncs our custom theme colors with React Navigation's header/tab styles.
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
      {/* Stack navigator manages the screen stack (login, tabs, subscription details, etc.) */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Toast displays brief success/error messages at the bottom of the screen */}
      <Toast />

      {/* Show our in-app notification banner when a notification arrives while the app is open */}
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
  );
}

// RootLayout is the top-level component that wraps everything in context providers.
// AuthProvider and SubscriptionProvider must wrap RootLayoutContent
// so that all screens can access global auth and subscription state.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <RootLayoutContent />
        </SubscriptionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

