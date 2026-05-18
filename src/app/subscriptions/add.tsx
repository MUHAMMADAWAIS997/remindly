import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '@/utils/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { SubscriptionForm, SubscriptionFormValues } from '@/components/SubscriptionForm';

export default function AddSubscriptionScreen() {
  const { addSubscription } = useSubscriptionStore();

  const handleSubmit = async (values: SubscriptionFormValues) => {
    const success = await addSubscription(values);
    if (success) {
      router.back();
    } else {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add subscription. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Subscription</Text>
          <View style={{ width: 24 }} />
        </View>
        <SubscriptionForm submitLabel="Add Subscription" onValidSubmit={handleSubmit} />
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h3,
  },
});
