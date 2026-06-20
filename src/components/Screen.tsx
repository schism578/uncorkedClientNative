import React, { ReactNode, ComponentProps } from 'react';
import { View, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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
      <View style={[styles.background, styles.centeredContent, contentStyle]}>
        {children}
      </View>
    );
  }
  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} refreshControl={refreshControl}>
        {children}
      </ScrollView>
    </View>
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
