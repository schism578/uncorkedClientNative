// Stub for wine API (for future use)
import { getAuthToken } from './auth';

const API_URL = 'https://thawing-anchorage-88444.herokuapp.com';

export async function searchWines(params: any): Promise<any[]> {
  // Build query string from params
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join('&');
  const token = await getAuthToken();
  const res = await fetch(`${API_URL}/wine/search?${query}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

// Add Unsplash image search helper
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // TODO: Replace with your Unsplash API key

async function fetchWineImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    return null;
  } catch {
    return null;
  }
}

export { fetchWineImage };
