import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import type { FoodPairing, PairingSuggestion } from '../context';
import { getPairingSuggestions, getPairingsForWine, createPairing, deletePairing } from '../api/pairing';
import { getErrorMessage } from '../api/errors';

type PairingScreenRouteProp = RouteProp<RootStackParamList, 'Pairing'>;

const foodTypeLabels: Record<string, string> = {
  cheese: 'Cheese',
  charcuterie: 'Charcuterie',
  dish: 'Dish',
};

const PairingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Pairing'>>();
  const route = useRoute<PairingScreenRouteProp>();
  const { userInfo } = useAppContext();
  const wine = route.params?.wine;

  const [suggestions, setSuggestions] = useState<PairingSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<number, { name: string; notes: string }>>({});

  const [savedPairings, setSavedPairings] = useState<FoodPairing[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const loadSavedPairings = useCallback(async () => {
    if (!userInfo) return;
    setLoadingSaved(true);
    try {
      const data = await getPairingsForWine(userInfo.user_id, wine.wine_id);
      setSavedPairings(data);
    } catch (err: any) {
      // non-fatal: saved list is secondary to suggestions
    } finally {
      setLoadingSaved(false);
    }
  }, [userInfo, wine.wine_id]);

  useEffect(() => {
    let isMounted = true;
    setLoadingSuggestions(true);
    setSuggestionError(null);
    getPairingSuggestions(wine.wine_id)
      .then(data => {
        if (isMounted) {
          setSuggestions(data);
          setEdits(
            data.reduce((acc, s, i) => {
              acc[i] = { name: s.name, notes: s.reason };
              return acc;
            }, {} as Record<number, { name: string; notes: string }>)
          );
        }
      })
      .catch(err => {
        if (isMounted) setSuggestionError(getErrorMessage(err, 'Failed to load pairing suggestions'));
      })
      .finally(() => {
        if (isMounted) setLoadingSuggestions(false);
      });
    loadSavedPairings();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditChange = (index: number, key: 'name' | 'notes', value: string) => {
    setEdits({ ...edits, [index]: { ...edits[index], [key]: value } });
  };

  const handleSave = async (suggestion: PairingSuggestion, index: number) => {
    if (!userInfo) return;
    const edited = edits[index] || { name: suggestion.name, notes: suggestion.reason };
    setSavingIndex(index);
    try {
      await createPairing(userInfo.user_id, {
        wine_id: wine.wine_id,
        food_type: suggestion.food_type,
        name: edited.name,
        notes: edited.notes,
        source: 'ai_suggested',
      });
      await loadSavedPairings();
      Alert.alert('Saved', `${edited.name} added to your memories.`);
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to save pairing'));
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDelete = async (pairing_id: string) => {
    if (!userInfo) return;
    try {
      await deletePairing(userInfo.user_id, pairing_id);
      setSavedPairings(savedPairings.filter(p => p.pairing_id !== pairing_id));
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to delete pairing'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Pairings for {wine.wine_name}</Text>

      <Text style={styles.subheading}>AI Suggestions</Text>
      {loadingSuggestions && <ActivityIndicator size="large" color="#b22222" style={{ marginVertical: 24 }} />}
      {suggestionError && <Text style={styles.error}>{suggestionError}</Text>}
      {!loadingSuggestions && !suggestionError && suggestions.length === 0 && (
        <Text style={styles.noResults}>No suggestions available right now.</Text>
      )}
      {suggestions.map((s, i) => (
        <View key={`${s.name}-${i}`} style={styles.card}>
          <Text style={styles.badge}>{foodTypeLabels[s.food_type] || s.food_type}</Text>
          {s.recipe_blurb ? <Text style={styles.cardBody}>{s.recipe_blurb}</Text> : null}
          <TextInput
            style={styles.input}
            value={edits[i]?.name ?? s.name}
            onChangeText={v => handleEditChange(i, 'name', v)}
            placeholder="Name"
          />
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={edits[i]?.notes ?? s.reason}
            onChangeText={v => handleEditChange(i, 'notes', v)}
            placeholder="Notes"
            multiline
          />
          <Button
            title={savingIndex === i ? 'Saving...' : 'Save to my memories'}
            color="#b22222"
            onPress={() => handleSave(s, i)}
            disabled={savingIndex !== null}
          />
        </View>
      ))}

      <Text style={styles.subheading}>Saved Pairings</Text>
      {loadingSaved && <ActivityIndicator size="small" color="#b22222" style={{ marginVertical: 12 }} />}
      {!loadingSaved && savedPairings.length === 0 && (
        <Text style={styles.noResults}>No saved pairings for this wine yet.</Text>
      )}
      {savedPairings.map(p => (
        <View key={p.pairing_id} style={styles.card}>
          <Text style={styles.badge}>{foodTypeLabels[p.food_type] || p.food_type}</Text>
          <Text style={styles.cardTitle}>{p.name}</Text>
          {p.notes ? <Text style={styles.cardBody}>{p.notes}</Text> : null}
          <Button title="Delete" color="#888" onPress={() => handleDelete(p.pairing_id)} />
        </View>
      ))}

      <Button title="Go Back" color="#888" onPress={() => navigation.goBack()} />
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
    marginBottom: 16,
    color: '#b22222',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b22222',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  noResults: {
    fontSize: 16,
    color: '#888',
    marginVertical: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PairingScreen;
