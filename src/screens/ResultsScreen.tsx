import React from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';

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
    <ScrollView contentContainerStyle={styles.container}>
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
      <Button title="Go Back" color="#b22222" onPress={() => navigation.navigate('Search')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#b22222',
    textAlign: 'center',
  },
  wineItem: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 130,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontWeight: 'normal',
    color: '#444',
  },
  noResults: {
    fontSize: 18,
    color: '#888',
    marginVertical: 32,
    textAlign: 'center',
  },
});

export default ResultsScreen;
