import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { searchWines } from '../api/wine';
import { getErrorMessage } from '../api/errors';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Dropdown } from '../components/Dropdown';
import { WINE_TYPE_OPTIONS } from '../constants';
import { colors, spacing, input as inputStyle } from '../theme';

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
      setError(getErrorMessage(err, 'Search failed'));
      Alert.alert('Error', getErrorMessage(err, 'Search failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.heading}>Search Wines</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Dropdown
        placeholder="Wine Type (any)"
        value={form.wine_type || ''}
        options={[{ label: 'Any', value: '' }, ...WINE_TYPE_OPTIONS]}
        onChange={v => handleChange('wine_type', v)}
      />
      <TextInput style={styles.input} placeholder="Winemaker" placeholderTextColor={colors.placeholder} value={form.winemaker || ''} onChangeText={v => handleChange('winemaker', v)} />
      <TextInput style={styles.input} placeholder="Wine Name" placeholderTextColor={colors.placeholder} value={form.wine_name || ''} onChangeText={v => handleChange('wine_name', v)} />
      <TextInput style={styles.input} placeholder="Grape Varietals" placeholderTextColor={colors.placeholder} value={form.varietal || ''} onChangeText={v => handleChange('varietal', v)} />
      <TextInput style={styles.input} placeholder="Region" placeholderTextColor={colors.placeholder} value={form.region || ''} onChangeText={v => handleChange('region', v)} />
      <TextInput style={styles.input} placeholder="Vintage" placeholderTextColor={colors.placeholder} value={form.vintage || ''} onChangeText={v => handleChange('vintage', v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Tasting Notes" placeholderTextColor={colors.placeholder} value={form.tasting_notes || ''} onChangeText={v => handleChange('tasting_notes', v)} />
      <TextInput style={styles.input} placeholder="Rating (1-5)" placeholderTextColor={colors.placeholder} value={form.rating || ''} onChangeText={v => handleChange('rating', v)} keyboardType="numeric" />
      <AppButton title="Search" variant="primary" onPress={handleSubmit} loading={loading} />
      <AppButton title="Cancel" variant="muted" onPress={() => navigation.goBack()} />
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
  input: {
    ...inputStyle,
    maxWidth: 400,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default SearchScreen;
