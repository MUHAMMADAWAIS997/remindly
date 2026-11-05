// Global design tokens for Remindly
// These values define the colors, spacing, typography, and shadows used across the app.
// Keeping them in one place makes it easy to keep the user interface consistent.

/** @type {const} */
export const theme = {
  // Color palette used for backgrounds, cards, buttons, text, and alerts
  colors: {
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryLight: '#E0E7FF',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    inputBackground: '#F1F5F9',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    overlay: 'rgba(15, 23, 42, 0.6)',
    dividerLight: 'rgba(255, 255, 255, 0.2)',
  },

  // Standard spacing scale for margins and paddings
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Standard border radius values for rounded corners
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Text styling presets for consistent typography
  typography: {
    h1: { fontSize: 32, fontWeight: '700', color: '#0F172A' },
    h2: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
    h3: { fontSize: 20, fontWeight: '600', color: '#0F172A' },
    body: { fontSize: 16, fontWeight: '400', color: '#0F172A' },
    bodySm: { fontSize: 14, fontWeight: '400', color: '#64748B' },
    caption: { fontSize: 12, fontWeight: '400', color: '#64748B' },
    button: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  },

  // Shadow presets for iOS (shadow*) and Android (elevation)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};
