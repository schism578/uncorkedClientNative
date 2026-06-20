import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import type { FoodPairing, PairingSuggestion } from '../context';
import { getPairingSuggestions, getPairingsForWine, createPairing, deletePairing } from '../api/pairing';
import { getErrorMessage } from '../api/errors';
import { openNearbySearch } from '../utils/maps';

type PairingScreenRouteProp = RouteProp<RootStackParamList, 'Pairing'>;
type Edits = Record<number, { name: string; notes: string }>;

const foodTypeLabels: Record<string, string> = {
  cheese: 'Cheese',
  charcuterie: 'Charcuterie',
  dish: 'Dish',
};

function getNearbySearch(foodType: string, name: string): { label: string; query: string } {
  if (foodType === 'cheese') return { label: 'Find Nearby', query: `${name} cheese shop` };
  if (foodType === 'charcuterie') return { label: 'Find Nearby', query: `${name} butcher` };
  return { label: 'Find Ingredients Nearby', query: 'grocery store' };
}

function formatNotes(s: PairingSuggestion): string {
  if (!s.recipe) return s.reason;
  const ingredients = s.recipe.ingredients.map(i => `- ${i}`).join('\n');
  const steps = s.recipe.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
  return `${s.reason}\n\nIngredients:\n${ingredients}\n\nSteps:\n${steps}`;
}

function editsFromSuggestions(data: PairingSuggestion[]): Edits {
  return data.reduce((acc, s, i) => {
    acc[i] = { name: s.name, notes: formatNotes(s) };
    return acc;
  }, {} as Edits);
}

const PairingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Pairing'>>();
  const route = useRoute<PairingScreenRouteProp>();
  const { userInfo } = useAppContext();
  const wine = route.params?.wine;

  // Generic "Get AI Suggestions" section
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<PairingSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Edits>({});
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  // "Record Your Own Pairing" section
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSaving, setManualSaving] = useState(false);

  // "Find More Pairings Like This" results
  const [similarSuggestions, setSimilarSuggestions] = useState<PairingSuggestion[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [similarEdits, setSimilarEdits] = useState<Edits>({});
  const [similarSavingIndex, setSimilarSavingIndex] = useState<number | null>(null);

  // Saved pairings
  const [savedPairings, setSavedPairings] = useState<FoodPairing[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [expandedPairingId, setExpandedPairingId] = useState<string | null>(null);

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
    loadSavedPairings();
  }, [loadSavedPairings]);

  const fetchSuggestions = () => {
    setLoadingSuggestions(true);
    setSuggestionError(null);
    getPairingSuggestions(wine.wine_id)
      .then(data => {
        setSuggestions(data);
        setEdits(editsFromSuggestions(data));
      })
      .catch(err => setSuggestionError(getErrorMessage(err, 'Failed to load pairing suggestions')))
      .finally(() => setLoadingSuggestions(false));
  };

  const handleToggleAiSuggestions = () => {
    const opening = !showAiSuggestions;
    setShowAiSuggestions(opening);
    if (opening && suggestions.length === 0 && !loadingSuggestions) {
      fetchSuggestions();
    }
  };

  const handleEditChange = (index: number, key: 'name' | 'notes', value: string) => {
    setEdits({ ...edits, [index]: { ...edits[index], [key]: value } });
  };

  const handleSimilarEditChange = (index: number, key: 'name' | 'notes', value: string) => {
    setSimilarEdits({ ...similarEdits, [index]: { ...similarEdits[index], [key]: value } });
  };

  const saveSuggestionAsPairing = async (suggestion: PairingSuggestion, name: string, notes: string) => {
    if (!userInfo) return;
    await createPairing(userInfo.user_id, {
      wine_id: wine.wine_id,
      food_type: suggestion.food_type,
      name,
      notes,
      source: 'ai_suggested',
    });
    await loadSavedPairings();
  };

  const handleSaveSuggestion = async (suggestion: PairingSuggestion, index: number) => {
    const edited = edits[index] || { name: suggestion.name, notes: formatNotes(suggestion) };
    setSavingIndex(index);
    try {
      await saveSuggestionAsPairing(suggestion, edited.name, edited.notes);
      Alert.alert('Saved', `${edited.name} added to your memories.`);
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to save pairing'));
    } finally {
      setSavingIndex(null);
    }
  };

  const handleSaveSimilar = async (suggestion: PairingSuggestion, index: number) => {
    const edited = similarEdits[index] || { name: suggestion.name, notes: formatNotes(suggestion) };
    setSimilarSavingIndex(index);
    try {
      await saveSuggestionAsPairing(suggestion, edited.name, edited.notes);
      Alert.alert('Saved for later', `${edited.name} added to your memories.`);
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to save pairing'));
    } finally {
      setSimilarSavingIndex(null);
    }
  };

  const handleSaveManual = async () => {
    if (!userInfo) return;
    if (!manualName.trim() || !manualType) {
      Alert.alert('Missing info', 'Please enter a name and select a type.');
      return;
    }
    setManualSaving(true);
    try {
      await createPairing(userInfo.user_id, {
        wine_id: wine.wine_id,
        food_type: manualType,
        name: manualName.trim(),
        notes: manualNotes.trim() || undefined,
        source: 'user_added',
      });
      await loadSavedPairings();
      Alert.alert('Saved', `${manualName.trim()} added to your memories.`);
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to save pairing'));
    } finally {
      setManualSaving(false);
    }
  };

  const handleFindSimilar = () => {
    if (!manualType) return;
    setLoadingSimilar(true);
    setSimilarError(null);
    getPairingSuggestions(wine.wine_id, { food_type: manualType, seed_name: manualName.trim() || undefined, count: 5 })
      .then(data => {
        setSimilarSuggestions(data);
        setSimilarEdits(editsFromSuggestions(data));
      })
      .catch(err => setSimilarError(getErrorMessage(err, 'Failed to load similar pairings')))
      .finally(() => setLoadingSimilar(false));
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

  const renderSuggestionCard = (
    s: PairingSuggestion,
    i: number,
    sectionEdits: Edits,
    onEditChange: (index: number, key: 'name' | 'notes', value: string) => void,
    onSave: (s: PairingSuggestion, i: number) => void,
    savingIdx: number | null,
    saveLabel: string
  ) => {
    const nearby = getNearbySearch(s.food_type, s.name);
    return (
      <View key={`${s.name}-${i}`} style={styles.card}>
        <Text style={styles.badge}>{foodTypeLabels[s.food_type] || s.food_type}</Text>
        {s.recipe ? (
          <View>
            <Text style={styles.cardSubheading}>Ingredients</Text>
            {s.recipe.ingredients.map((ing, idx) => (
              <Text key={idx} style={styles.cardBody}>{`• ${ing}`}</Text>
            ))}
            <Text style={styles.cardSubheading}>Steps</Text>
            {s.recipe.steps.map((step, idx) => (
              <Text key={idx} style={styles.cardBody}>{`${idx + 1}. ${step}`}</Text>
            ))}
          </View>
        ) : null}
        <TextInput
          style={styles.input}
          value={sectionEdits[i]?.name ?? s.name}
          onChangeText={v => onEditChange(i, 'name', v)}
          placeholder="Name"
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={sectionEdits[i]?.notes ?? s.reason}
          onChangeText={v => onEditChange(i, 'notes', v)}
          placeholder="Notes"
          multiline
        />
        <Button
          title={savingIdx === i ? 'Saving...' : saveLabel}
          color="#b22222"
          onPress={() => onSave(s, i)}
          disabled={savingIdx !== null}
        />
        <View style={styles.buttonSpacer} />
        <Button title={nearby.label} color="#6b4226" onPress={() => openNearbySearch(nearby.query)} />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Pairings for {wine.wine_name}</Text>

      <Button
        title={showAiSuggestions ? 'Hide AI Suggestions' : 'Get AI Suggestions'}
        color="#b22222"
        onPress={handleToggleAiSuggestions}
      />
      <View style={styles.buttonSpacer} />
      <Button
        title={showManualForm ? 'Hide Record Your Own' : 'Record Your Own Pairing'}
        color="#6b4226"
        onPress={() => setShowManualForm(!showManualForm)}
      />

      {showAiSuggestions && (
        <View style={styles.section}>
          <Text style={styles.subheading}>AI Suggestions</Text>
          {loadingSuggestions && <ActivityIndicator size="large" color="#b22222" style={{ marginVertical: 24 }} />}
          {suggestionError && <Text style={styles.error}>{suggestionError}</Text>}
          {!loadingSuggestions && !suggestionError && suggestions.length === 0 && (
            <Text style={styles.noResults}>No suggestions available right now.</Text>
          )}
          {suggestions.map((s, i) =>
            renderSuggestionCard(s, i, edits, handleEditChange, handleSaveSuggestion, savingIndex, 'Save to my memories')
          )}
        </View>
      )}

      {showManualForm && (
        <View style={styles.section}>
          <Text style={styles.subheading}>Record Your Own Pairing</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={manualName}
              onChangeText={setManualName}
            />
            <Picker
              selectedValue={manualType}
              style={styles.input}
              onValueChange={setManualType}
            >
              <Picker.Item label="Choose a type" value="" />
              <Picker.Item label="Cheese" value="cheese" />
              <Picker.Item label="Charcuterie" value="charcuterie" />
              <Picker.Item label="Dish" value="dish" />
            </Picker>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Pairing Notes"
              value={manualNotes}
              onChangeText={setManualNotes}
              multiline
            />
            <Button
              title={manualSaving ? 'Saving...' : 'Save'}
              color="#b22222"
              onPress={handleSaveManual}
              disabled={manualSaving}
            />
            {!!manualType && (
              <>
                <View style={styles.buttonSpacer} />
                <Button
                  title={loadingSimilar ? 'Finding...' : 'Find More Pairings Like This'}
                  color="#6b4226"
                  onPress={handleFindSimilar}
                  disabled={loadingSimilar}
                />
              </>
            )}
          </View>

          {(loadingSimilar || similarError || similarSuggestions.length > 0) && (
            <View>
              <Text style={styles.subheading}>More Like This</Text>
              {loadingSimilar && <ActivityIndicator size="large" color="#b22222" style={{ marginVertical: 24 }} />}
              {similarError && <Text style={styles.error}>{similarError}</Text>}
              {similarSuggestions.map((s, i) =>
                renderSuggestionCard(s, i, similarEdits, handleSimilarEditChange, handleSaveSimilar, similarSavingIndex, 'Save for Later')
              )}
            </View>
          )}
        </View>
      )}

      <Text style={styles.subheading}>Saved Pairings</Text>
      {loadingSaved && <ActivityIndicator size="small" color="#b22222" style={{ marginVertical: 12 }} />}
      {!loadingSaved && savedPairings.length === 0 && (
        <Text style={styles.noResults}>No saved pairings for this wine yet.</Text>
      )}
      {savedPairings.map(p => {
        const nearby = getNearbySearch(p.food_type, p.name);
        const isExpanded = expandedPairingId === p.pairing_id;
        return (
          <View key={p.pairing_id} style={styles.linkCard}>
            <TouchableOpacity onPress={() => setExpandedPairingId(isExpanded ? null : p.pairing_id)}>
              <View style={styles.linkRow}>
                <Text style={styles.badge}>{foodTypeLabels[p.food_type] || p.food_type}</Text>
                <Text style={styles.linkTitle}>{p.name}</Text>
              </View>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.linkDetail}>
                {p.notes ? <Text style={styles.cardBody}>{p.notes}</Text> : null}
                <Button title={nearby.label} color="#6b4226" onPress={() => openNearbySearch(nearby.query)} />
                <View style={styles.buttonSpacer} />
                <Button title="Delete" color="#888" onPress={() => handleDelete(p.pairing_id)} />
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.buttonSpacer} />
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
  section: {
    width: '100%',
    alignItems: 'center',
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
  linkCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b22222',
    textDecorationLine: 'underline',
  },
  linkDetail: {
    marginTop: 12,
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b22222',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  cardSubheading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 4,
  },
  buttonSpacer: {
    height: 8,
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
