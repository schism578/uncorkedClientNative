import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native Auth API for uncorked-client-native
const API_URL = 'https://thawing-anchorage-88444.herokuapp.com';
const TOKEN_KEY = 'uncorked-client-auth-token';

export async function postLogin({ username, password }: { username: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function postUser(user: { username: string; password: string }) {
  const res = await fetch(`${API_URL}/user`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function saveAuthToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearAuthToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
