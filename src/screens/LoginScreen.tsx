import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { postLogin, postUser, saveAuthToken } from '../api/auth';
import { getErrorMessage } from '../api/errors';
import { useAppContext } from '../context';
import { Screen } from '../components/Screen';
import { AppButton } from '../components/AppButton';
import { colors, spacing, radius, input as inputStyle } from '../theme';

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();
  const { setUserInfo } = useAppContext();
  // State for login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  // State for sign up
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  // API logic
  const handleLogin = async () => {
    setLoginError(null);
    if (!loginUsername || !loginPassword) {
      setLoginError('Username and password required');
      return;
    }
    try {
      const res = await postLogin({ username: loginUsername, password: loginPassword });
      await saveAuthToken(res.authToken);
      setUserInfo({ user_id: String(res.user.user_id), username: res.user.username });
      navigation.navigate('Main');
    } catch (err: any) {
      setLoginError(getErrorMessage(err, 'Login failed'));
    }
  };

  const handleSignup = async () => {
    setSignupError(null);
    if (!signupUsername || !signupPassword) {
      setSignupError('Username and password required');
      return;
    }
    try {
      await postUser({ username: signupUsername, password: signupPassword });
      Alert.alert('Profile created!', 'You can now log in.');
      setSignupUsername('');
      setSignupPassword('');
    } catch (err: any) {
      setSignupError(getErrorMessage(err, 'Sign up failed'));
    }
  };

  return (
    <Screen>
      <View style={styles.formSection}>
        <Text style={styles.legend}>Create Profile</Text>
        {signupError ? <Text style={styles.error}>{signupError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          value={signupUsername}
          onChangeText={setSignupUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={signupPassword}
          onChangeText={setSignupPassword}
          secureTextEntry
        />
        <AppButton title="Sign Up" variant="primary" onPress={handleSignup} />
      </View>
      <View style={styles.formSection}>
        <Text style={styles.legend}>Log In</Text>
        {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          value={loginUsername}
          onChangeText={setLoginUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
        />
        <AppButton title="Login" variant="primary" onPress={handleLogin} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  formSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  legend: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.primary,
  },
  input: {
    ...inputStyle,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default LoginScreen;
