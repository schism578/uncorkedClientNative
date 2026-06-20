export const colors = {
  background: '#F7F0E6',
  surface: '#FFFDF8',
  primary: '#b22222',
  primaryPressed: '#8e1b1b',
  secondary: '#6b4226',
  secondaryPressed: '#54341e',
  muted: '#8a8378',
  mutedPressed: '#6f6a60',
  danger: '#9c1c1c',
  dangerPressed: '#7a1515',
  textDark: '#333',
  textBody: '#444',
  placeholder: '#9b8f7a',
  border: '#ddd0ba',
  error: '#b00020',
  white: '#fff',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 6, md: 10, lg: 16 };

export const input = {
  width: '100%' as const,
  minHeight: 48,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radius.md,
  marginBottom: spacing.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: 16,
  backgroundColor: colors.surface,
  color: colors.textDark,
  justifyContent: 'center' as const,
};

export const card = {
  width: '100%' as const,
  maxWidth: 400,
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.md,
  marginBottom: spacing.md,
  shadowColor: '#3a2a1a',
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
};

export const heading = {
  fontSize: 24,
  fontWeight: 'bold' as const,
  marginBottom: spacing.md,
  color: colors.primary,
  textAlign: 'center' as const,
};

export const subheading = {
  fontSize: 18,
  fontWeight: 'bold' as const,
  color: colors.textDark,
  alignSelf: 'flex-start' as const,
  marginTop: spacing.md,
  marginBottom: spacing.sm,
};
