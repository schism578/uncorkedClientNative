import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './HomeScreen';
import { postLogin, postUser, saveAuthToken } from '../api/auth';

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();
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
      navigation.navigate('Main');
    } catch (err: any) {
      setLoginError(err.error || 'Login failed');
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
      setSignupError(err.error || 'Sign up failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.legend}>Create Profile</Text>
        {signupError ? <Text style={styles.error}>{signupError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={signupUsername}
          onChangeText={setSignupUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={signupPassword}
          onChangeText={setSignupPassword}
          secureTextEntry
        />
        <Button title="Sign Up" color="#b22222" onPress={handleSignup} />
      </View>
      <View style={styles.formSection}>
        <Text style={styles.legend}>Log In</Text>
        {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={loginUsername}
          onChangeText={setLoginUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
        />
        <Button title="Login" color="#b22222" onPress={handleLogin} />
      </View>
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
  formSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 40,
    padding: 16,
    backgroundColor: 'rgba(178,34,34,0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  legend: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#b22222',
  },
  input: {
    width: '100%',
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

export default LoginScreen;
