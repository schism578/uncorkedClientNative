import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'muted' | 'danger';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
}

const variantColors: Record<Variant, { base: string; pressed: string }> = {
  primary: { base: colors.primary, pressed: colors.primaryPressed },
  secondary: { base: colors.secondary, pressed: colors.secondaryPressed },
  muted: { base: colors.muted, pressed: colors.mutedPressed },
  danger: { base: colors.danger, pressed: colors.dangerPressed },
};

export function AppButton({ title, onPress, variant = 'primary', disabled = false, loading = false }: AppButtonProps) {
  const { base, pressed } = variantColors[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed: isPressed }) => [
        styles.button,
        { backgroundColor: isDisabled ? colors.border : isPressed ? pressed : base },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: 400,
    minHeight: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: '#3a2a1a',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textDisabled: {
    color: '#fff8',
  },
});
