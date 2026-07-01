import React, { ReactNode, ComponentProps } from 'react';
import { View, ScrollView, KeyboardAvoidingView, ImageBackground, Platform, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

const backgroundImage = require('../../assets/background.jpg');

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
}

export function Screen({ children, scroll = true, contentStyle, refreshControl }: ScreenProps) {
  return (
    <ImageBackground source={backgroundImage} style={styles.root} resizeMode="cover">
      <View style={styles.overlay} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.content, contentStyle]} refreshControl={refreshControl}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.centeredContent, contentStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  flex: {
    flex: 1,
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
