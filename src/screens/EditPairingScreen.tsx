import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { useAppContext } from '../context';
import { updatePairing } from '../api/pairing';
import { getErrorMessage } from '../api/errors';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { Dropdown } from '../components/Dropdown';
import { PhotoPicker } from '../components/PhotoPicker';
import { FOOD_TYPE_OPTIONS } from '../constants';
import { colors, spacing, card, input as inputStyle } from '../theme';

type EditPairingRouteProp = RouteProp<RootStackParamList, 'EditPairing'>;

const EditPairingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditPairing'>>();
  const route = useRoute<EditPairingRouteProp>();
  const { userInfo } = useAppContext();
  const pairing = route.params?.pairing;

  const [name, setName] = useState(pairing.name);
  const [foodType, setFoodType] = useState<string>(pairing.food_type);
  const [notes, setNotes] = useState(pairing.notes || '');
  const [imgUrl, setImgUrl] = useState(pairing.img_url || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!userInfo) return;
    if (!name.trim() || !foodType) {
      Alert.alert('Missing info', 'Please enter a name and select a type.');
      return;
    }
    setSaving(true);
    try {
      await updatePairing(userInfo.user_id, pairing.pairing_id, {
        food_type: foodType,
        name: name.trim(),
        notes: notes.trim() || undefined,
        img_url: imgUrl,
      });
      Alert.alert('Saved', `${name.trim()} updated.`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to update pairing'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.subheading}>Edit Pairing</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
        />
        <Dropdown
          placeholder="Choose a type"
          value={foodType}
          options={FOOD_TYPE_OPTIONS}
          onChange={setFoodType}
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Pairing Notes"
          placeholderTextColor={colors.placeholder}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <PhotoPicker value={imgUrl} onChange={setImgUrl} />
        <AppButton title="Save" variant="primary" onPress={handleSave} loading={saving} />
        <AppButton title="Cancel" variant="muted" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  card: {
    ...card,
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
});

export default EditPairingScreen;
