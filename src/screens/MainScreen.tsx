import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { launchCamera } from 'react-native-image-picker';
import { getAuthToken, clearAuthToken } from '../api/auth';
import { useAppContext } from '../context';
import { fetchWineImage } from '../api/wine';
import { API_URL } from '../api/config';
import { getErrorMessage } from '../api/errors';
import { scanWineLabel } from '../api/labelScan';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Dropdown } from '../components/Dropdown';
import { PhotoPicker } from '../components/PhotoPicker';
import { WINE_TYPE_OPTIONS } from '../constants';
import { colors, spacing, input as inputStyle } from '../theme';

const MainScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const { userInfo, setUserInfo, setWines } = useAppContext();
  const [form, setForm] = useState({
    winemaker: '',
    wine_type: '',
    wine_name: '',
    varietal: '',
    vintage: '',
    region: '',
    tasting_notes: '',
    rating: '',
    img_url: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleScan = () => {
    launchCamera(
      { mediaType: 'photo', includeBase64: true, quality: 0.9, maxWidth: 2048, maxHeight: 2048 },
      async (response) => {
        if (response.didCancel || response.errorCode) return;
        const base64 = response.assets?.[0]?.base64;
        if (!base64) return;
        setScanning(true);
        try {
          const scanned = await scanWineLabel(base64);
          setForm(prev => ({
            ...prev,
            winemaker:     scanned.winemaker     ?? prev.winemaker,
            wine_type:     scanned.wine_type     ?? prev.wine_type,
            wine_name:     scanned.wine_name     ?? prev.wine_name,
            varietal:      scanned.varietal      ?? prev.varietal,
            vintage:       scanned.vintage       ?? prev.vintage,
            region:        scanned.region        ?? prev.region,
            tasting_notes: scanned.tasting_notes ?? prev.tasting_notes,
          }));
        } catch (err: any) {
          Alert.alert('Scan failed', err.message ?? String(err));
        } finally {
          setScanning(false);
        }
      }
    );
  };

  // Validation helper
  const validate = () => {
    if (!form.winemaker.trim()) return 'Winemaker is required.';
    if (!form.wine_type.trim()) return 'Wine type is required.';
    if (!form.wine_name.trim()) return 'Wine name is required.';
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
      if (!token) throw new Error('Not authenticated');
      if (!userInfo) throw new Error('Not authenticated');
      const user_id = userInfo.user_id;
      let img_url = form.img_url;
      if (!img_url) {
        // Try to fetch an image from Unsplash
        const query = `${form.winemaker} ${form.wine_name} ${form.varietal}`;
        const fetchedImg = await fetchWineImage(query);
        img_url = fetchedImg || '';
      }
      const newWine = {
        user_id,
        winemaker: form.winemaker,
        wine_type: form.wine_type,
        wine_name: form.wine_name,
        varietal: form.varietal,
        vintage: form.vintage.toUpperCase() === 'NV' ? 'NV' : parseInt(form.vintage) || 0,
        region: form.region,
        tasting_notes: form.tasting_notes,
        rating: parseInt(form.rating) || 0,
        img_url,
      };
      const res = await fetch(`${API_URL}/wine/${user_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWine),
      });
      if (!res.ok) throw await res.json();
      Alert.alert('Wine added!', 'Your wine has been saved.');
      navigation.navigate('UserHistory');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to add wine'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthToken();
    setUserInfo(null);
    setWines([]);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <Screen>
      <Text style={styles.heading}>Add a New Wine</Text>
      <AppButton
        title={scanning ? 'Scanning label...' : 'Scan Label with Camera'}
        variant="secondary"
        onPress={handleScan}
        loading={scanning}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Winemaker (required)"
        placeholderTextColor={colors.placeholder}
        value={form.winemaker}
        onChangeText={v => handleChange('winemaker', v)}
      />
      <Dropdown
        placeholder="Choose a wine type (required)"
        value={form.wine_type}
        options={WINE_TYPE_OPTIONS}
        onChange={v => handleChange('wine_type', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Wine Name"
        placeholderTextColor={colors.placeholder}
        value={form.wine_name}
        onChangeText={v => handleChange('wine_name', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Grape Varietals"
        placeholderTextColor={colors.placeholder}
        value={form.varietal}
        onChangeText={v => handleChange('varietal', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Vintage (enter 0 if non-vintage)"
        placeholderTextColor={colors.placeholder}
        value={form.vintage}
        onChangeText={v => handleChange('vintage', v)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Region"
        placeholderTextColor={colors.placeholder}
        value={form.region}
        onChangeText={v => handleChange('region', v)}
      />
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Tasting Notes"
        placeholderTextColor={colors.placeholder}
        value={form.tasting_notes}
        onChangeText={v => handleChange('tasting_notes', v)}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Rate your wine: 1-5"
        placeholderTextColor={colors.placeholder}
        value={form.rating}
        onChangeText={v => handleChange('rating', v)}
        keyboardType="numeric"
      />
      <PhotoPicker value={form.img_url} onChange={v => handleChange('img_url', v)} />
      <AppButton title="Submit" variant="primary" onPress={handleSubmit} loading={loading} />
      <AppButton title="Cancel" variant="muted" onPress={() => navigation.navigate('Dashboard')} />
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
  input: {
    ...inputStyle,
    maxWidth: 400,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default MainScreen;
