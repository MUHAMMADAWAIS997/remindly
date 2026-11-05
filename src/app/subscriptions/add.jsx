import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '@/utils/theme';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { SubscriptionForm } from '@/components/SubscriptionForm';

// AddSubscriptionScreen lets the user fill in details for a new subscription.
// It uses the shared SubscriptionForm component to avoid duplicating form logic.
export default function AddSubscriptionScreen() {
  const { addSubscription } = useSubscriptions();

  // handleSubmit is called by SubscriptionForm when the user submits valid form data.
  // `values` contains the validated form fields: name, category, amount, billingCycle, expiryDate, notes.
  const handleSubmit = async (values) => {
    const success = await addSubscription(values);
    if (success) {
      // Go back to the previous screen on success
      router.back();
    } else {
      // Show an error toast if the API call failed
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add subscription. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* KeyboardAvoidingView prevents the keyboard from covering the form inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header with back button and screen title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Subscription</Text>
          {/* Spacer keeps the title visually centered */}
          <View style={{ width: 24 }} />
        </View>

        {/* The shared form handles all input fields and validation */}
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
