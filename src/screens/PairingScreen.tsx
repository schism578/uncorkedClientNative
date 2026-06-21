import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import type { FoodPairing, PairingSuggestion } from '../context';
import { getPairingSuggestions, getPairingsForWine, createPairing, deletePairing } from '../api/pairing';
import { getErrorMessage } from '../api/errors';
import { openNearbySearch } from '../utils/maps';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Dropdown } from '../components/Dropdown';
import { PhotoPicker } from '../components/PhotoPicker';
import { FOOD_TYPE_OPTIONS } from '../constants';
import { colors, spacing, radius, card, input as inputStyle } from '../theme';

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
  const [manualImgUrl, setManualImgUrl] = useState('');
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

  useFocusEffect(
    useCallback(() => {
      loadSavedPairings();
    }, [loadSavedPairings])
  );

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
        img_url: manualImgUrl || undefined,
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
          placeholderTextColor={colors.placeholder}
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={sectionEdits[i]?.notes ?? s.reason}
          onChangeText={v => onEditChange(i, 'notes', v)}
          placeholder="Notes"
          placeholderTextColor={colors.placeholder}
          multiline
        />
        <AppButton
          title={saveLabel}
          variant="primary"
          onPress={() => onSave(s, i)}
          loading={savingIdx === i}
          disabled={savingIdx !== null && savingIdx !== i}
        />
        <View style={styles.buttonSpacer} />
        <AppButton title={nearby.label} variant="secondary" onPress={() => openNearbySearch(nearby.query)} />
      </View>
    );
  };

  const renderSavedPairingRow = (p: FoodPairing) => {
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
            {p.img_url ? <Image source={{ uri: p.img_url }} style={styles.linkImage} resizeMode="cover" /> : null}
            {p.notes ? <Text style={styles.cardBody}>{p.notes}</Text> : null}
            <AppButton title={nearby.label} variant="secondary" onPress={() => openNearbySearch(nearby.query)} />
            <View style={styles.buttonSpacer} />
            <AppButton title="Edit Pairing" variant="muted" onPress={() => navigation.navigate('EditPairing', { pairing: p })} />
            <View style={styles.buttonSpacer} />
            <AppButton title="Delete" variant="danger" onPress={() => handleDelete(p.pairing_id)} />
          </View>
        )}
      </View>
    );
  };

  const userAddedPairings = savedPairings.filter(p => p.source !== 'ai_suggested');
  const aiSavedPairings = savedPairings.filter(p => p.source === 'ai_suggested');

  return (
    <Screen>
      <Text style={styles.heading}>Pairings for {wine.wine_name}</Text>

      <AppButton
        title={showAiSuggestions ? 'Hide Suggestions' : 'Get Suggestions'}
        variant="primary"
        onPress={handleToggleAiSuggestions}
      />
      <View style={styles.buttonSpacer} />
      <AppButton
        title={showManualForm ? 'Hide Record Your Own' : 'Record Your Own Pairing'}
        variant="secondary"
        onPress={() => setShowManualForm(!showManualForm)}
      />

      {showAiSuggestions && (
        <View style={styles.section}>
          <Text style={styles.subheading}>Suggestions</Text>
          {loadingSuggestions && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xl }} />}
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
              placeholderTextColor={colors.placeholder}
              value={manualName}
              onChangeText={setManualName}
            />
            <Dropdown
              placeholder="Choose a type"
              value={manualType}
              options={FOOD_TYPE_OPTIONS}
              onChange={setManualType}
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Pairing Notes"
              placeholderTextColor={colors.placeholder}
              value={manualNotes}
              onChangeText={setManualNotes}
              multiline
            />
            <PhotoPicker value={manualImgUrl} onChange={setManualImgUrl} />
            <AppButton
              title="Save"
              variant="primary"
              onPress={handleSaveManual}
              loading={manualSaving}
            />
            {!!manualType && (
              <>
                <View style={styles.buttonSpacer} />
                <AppButton
                  title="Find More Pairings Like This"
                  variant="secondary"
                  onPress={handleFindSimilar}
                  loading={loadingSimilar}
                />
              </>
            )}
          </View>

          {(loadingSimilar || similarError || similarSuggestions.length > 0) && (
            <View>
              <Text style={styles.subheading}>More Like This</Text>
              {loadingSimilar && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.xl }} />}
              {similarError && <Text style={styles.error}>{similarError}</Text>}
              {similarSuggestions.map((s, i) =>
                renderSuggestionCard(s, i, similarEdits, handleSimilarEditChange, handleSaveSimilar, similarSavingIndex, 'Save for Later')
              )}
            </View>
          )}
        </View>
      )}

      <Text style={styles.subheading}>Saved Pairings</Text>
      {loadingSaved && <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.sm }} />}
      {!loadingSaved && userAddedPairings.length === 0 && (
        <Text style={styles.noResults}>No saved pairings for this wine yet.</Text>
      )}
      {userAddedPairings.map(renderSavedPairingRow)}

      <Text style={styles.subheading}>Saved for Later</Text>
      {loadingSaved && <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.sm }} />}
      {!loadingSaved && aiSavedPairings.length === 0 && (
        <Text style={styles.noResults}>No pairings saved for later yet.</Text>
      )}
      {aiSavedPairings.map(renderSavedPairingRow)}

      <View style={styles.buttonSpacer} />
      <AppButton title="Go Back" variant="muted" onPress={() => navigation.goBack()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.primary,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    ...card,
  },
  linkCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  linkDetail: {
    marginTop: spacing.sm,
  },
  linkImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  cardBody: {
    fontSize: 14,
    color: colors.textBody,
    marginBottom: spacing.sm,
  },
  cardSubheading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
  input: {
    ...inputStyle,
    minHeight: 44,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  noResults: {
    fontSize: 16,
    color: colors.muted,
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default PairingScreen;
