import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';

interface Props {
  title: string;
  body: string;
  subscriptionId?: string;
  onDismiss: () => void;
}

export function InAppNotification({ title, body, subscriptionId, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-160);

  const slideOut = () => {
    translateY.value = withTiming(-160, { duration: 300 }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
  };

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 350 });
    const timer = setTimeout(slideOut, 4000);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handlePress = () => {
    slideOut();
    if (subscriptionId) {
      router.push(`/subscriptions/${subscriptionId}`);
    }
  };

  return (
    <Animated.View style={[styles.container, { top: insets.top + 8 }, animatedStyle]}>
      <Pressable style={styles.inner} onPress={handlePress}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={18} color={theme.colors.card} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        </View>
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
