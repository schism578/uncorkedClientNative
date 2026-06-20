import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { getAuthToken, clearAuthToken } from '../api/auth';
import { API_URL } from '../api/config';
import { getErrorMessage } from '../api/errors';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { colors, spacing, card } from '../theme';

const defaultImages: Record<string, any> = {
  red: require('../../assets/red.jpg'),
  white: require('../../assets/white.jpg'),
  rose: require('../../assets/rose.jpg'),
  sparkling: require('../../assets/sparkling.jpg'),
};

const UserHistoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'UserHistory'>>();
  const { userInfo, wines, setUserInfo, setWines } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/wine/${userInfo.user_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setWines(data);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to load history'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo, setWines]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDelete = async (wine_id: string) => {
    if (!userInfo) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/wine/${userInfo.user_id}/${wine_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw await res.json();
      setWines(wines.filter(w => w.wine_id !== wine_id));
      Alert.alert('Deleted', 'Wine entry deleted.');
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to delete wine'));
    }
  };

  const handleEdit = (wine: any) => {
    navigation.navigate('EditWine', { wine });
  };

  const handleLogout = async () => {
    await clearAuthToken();
    setUserInfo(null);
    setWines([]);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const renderWineImage = (wine: any) => {
    if (wine.img_url) {
      return (
        <Image source={{ uri: wine.img_url }} style={styles.image} resizeMode="cover" />
      );
    }
    if (wine.wine_type && defaultImages[wine.wine_type]) {
      return (
        <Image source={defaultImages[wine.wine_type]} style={styles.image} resizeMode="cover" />
      );
    }
    return null;
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.heading}>Your Wine History</Text>
      {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xl }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && wines.length === 0 && <Text style={styles.noResults}>No wines found in your history.</Text>}
      {wines.map(wine => (
        <View key={wine.wine_id} style={styles.wineItem}>
          {renderWineImage(wine)}
          <Text style={styles.label}>Wine Type: <Text style={styles.value}>{wine.wine_type}</Text></Text>
          <Text style={styles.label}>Winemaker: <Text style={styles.value}>{wine.winemaker}</Text></Text>
          <Text style={styles.label}>Wine Name: <Text style={styles.value}>{wine.wine_name}</Text></Text>
          <Text style={styles.label}>Varietal(s): <Text style={styles.value}>{wine.varietal}</Text></Text>
          <Text style={styles.label}>Vintage: <Text style={styles.value}>{wine.vintage}</Text></Text>
          <Text style={styles.label}>Region: <Text style={styles.value}>{wine.region}</Text></Text>
          <Text style={styles.label}>Tasting Notes: <Text style={styles.value}>{wine.tasting_notes}</Text></Text>
          <Text style={styles.label}>Rating: <Text style={styles.value}>{wine.rating}</Text></Text>
          <View style={styles.buttonRow}>
            <AppButton title="Pair It" variant="secondary" onPress={() => navigation.navigate('Pairing', { wine })} />
            <AppButton title="Edit" variant="muted" onPress={() => handleEdit(wine)} />
            <AppButton title="Delete" variant="danger" onPress={() => handleDelete(wine.wine_id)} />
          </View>
        </View>
      ))}
      <AppButton title="Go Back" variant="primary" onPress={() => navigation.navigate('Main')} />
      <AppButton title="Logout" variant="muted" onPress={handleLogout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: colors.primary,
    textAlign: 'center',
  },
  wineItem: {
    ...card,
    alignItems: 'center',
  },
  image: {
    width: 130,
    height: 160,
    borderRadius: 8,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
  },
  label: {
    fontWeight: 'bold',
    color: colors.textDark,
  },
  value: {
    fontWeight: 'normal',
    color: colors.textBody,
  },
  noResults: {
    fontSize: 18,
    color: colors.muted,
    marginVertical: spacing.xl,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'column',
    width: '100%',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
});

export default UserHistoryScreen;
