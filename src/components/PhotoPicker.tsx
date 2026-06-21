import React from 'react';
import { View, Image, Alert, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { AppButton } from './AppButton';
import { colors, radius, spacing } from '../theme';

interface PhotoPickerProps {
  value: string;
  onChange: (uri: string) => void;
}

const pickerOptions = {
  mediaType: 'photo' as const,
  quality: 0.7 as const,
  maxWidth: 1024,
  maxHeight: 1024,
  includeBase64: true,
};

export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const handleResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Could not get photo.');
      return;
    }
    const asset = response.assets?.[0];
    if (!asset?.base64) return;
    onChange(`data:${asset.type || 'image/jpeg'};base64,${asset.base64}`);
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Camera permission needed', 'Allow camera access to take a photo.');
        return;
      }
    }
    const response = await launchCamera(pickerOptions);
    handleResponse(response);
  };

  const handleChooseLibrary = async () => {
    const response = await launchImageLibrary(pickerOptions);
    handleResponse(response);
  };

  return (
    <View style={styles.container}>
      {value ? <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" /> : null}
      <View style={styles.row}>
        <View style={styles.buttonWrap}>
          <AppButton title="Take Photo" variant="secondary" onPress={handleTakePhoto} />
        </View>
        <View style={styles.buttonWrap}>
          <AppButton title="Choose Photo" variant="secondary" onPress={handleChooseLibrary} />
        </View>
      </View>
      {value ? (
        <AppButton title="Remove Photo" variant="muted" onPress={() => onChange('')} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing.md,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonWrap: {
    flex: 1,
  },
});
