import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { theme } from '@/utils/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    const doLogout = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm("You'll need to sign in again. Are you sure you want to log out?");
      if (confirm) {
        doLogout();
      }
    } else {
      Alert.alert('Log out', "You'll need to sign in again.", [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const handleNotificationsPress = () => {
    Alert.alert(
      'Notification Settings',
      'Remindly schedules automated renewal reminders 7 days, 3 days, 1 day before expiration, and on renewal day.\n\nMake sure notification permissions are enabled in your device settings.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Privacy & Security',
      'Your subscription data and credentials are encrypted in transit and securely stored. We never sell or share your personal data with third parties.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Help & Support',
      'Need assistance with your subscriptions?\n\n• Email: support@remindly.app\n• Version: Remindly 1.0.0 (Production Build)',
      [{ text: 'Close', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Avatar Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName ? user.firstName[0].toUpperCase() : 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User Profile'}</Text>
          <Text style={styles.email}>{user?.email || 'you@example.com'}</Text>
          {user?.gender ? (
            <View style={styles.genderBadge}>
              <Text style={styles.genderText}>{user.gender}</Text>
            </View>
          ) : null}
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleNotificationsPress}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPress}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelpPress}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.card,
    fontSize: 36,
  },
  name: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  email: {
    ...theme.typography.bodySm,
    color: theme.colors.textMuted,
  },
  genderBadge: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  genderText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorBg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  logoutText: {
    ...theme.typography.button,
    color: theme.colors.error,
  },
});
