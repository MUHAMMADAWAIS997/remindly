// InAppNotification Component
// Displays a slide-down banner notification at the top of the screen when a reminder arrives.
// Uses React Native's built-in Animated API (Animated.Value, Animated.timing) for beginner-friendly animations.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';

export function InAppNotification({ title, body, subscriptionId, onDismiss }) {
  const insets = useSafeAreaInsets();

  // Create an animated value for the vertical slide animation.
  // Starts at -160 (hidden above the top of the screen).
  const translateY = useRef(new Animated.Value(-160)).current;

  // Slide the notification back up and dismiss it
  const slideOut = () => {
    Animated.timing(translateY, {
      toValue: -160,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  useEffect(() => {
    // 1. Slide down into view (to position 0)
    Animated.timing(translateY, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // 2. Automatically slide out and dismiss after 4 seconds
    const timer = setTimeout(slideOut, 4000);

    // Cleanup timer if user dismisses early or component unmounts
    return () => clearTimeout(timer);
  }, []);

  // When tapped, slide out and optionally navigate to the subscription details
  const handlePress = () => {
    slideOut();
    if (subscriptionId) {
      router.push(`/subscriptions/${subscriptionId}`);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8 },
        { transform: [{ translateY }] },
      ]}
    >
      <Pressable style={styles.inner} onPress={handlePress}>
        {/* Bell Icon Badge */}
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={18} color={theme.colors.card} />
        </View>

        {/* Title and Message Text */}
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>

        {/* Close Button */}
        <Pressable onPress={slideOut} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={theme.colors.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 9999,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...theme.typography.bodySm,
    fontWeight: '700',
    color: theme.colors.card,
  },
  body: {
    ...theme.typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeBtn: {
    flexShrink: 0,
    padding: 4,
  },
});

