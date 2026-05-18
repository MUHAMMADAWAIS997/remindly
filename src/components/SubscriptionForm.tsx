import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { SubscriptionItem } from '@/store/useSubscriptionStore';
import { DatePickerModal } from '@/components/DatePickerModal';

const CATEGORIES: SubscriptionItem['category'][] = ['Entertainment', 'Education', 'Health', 'Utilities', 'Finance', 'Other'];

export interface SubscriptionFormValues {
  name: string;
  category: SubscriptionItem['category'];
  amount: number;
  expiryDate: string;
  notes: string;
}

interface Props {
  submitLabel: string;
  defaultValues?: {
    name?: string;
    category?: SubscriptionItem['category'];
    amount?: string;
    expiryDate?: Date;
    notes?: string;
  };
  onValidSubmit: (values: SubscriptionFormValues) => Promise<void>;
}

export function SubscriptionForm({ submitLabel, defaultValues, onValidSubmit }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [category, setCategory] = useState<SubscriptionItem['category']>(defaultValues?.category ?? 'Entertainment');
  const [amount, setAmount] = useState(defaultValues?.amount ?? '');
  const [expiryDate, setExpiryDate] = useState(defaultValues?.expiryDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [notes, setNotes] = useState(defaultValues?.notes ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) return;

    setLoading(true);
    await onValidSubmit({ name: name.trim(), category, amount: numAmount, expiryDate: expiryDate.toISOString(), notes: notes.trim() });
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subscription Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Netflix Premium"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Billing Amount ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="19.99"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, category === cat && styles.pillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Next Renewal / Expiry Date *</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
          <Text style={styles.dateText}>
            {expiryDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
        <DatePickerModal
          visible={showDatePicker}
          currentDate={expiryDate}
          onConfirm={(date) => setExpiryDate(date)}
          onClose={() => setShowDatePicker(false)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add payment method or reminder notes..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.card} size="small" />
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.bodySm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  pills: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  pill: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    ...theme.typography.bodySm,
    color: theme.colors.text,
  },
  pillTextActive: {
    color: theme.colors.card,
    fontWeight: '600',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  dateText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    marginTop: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...theme.typography.button,
  },
});
