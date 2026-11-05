// DatePickerModal Component
// Provides an interactive calendar modal for choosing a subscription's renewal date.
// Wraps react-native-calendars inside React Native's built-in Modal component.

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { theme } from '@/utils/theme';

export function DatePickerModal({
  visible,
  currentDate = new Date(),
  onConfirm,
  onClose,
}) {
  // Format dates as YYYY-MM-DD strings required by the Calendar component
  const formattedCurrent = currentDate.toISOString().split('T')[0];
  const minDateStr = new Date().toISOString().split('T')[0];

  // When a user selects a day on the calendar, construct a new Date object and return it
  const handleDayPress = (day) => {
    const [year, month, date] = day.dateString.split('-').map(Number);
    const newDate = new Date(year, month - 1, date);
    if (onConfirm) {
      onConfirm(newDate);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Semi-transparent dark background backdrop */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Modal content container (prevent taps inside from closing the modal) */}
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header with Title and Close button */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Renewal Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Interactive Month Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={formattedCurrent}
              minDate={minDateStr}
              onDayPress={handleDayPress}
              markedDates={{
                [formattedCurrent]: { selected: true, selectedColor: theme.colors.primary },
              }}
              theme={{
                backgroundColor: theme.colors.card,
                calendarBackground: theme.colors.card,
                textSectionTitleColor: theme.colors.textMuted,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.card,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.border,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                textMonthFontWeight: 'bold',
              }}
            />
          </View>

          {/* Cancel button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 360,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
  },
  calendarContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    ...theme.typography.bodySm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});

