import React from 'react';
import { Tabs, router } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/utils/theme';

// TabLayout defines the bottom tab navigator with four screens:
// Dashboard (home), Subscriptions, History, and Profile.
export default function TabLayout() {
  // insets gives us the safe area height at the bottom (e.g. iPhone home indicator).
  // We add this to the tab bar height so it doesn't overlap the home indicator.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // Header (top bar) styling
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          ...theme.typography.h3,
        },
        headerShadowVisible: false,

        // Tab bar (bottom bar) styling
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          ...theme.typography.bodySm,
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Dashboard tab — shows the monthly spend summary and upcoming renewals */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" color={color} size={22} />
          ),
          // Add button in the top-right corner navigates to the Add Subscription screen
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/subscriptions/add')}
            >
              <Ionicons name="add" color={theme.colors.card} size={22} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Subscriptions tab — lists all subscriptions with filter options */}
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color }) => (
            <Ionicons name="card-outline" color={color} size={22} />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/subscriptions/add')}
            >
              <Ionicons name="add" color={theme.colors.card} size={22} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* History tab — shows expired subscriptions */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" color={color} size={22} />
          ),
        }}
      />

      {/* Profile tab — shows user info and settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Circular add button displayed in the header top-right on Dashboard and Subscriptions tabs
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
});
