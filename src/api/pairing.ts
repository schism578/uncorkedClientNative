import { getAuthToken } from './auth';
import { API_URL } from './config';
import type { FoodPairing, PairingSuggestion } from '../context';

async function authHeaders() {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function getPairingSuggestions(wine_id: string): Promise<PairingSuggestion[]> {
  const res = await fetch(`${API_URL}/pairing/${wine_id}/suggest`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function getPairingsForWine(user_id: string, wine_id: string): Promise<FoodPairing[]> {
  const res = await fetch(`${API_URL}/pairing/${user_id}?wine_id=${encodeURIComponent(wine_id)}`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createPairing(
  user_id: string,
  pairing: { wine_id: string; food_type: string; name: string; notes?: string; img_url?: string; source?: string }
): Promise<FoodPairing> {
  const res = await fetch(`${API_URL}/pairing/${user_id}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(pairing),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deletePairing(user_id: string, pairing_id: string): Promise<void> {
  const res = await fetch(`${API_URL}/pairing/${user_id}/${pairing_id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw await res.json();
}
