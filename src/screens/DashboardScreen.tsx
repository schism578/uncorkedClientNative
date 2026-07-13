import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { clearAuthToken } from '../api/auth';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../theme';

const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Dashboard'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Dashboard'>>();
  const { userInfo, setUserInfo, setWines } = useAppContext();
  const isNewUser = route.params?.isNewUser ?? false;

  const handleLogout = async () => {
    await clearAuthToken();
    setUserInfo(null);
    setWines([]);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <Screen scroll={false}>
      <Text style={styles.heading}>
        {userInfo?.username
          ? isNewUser ? `Welcome, ${userInfo.username}` : `Welcome back, ${userInfo.username}`
          : 'Welcome back'}
      </Text>
      <Text style={styles.subheading}>What would you like to do?</Text>
      <AppButton title="Add a New Wine" variant="primary" onPress={() => navigation.navigate('Main')} />
      <AppButton title="My Memories" variant="secondary" onPress={() => navigation.navigate('UserHistory')} />
      <AppButton title="Search" variant="secondary" onPress={() => navigation.navigate('Search')} />
      <AppButton title="Logout" variant="muted" onPress={handleLogout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.primary,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: colors.textBody,
  },
});

export default DashboardScreen;
