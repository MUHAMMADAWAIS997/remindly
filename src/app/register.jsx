// Register Screen
// Allows new users to create an account with first name, last name, gender, email, and password.
// Simplified into readable helper components and validation functions for React Native beginners.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { useAuth } from '@/context/AuthContext';

// ── Validation Helpers ──────────────────────────────────────────────────────────
// Simple validation functions with clear, descriptive error messages.

const LETTERS_ONLY = /^[A-Za-z]+$/;
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function validateName(value, fieldLabel) {
  if (!value || !value.trim()) return `${fieldLabel} is required`;
  if (/\s/.test(value)) return `${fieldLabel} cannot contain spaces`;
  if (/[0-9]/.test(value)) return `${fieldLabel} cannot contain numbers`;
  if (!LETTERS_ONLY.test(value)) return `${fieldLabel} can only contain letters`;
  return '';
}

function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 50) return 'Password is too long';
  return '';
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
}

function validateGender(gender) {
  if (!gender) return 'Please select your gender';
  return '';
}

// ── Reusable Input Field Component ─────────────────────────────────────────────
// Renders a label, text input, optional password visibility toggle, and error text.

function FormField({
  label,
  value,
  onChangeText,
  error,
  touched,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'words',
  editable = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const showError = touched && Boolean(error);

  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>

      <View style={[fieldStyles.inputWrap, showError && fieldStyles.inputError]}>
        <TextInput
          style={fieldStyles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />

        {/* Eye icon toggle for password fields */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={fieldStyles.eyeBtn}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error message row */}
      {showError && (
        <View style={fieldStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={theme.colors.error} />
          <Text style={fieldStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ── Reusable Gender Toggle Component ───────────────────────────────────────────
// Renders side-by-side selectable pills for "Male" and "Female".

function GenderToggle({ value, onChange, error, touched }) {
  const showError = touched && Boolean(error);

  return (
    <View style={genderStyles.group}>
      <Text style={genderStyles.label}>Gender</Text>

      <View style={[genderStyles.toggleRow, showError && genderStyles.toggleError]}>
        {/* Male Option */}
        <TouchableOpacity
          style={[genderStyles.option, value === 'Male' && genderStyles.optionActive]}
          onPress={() => onChange('Male')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="male"
            size={16}
            color={value === 'Male' ? theme.colors.card : theme.colors.textMuted}
          />
          <Text style={[genderStyles.optionText, value === 'Male' && genderStyles.optionTextActive]}>
            Male
          </Text>
        </TouchableOpacity>

        <View style={genderStyles.divider} />

        {/* Female Option */}
        <TouchableOpacity
          style={[genderStyles.option, value === 'Female' && genderStyles.optionActiveFemale]}
          onPress={() => onChange('Female')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="female"
            size={16}
            color={value === 'Female' ? theme.colors.card : theme.colors.textMuted}
          />
          <Text style={[genderStyles.optionText, value === 'Female' && genderStyles.optionTextActive]}>
            Female
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error message row */}
      {showError && (
        <View style={fieldStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={theme.colors.error} />
          <Text style={fieldStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Register Screen Component ─────────────────────────────────────────────

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();

  // Single state object holding form inputs
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Track which fields have been interacted with (to show errors only after touch)
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    gender: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Calculate current validation errors for each field
  const errors = {
    firstName: validateName(form.firstName, 'First name'),
    lastName: validateName(form.lastName, 'Last name'),
    gender: validateGender(form.gender),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
  };

  // Helper to update a field value and mark it as touched
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Check if any errors currently exist in the form
  const hasErrors = Object.values(errors).some(Boolean);

  // Handle form submission
  const handleRegister = async () => {
    // Surface all errors by marking every field as touched
    setTouched({
      firstName: true,
      lastName: true,
      gender: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (hasErrors) return;

    const success = await register(
      form.firstName.trim(),
      form.lastName.trim(),
      form.gender,
      form.email.trim(),
      form.password
    );

    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* First Name & Last Name in one row */}
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <FormField
                  label="First Name"
                  value={form.firstName}
                  onChangeText={(val) => updateField('firstName', val)}
                  error={errors.firstName}
                  touched={touched.firstName}
                  placeholder="John"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              <View style={styles.nameField}>
                <FormField
                  label="Last Name"
                  value={form.lastName}
                  onChangeText={(val) => updateField('lastName', val)}
                  error={errors.lastName}
                  touched={touched.lastName}
                  placeholder="Doe"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Gender Toggle */}
            <GenderToggle
              value={form.gender}
              onChange={(val) => updateField('gender', val)}
              error={errors.gender}
              touched={touched.gender}
            />

            {/* Email Field */}
            <FormField
              label="Email Address"
              value={form.email}
              onChangeText={(val) => updateField('email', val)}
              error={errors.email}
              touched={touched.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Password Field */}
            <FormField
              label="Password"
              value={form.password}
              onChangeText={(val) => updateField('password', val)}
              error={errors.password}
              touched={touched.password}
              placeholder="Min. 6 characters"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Confirm Password Field */}
            <FormField
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={(val) => updateField('confirmPassword', val)}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.card} size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Navigation Link to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Stylesheets ────────────────────────────────────────────────────────────────

const fieldStyles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    ...theme.typography.bodySm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorBg,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  eyeBtn: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
});

const genderStyles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    ...fieldStyles.label,
  },
  toggleRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.inputBackground,
  },
  toggleError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorBg,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: theme.colors.primary,
  },
  optionActiveFemale: {
    backgroundColor: '#EC4899', // Pink for female
  },
  optionText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  optionTextActive: {
    color: theme.colors.card,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  form: {
    gap: theme.spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  nameField: {
    flex: 1,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.typography.button,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  footerLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

