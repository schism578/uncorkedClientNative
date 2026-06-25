import React, { ReactNode, ComponentProps } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
}

export function Screen({ children, scroll = true, contentStyle, refreshControl }: ScreenProps) {
  if (!scroll) {
    return (
      <KeyboardAvoidingView style={styles.background} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.centeredContent, contentStyle]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  }
  return (
    <KeyboardAvoidingView style={styles.background} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} refreshControl={refreshControl}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
