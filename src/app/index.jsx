// Entry Screen
// Checks authentication status when the app loads.
// - If still initializing, displays a loading spinner.
// - If logged in, redirects to the home dashboard.
// - If not logged in, redirects to the login screen.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/utils/theme';

export default function Index() {
  const { isInitialized, user } = useAuth();

  // Show a loading spinner while checking persistent storage for an auth token
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Once initialized, route the user based on authentication status
  return <Redirect href={user ? '/(tabs)/home' : '/login'} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
