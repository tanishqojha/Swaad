import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MatchRing } from '@/components/MatchRing';
import { RecipeMeta } from '@/components/RecipeMeta';
import { useAuth } from '@/lib/auth';
import { formatPriceRange } from '@/lib/budget';
import { dishPhoto } from '@/lib/dishPhotos';
import { isFavorite, toggleFavorite } from '@/lib/favoritesRepo';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeDetail'>;

/**
 * Shared by the Home flow (arrives with `ranked`, so missing ingredients and
 * the shopping list are shown) and the Saved tab (arrives with only
 * `recipe`, so every ingredient is listed plainly with no missing/shopping
 * breakdown — there is no "available ingredients" context there).
 */
export function RecipeDetailScreen({ route, navigation }: Props) {
  const { recipe, ranked } = route.params;
  const { colors, typography, spacing, radii, hairline } = useTheme();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) isFavorite(user.id, recipe.id).then(setSaved);
  }, [recipe.id, user]);

  async function onToggleSave() {
    if (!user) {
      navigation.navigate('SignIn');
      return;
    }
    setSaved(await toggleFavorite(user.id, recipe.id));
  }

  function onShare() {
    Share.share({ message: `${recipe.name} — ${recipe.description}\n\nShared from Swaad.` });
  }

  const missingSlugs = new Set(ranked?.missing.map((m) => m.ingredient.slug) ?? []);
  const photo = dishPhoto(recipe.name);

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ paddingBottom: spacing.huge }}>
      {/* Optional, secondary enrichment only (Design.md §7) — most recipes render with no photo. */}
      {photo && <Image source={photo} style={styles.hero} />}
      <View style={{ paddingHorizontal: spacing.screenInset, paddingTop: photo ? spacing.lg : spacing.screenInset }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.screenTitle, { color: colors.textPrimary }]}>{recipe.name}</Text>
          <View style={{ marginTop: spacing.xs }}>
            <RecipeMeta prepMinutes={recipe.prepMinutes} serves={recipe.serves} region={recipe.region} />
          </View>
        </View>
        {ranked && <MatchRing matchedCount={ranked.matchedCount} totalCount={ranked.totalCount} />}
      </View>

      <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm }}>
        <Pressable
          onPress={onToggleSave}
          style={[styles.saveRow, { flex: 1, borderColor: colors.divider, borderWidth: hairline.chipBorder, borderRadius: radii.button }]}
        >
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.primary} />
          <Text numberOfLines={1} style={[typography.button, { color: colors.primary, marginLeft: spacing.sm, flexShrink: 1 }]}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('RecipeReviews', { recipe })}
          style={[styles.saveRow, { flex: 1, borderColor: colors.divider, borderWidth: hairline.chipBorder, borderRadius: radii.button }]}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
          <Text numberOfLines={1} style={[typography.button, { color: colors.primary, marginLeft: spacing.sm, flexShrink: 1 }]}>Reviews</Text>
        </Pressable>
        <Pressable
          onPress={onShare}
          style={[styles.saveRow, { width: 44, borderColor: colors.divider, borderWidth: hairline.chipBorder, borderRadius: radii.button }]}
        >
          <Ionicons name="share-social-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xl }]}>{recipe.description}</Text>

      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginTop: spacing.xxl }]}>Ingredients</Text>
      {recipe.ingredients.map((ri) => (
        <View key={ri.ingredient.id} style={[styles.ingredientRow, { borderBottomColor: colors.divider, borderBottomWidth: hairline.divider }]}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>
            {ri.ingredient.name}
            {ri.isOptional ? ' (optional)' : ''}
            {ranked && missingSlugs.has(ri.ingredient.slug) ? ' — missing' : ''}
          </Text>
          <Text style={[typography.meta, { color: colors.textSecondary }]}>
            {ri.quantity} {ri.unit ?? ''}
          </Text>
        </View>
      ))}

      {ranked && ranked.shoppingList.items.length > 0 && (
        <>
          <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginTop: spacing.xxl }]}>Shopping list</Text>
          {ranked.shoppingList.items.map((item) => (
            <View
              key={item.ingredient.id}
              style={[styles.ingredientRow, { borderBottomColor: colors.divider, borderBottomWidth: hairline.divider }]}
            >
              <Text style={[typography.body, { color: colors.textPrimary }]}>{item.ingredient.name}</Text>
              <Text style={[typography.price, { color: colors.textPrimary }]}>
                {item.price ? formatPriceRange(item.price.minInr, item.price.maxInr) : 'Price unavailable'}
              </Text>
            </View>
          ))}
          <Text style={[typography.price, { color: colors.textPrimary, marginTop: spacing.md }]}>
            Total: {formatPriceRange(ranked.shoppingList.totalMinInr, ranked.shoppingList.totalMaxInr)}
          </Text>
          {ranked.shoppingList.unpricedSlugs.length > 0 && (
            <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.xs }]}>
              Estimate is incomplete — some ingredients don't have a price yet.
            </Text>
          )}
        </>
      )}

      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginTop: spacing.xxl }]}>Method</Text>
      {recipe.steps.map((step, index) => (
        <View key={index} style={{ flexDirection: 'row', marginTop: spacing.md }}>
          <Text style={[typography.body, { color: colors.primary, width: 24 }]}>{index + 1}.</Text>
          <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{step}</Text>
        </View>
      ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  saveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, paddingHorizontal: 12 },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
});
