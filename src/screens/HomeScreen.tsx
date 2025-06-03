import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuthToken, clearAuthToken } from '../api/auth';
import { useAppContext } from '../context';

// Define the type for the stack's param list
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Main: undefined;
  Search: undefined;
  Results: undefined;
  UserHistory: undefined;
  EditWine: { wine: any };
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const { setUserInfo, setWines } = useAppContext();

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    })();
  }, [navigation]);

  const handleLogout = async () => {
    await clearAuthToken();
    setUserInfo(null);
    setWines([]);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>making memories, one glass at a time</Text>
      <Text style={styles.subheading}>
        open something new. record your memories. revisit your favorites.
      </Text>
      <Button
        title="Begin"
        color="#b22222"
        onPress={() => navigation.navigate('Login')}
      />
      <Button
        title="Logout"
        color="#888"
        onPress={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(255, 198, 205, 0.1)',
  },
  heading: {
    fontSize: 24,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  subheading: {
    fontSize: 18,
    marginBottom: 48,
    textAlign: 'center',
    color: '#444',
  },
});

export default HomeScreen;
