import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { getAuthToken } from '../api/auth';
import { API_URL } from '../api/config';
import { getErrorMessage } from '../api/errors';

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
    // Optional: validate img_url if provided
    if (form.img_url && !/^https?:\/\/.+\..+/.test(form.img_url)) {
      return 'Photo URL must be a valid URL.';
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Wine</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput style={styles.input} placeholder="Wine Type" value={form.wine_type} onChangeText={v => handleChange('wine_type', v)} />
      <TextInput style={styles.input} placeholder="Winemaker" value={form.winemaker} onChangeText={v => handleChange('winemaker', v)} />
      <TextInput style={styles.input} placeholder="Wine Name" value={form.wine_name} onChangeText={v => handleChange('wine_name', v)} />
      <TextInput style={styles.input} placeholder="Grape Varietals" value={form.varietal} onChangeText={v => handleChange('varietal', v)} />
      <TextInput style={styles.input} placeholder="Region" value={form.region} onChangeText={v => handleChange('region', v)} />
      <TextInput style={styles.input} placeholder="Vintage" value={String(form.vintage)} onChangeText={v => handleChange('vintage', v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Tasting Notes" value={form.tasting_notes} onChangeText={v => handleChange('tasting_notes', v)} />
      <TextInput style={styles.input} placeholder="Rating (1-5)" value={String(form.rating)} onChangeText={v => handleChange('rating', v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Photo URL (optional)" value={form.img_url || ''} onChangeText={v => handleChange('img_url', v)} />
      <Button title={loading ? 'Saving...' : 'Save Changes'} color="#b22222" onPress={handleSubmit} disabled={loading} />
      <Button title="Cancel" color="#888" onPress={() => navigation.goBack()} />
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

export default EditWineScreen;
