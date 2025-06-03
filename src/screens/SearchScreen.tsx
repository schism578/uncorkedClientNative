import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { searchWines } from '../api/wine';

const SearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Search'>>();
  const { searchParams, setSearchParams, setSearchResults } = useAppContext();
  const [form, setForm] = useState({ ...searchParams });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // Validation helper
  const validate = () => {
    // All fields optional, but validate if present
    if (form.vintage && form.vintage.trim().toUpperCase() !== 'NV') {
      const year = parseInt(form.vintage, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        return 'Vintage must be a valid year (1900-' + (currentYear + 1) + ') or "NV".';
      }
    }
    if (form.rating && (isNaN(Number(form.rating)) || Number(form.rating) < 1 || Number(form.rating) > 5)) {
      return 'Rating must be a number between 1 and 5.';
    }
    // No img_url in search form, so skip that check
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      setSearchParams(form);
      const results = await searchWines(form);
      setSearchResults(results);
      navigation.navigate('Results');
    } catch (err: any) {
      setError(err.error || err.message || 'Search failed');
      Alert.alert('Error', err.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Search Wines</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput style={styles.input} placeholder="Wine Type" value={form.wine_type || ''} onChangeText={v => handleChange('wine_type', v)} />
      <TextInput style={styles.input} placeholder="Winemaker" value={form.winemaker || ''} onChangeText={v => handleChange('winemaker', v)} />
      <TextInput style={styles.input} placeholder="Wine Name" value={form.wine_name || ''} onChangeText={v => handleChange('wine_name', v)} />
      <TextInput style={styles.input} placeholder="Grape Varietals" value={form.varietal || ''} onChangeText={v => handleChange('varietal', v)} />
      <TextInput style={styles.input} placeholder="Region" value={form.region || ''} onChangeText={v => handleChange('region', v)} />
      <TextInput style={styles.input} placeholder="Vintage" value={form.vintage || ''} onChangeText={v => handleChange('vintage', v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Tasting Notes" value={form.tasting_notes || ''} onChangeText={v => handleChange('tasting_notes', v)} />
      <TextInput style={styles.input} placeholder="Rating (1-5)" value={form.rating || ''} onChangeText={v => handleChange('rating', v)} keyboardType="numeric" />
      <Button title={loading ? 'Searching...' : 'Search'} color="#b22222" onPress={handleSubmit} disabled={loading} />
      <Button title="Cancel" color="#888" onPress={() => navigation.navigate('Main')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  input: {
    width: '100%',
    maxWidth: 400,
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default SearchScreen;
