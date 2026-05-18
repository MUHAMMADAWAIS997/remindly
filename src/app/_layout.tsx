import { Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { theme } from '@/utils/theme';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="subscriptions" />
        </Stack>
        <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
