import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { colors, spacing, card } from '../theme';

const defaultImages: Record<string, any> = {
  red: require('../../assets/red.jpg'),
  white: require('../../assets/white.jpg'),
  rose: require('../../assets/rose.jpg'),
  sparkling: require('../../assets/sparkling.jpg'),
};

const ResultsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Results'>>();
  const { searchResults } = useAppContext();

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
    <Screen>
      <Text style={styles.heading}>Results</Text>
      {searchResults.length === 0 ? (
        <Text style={styles.noResults}>No wines match that search.</Text>
      ) : (
        searchResults.map(wine => (
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
          </View>
        ))
      )}
      <AppButton title="Go Back" variant="primary" onPress={() => navigation.navigate('Search')} />
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
});

export default ResultsScreen;
