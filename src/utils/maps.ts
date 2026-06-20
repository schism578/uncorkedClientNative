import { Linking, Platform } from 'react-native';

export function openNearbySearch(query: string) {
  const encoded = encodeURIComponent(query);
  const url = Platform.OS === 'ios'
    ? `maps:0,0?q=${encoded}`
    : `geo:0,0?q=${encoded}`;
  const fallback = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  Linking.canOpenURL(url)
    .then(supported => Linking.openURL(supported ? url : fallback))
    .catch(() => Linking.openURL(fallback));
}
