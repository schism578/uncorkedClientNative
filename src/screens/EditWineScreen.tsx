import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { getAuthToken } from '../api/auth';
import { API_URL } from '../api/config';
import { getErrorMessage } from '../api/errors';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Dropdown } from '../components/Dropdown';
import { PhotoPicker } from '../components/PhotoPicker';
import { WINE_TYPE_OPTIONS } from '../constants';
import { colors, spacing, input as inputStyle } from '../theme';

type EditScreenRouteProp = RouteProp<RootStackParamList, 'EditWine'>;

const EditWineScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditWine'>>();
  const route = useRoute<EditScreenRouteProp>();
  const { userInfo, wines, setWines } = useAppContext();
  const wine = route.params?.wine;
  const [form, setForm] = useState({ ...wine });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // Validation helper
  const validate = () => {
    if (!form.winemaker?.trim()) return 'Winemaker is required.';
    if (!form.wine_type?.trim()) return 'Wine type is required.';
    if (!form.wine_name?.trim()) return 'Wine name is required.';
    // Vintage: must be a 4-digit year or 'NV'
    if (form.vintage && form.vintage.trim().toUpperCase() !== 'NV') {
      const year = parseInt(form.vintage, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        return 'Vintage must be a valid year (1900-' + (currentYear + 1) + ') or "NV".';
      }
    }
    // Rating: must be 1-5 if provided
    if (form.rating && (isNaN(Number(form.rating)) || Number(form.rating) < 1 || Number(form.rating) > 5)) {
      return 'Rating must be a number between 1 and 5.';
    }
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
      const token = await getAuthToken();
      const res = await fetch(`${API_URL}/wine/${userInfo?.user_id}/${wine.wine_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw await res.json();
      const updatedWine = await res.json();
      setWines(wines.map(w => w.wine_id === wine.wine_id ? updatedWine : w));
      Alert.alert('Success', 'Wine updated!');
      navigation.goBack();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to update wine'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.heading}>Edit Wine</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Dropdown
        placeholder="Wine Type"
        value={form.wine_type || ''}
        options={WINE_TYPE_OPTIONS}
        onChange={v => handleChange('wine_type', v)}
      />
      <TextInput style={styles.input} placeholder="Winemaker" placeholderTextColor={colors.placeholder} value={form.winemaker} onChangeText={v => handleChange('winemaker', v)} />
      <TextInput style={styles.input} placeholder="Wine Name" placeholderTextColor={colors.placeholder} value={form.wine_name} onChangeText={v => handleChange('wine_name', v)} />
      <TextInput style={styles.input} placeholder="Grape Varietals" placeholderTextColor={colors.placeholder} value={form.varietal} onChangeText={v => handleChange('varietal', v)} />
      <TextInput style={styles.input} placeholder="Region" placeholderTextColor={colors.placeholder} value={form.region} onChangeText={v => handleChange('region', v)} />
      <TextInput style={styles.input} placeholder="Vintage" placeholderTextColor={colors.placeholder} value={String(form.vintage)} onChangeText={v => handleChange('vintage', v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Tasting Notes" placeholderTextColor={colors.placeholder} value={form.tasting_notes} onChangeText={v => handleChange('tasting_notes', v)} />
      <TextInput style={styles.input} placeholder="Rating (1-5)" placeholderTextColor={colors.placeholder} value={String(form.rating)} onChangeText={v => handleChange('rating', v)} keyboardType="numeric" />
      <PhotoPicker value={form.img_url || ''} onChange={v => handleChange('img_url', v)} />
      <AppButton title="Save Changes" variant="primary" onPress={handleSubmit} loading={loading} />
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

export default EditWineScreen;
