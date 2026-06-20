import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuthToken, clearAuthToken, getCurrentUser } from '../api/auth';
import { useAppContext } from '../context';
import type { Wine } from '../context';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../theme';

// Define the type for the stack's param list
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Main: undefined;
  Search: undefined;
  Results: undefined;
  UserHistory: undefined;
  EditWine: { wine: any };
  Pairing: { wine: Wine };
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const { setUserInfo, setWines } = useAppContext();

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const user = await getCurrentUser();
        setUserInfo(user);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } catch {
        await clearAuthToken();
      }
    })();
  }, [navigation, setUserInfo]);

  const handleLogout = async () => {
    await clearAuthToken();
    setUserInfo(null);
    setWines([]);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <Screen scroll={false}>
      <Text style={styles.heading}>making memories, one glass at a time</Text>
      <Text style={styles.subheading}>
        open something new. record your memories. revisit your favorites.
      </Text>
      <AppButton title="Begin" variant="primary" onPress={() => navigation.navigate('Login')} />
      <AppButton title="Logout" variant="muted" onPress={handleLogout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.textDark,
  },
  subheading: {
    fontSize: 18,
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: colors.textBody,
  },
});

export default HomeScreen;
