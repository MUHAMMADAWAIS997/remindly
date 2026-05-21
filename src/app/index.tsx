import { Redirect } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { theme } from '@/utils/theme';

export default function Index() {
  const { isInitialized, user } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/home' : '/login'} />;
}
