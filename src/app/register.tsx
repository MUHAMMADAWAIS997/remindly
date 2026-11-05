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

// ── Validation helpers ────────────────────────────────────────────────────────
const LETTERS_ONLY = /^[A-Za-z]+$/;
const EMAIL_RE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function validateFirstName(v: string): string {
  if (!v.trim()) return 'First name is required';
  if (/\s/.test(v)) return 'First name cannot contain spaces';
  if (/[0-9]/.test(v)) return 'First name cannot contain numbers';
  if (!LETTERS_ONLY.test(v)) return 'First name can only contain letters';
  return '';
}

function validateLastName(v: string): string {
  if (!v.trim()) return 'Last name is required';
  if (/\s/.test(v)) return 'Last name cannot contain spaces';
  if (/[0-9]/.test(v)) return 'Last name cannot contain numbers';
  if (!LETTERS_ONLY.test(v)) return 'Last name can only contain letters';
  return '';
}

function validateEmail(v: string): string {
  if (!v.trim()) return 'Email is required';
  if (!EMAIL_RE.test(v.trim())) return 'Please enter a valid email address';
  return '';
}

function validatePassword(v: string): string {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  if (v.length > 50) return 'Password is too long';
  return '';
}

function validateConfirmPassword(pass: string, confirm: string): string {
  if (!confirm) return 'Please confirm your password';
  if (pass !== confirm) return 'Passwords do not match';
  return '';
}

// ── Input component ───────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  secureTextEntry?: boolean;
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  editable?: boolean;
}

function Field({
  label, value, onChange, error, touched, placeholder,
  keyboardType, secureTextEntry, autoCapitalize = 'words', editable = true,
}: FieldProps) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = secureTextEntry;
  const showError = touched && !!error;

  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputWrap, showError && fieldStyles.inputError]}>
        <TextInput
          style={fieldStyles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPw}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPw(s => !s)} style={fieldStyles.eyeBtn}>
            <Ionicons
              name={showPw ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {showError && (
        <View style={fieldStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={theme.colors.error} />
          <Text style={fieldStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { gap: 6 },
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
  eyeBtn: { paddingLeft: 8, paddingVertical: 8 },
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

// ── Gender Toggle ─────────────────────────────────────────────────────────────
interface GenderToggleProps {
  value: 'Male' | 'Female' | '';
  onChange: (v: 'Male' | 'Female') => void;
  error?: string;
  touched?: boolean;
}

function GenderToggle({ value, onChange, error, touched }: GenderToggleProps) {
  const showError = touched && !!error;
  return (
    <View style={genderStyles.group}>
      <Text style={genderStyles.label}>Gender</Text>
      <View style={[genderStyles.toggleRow, showError && genderStyles.toggleError]}>
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
      {showError && (
        <View style={fieldStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={theme.colors.error} />
          <Text style={fieldStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const genderStyles = StyleSheet.create({
  group: { gap: 6 },
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
    backgroundColor: '#EC4899', // pink for female
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

// ── Register Screen ───────────────────────────────────────────────────────────
type Gender = 'Male' | 'Female' | '';

interface FormState {
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  password: string;
  confirmPassword: string;
}

interface TouchedState {
  firstName: boolean;
  lastName: boolean;
  gender: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<TouchedState>({
    firstName: false,
    lastName: false,
    gender: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const errors = {
    firstName: validateFirstName(form.firstName),
    lastName: validateLastName(form.lastName),
    gender: form.gender === '' ? 'Please select your gender' : '',
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
  };

  const touch = (field: keyof TouchedState) =>
    setTouched(t => ({ ...t, [field]: true }));

  const setField = (field: keyof FormState) => (value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleRegister = async () => {
    // Mark all fields as touched to surface all errors
    setTouched({ firstName: true, lastName: true, gender: true, email: true, password: true, confirmPassword: true });
    if (hasErrors) return;
    const success = await register(form.firstName.trim(), form.lastName.trim(), form.gender as 'Male' | 'Female', form.email.trim(), form.password);
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
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>
          </View>

          <View style={styles.form}>
            {/* Row: First Name + Last Name side by side */}
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Field
                  label="First Name"
                  value={form.firstName}
                  onChange={setField('firstName')}
                  error={errors.firstName}
                  touched={touched.firstName}
                  placeholder="John"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              <View style={styles.nameField}>
                <Field
                  label="Last Name"
                  value={form.lastName}
                  onChange={setField('lastName')}
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
              onChange={(g) => { setForm(f => ({ ...f, gender: g })); touch('gender'); }}
              error={errors.gender}
              touched={touched.gender}
            />

            {/* Email */}
            <Field
              label="Email Address"
              value={form.email}
              onChange={setField('email')}
              error={errors.email}
              touched={touched.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Password */}
            <Field
              label="Password"
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              touched={touched.password}
              placeholder="Min. 6 characters"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Confirm Password */}
            <Field
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, (isLoading) && styles.buttonDisabled]}
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
