import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { Wine } from '../context';
import { colors, spacing, radius } from '../theme';

const defaultImages: Record<string, any> = {
  red: require('../../assets/red.jpg'),
  white: require('../../assets/white.jpg'),
  rose: require('../../assets/rose.jpg'),
  sparkling: require('../../assets/sparkling.jpg'),
};

function ratingStars(rating: number): string {
  const full = Math.min(5, Math.max(0, Math.round(rating)));
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function formatVintage(vintage: any): string | null {
  if (!vintage || vintage === 0) return null;
  return String(vintage);
}

interface Props {
  wine: Wine;
}

const WineShareCard = forwardRef<View, Props>(({ wine }, ref) => {
  const imageSource = wine.img_url
    ? { uri: wine.img_url }
    : defaultImages[wine.wine_type?.toLowerCase()] ?? defaultImages.red;

  const detailParts = [
    wine.wine_type ? wine.wine_type.charAt(0).toUpperCase() + wine.wine_type.slice(1) : null,
    formatVintage(wine.vintage),
    wine.region || null,
  ].filter(Boolean);

  return (
    <View ref={ref} style={styles.card}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      <View style={styles.headerBar}>
        <Text style={styles.wineName} numberOfLines={2}>{wine.wine_name}</Text>
        <Text style={styles.winemaker}>{wine.winemaker}</Text>
      </View>

      <View style={styles.body}>
        {detailParts.length > 0 && (
          <Text style={styles.details}>{detailParts.join('  ·  ')}</Text>
        )}
        {wine.varietal ? (
          <Text style={styles.varietal}>{wine.varietal}</Text>
        ) : null}
        {wine.rating > 0 && (
          <Text style={styles.rating}>{ratingStars(wine.rating)}</Text>
        )}
        {wine.tasting_notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notes}>{wine.tasting_notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🍷  uncorked.pro</Text>
      </View>
    </View>
  );
});

WineShareCard.displayName = 'WineShareCard';
export default WineShareCard;

const styles = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: 360,
    height: 220,
    backgroundColor: colors.border,
  },
  headerBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 26,
    marginBottom: 2,
  },
  winemaker: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  body: {
    padding: spacing.md,
  },
  details: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
  },
  varietal: {
    fontSize: 13,
    color: colors.textBody,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  rating: {
    fontSize: 22,
    color: colors.primary,
    marginBottom: spacing.sm,
    letterSpacing: 3,
  },
  notesContainer: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  notes: {
    fontSize: 13,
    color: colors.textBody,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
