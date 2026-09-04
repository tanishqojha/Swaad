import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/lib/auth';
import { formatPriceRange } from '@/lib/budget';
import { getFavoriteIds } from '@/lib/favoritesRepo';
import { getPreferences } from '@/lib/preferences';
import { fetchPriceRanges, fetchRecipes } from '@/lib/recipesRepo';
import type { Ingredient, PriceRange } from '@/lib/types';
import { useTheme } from '@/theme/theme';

type Row = { ingredient: Ingredient; price: PriceRange | null };

/** Category -> icon, so the grouped list scans faster than an alphabetical wall of text. */
const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  dal: 'ellipse-outline',
  legume: 'ellipse-outline',
  grain: 'nutrition-outline',
  vegetable: 'leaf-outline',
  dairy: 'water-outline',
  protein: 'egg-outline',
  nut: 'ellipse-outline',
  spice: 'flame-outline',
  fat: 'water-outline',
  pantry: 'file-tray-outline',
};
const OTHER_ICON = 'basket-outline' as const;

/**
 * Every non-optional ingredient across saved dishes, deduplicated, priced and
 * grouped by aisle-style category — a single list to take shopping. There is
 * no "available ingredients" context on this tab, so it lists what each dish
 * needs, not what's missing.
 */
export function ShoppingListScreen() {
  const { colors, typography, spacing, radii, hairline, elevation } = useTheme();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      setRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [ids, prefs, recipes] = await Promise.all([getFavoriteIds(user.id), getPreferences(), fetchRecipes()]);
        const prices = await fetchPriceRanges(prefs.cityTier);
        if (cancelled) return;

        const saved = recipes.filter((r) => ids.includes(r.id));
        const bySlug = new Map<string, Ingredient>();
        for (const recipe of saved) {
          for (const ri of recipe.ingredients) {
            if (!ri.isOptional) bySlug.set(ri.ingredient.slug, ri.ingredient);
          }
        }
        setRows(
          [...bySlug.values()]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((ingredient) => ({
              ingredient,
              price: prices.find((p) => p.ingredientSlug === ingredient.slug) ?? null,
            })),
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Sign in to build a shopping list"
        body="Sign in from the Profile tab, then save a dish and its ingredients will show up here."
      />
    );
  }

  if (error) {
    return <EmptyState icon="cloud-offline-outline" title="Couldn't load your shopping list" body="Check your connection and reopen this tab." />;
  }

  if (rows === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Nothing to buy yet"
        body="Save a dish from your results and its ingredients will show up here."
      />
    );
  }

  const totalMin = rows.reduce((sum, r) => sum + (r.price?.minInr ?? 0), 0);
  const totalMax = rows.reduce((sum, r) => sum + (r.price?.maxInr ?? 0), 0);

  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = row.ingredient.category ?? 'other';
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.screenInset, paddingBottom: spacing.huge }}>
      <View
        style={[
          elevation.raised,
          { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.xl },
        ]}
      >
        <Ionicons name="cash-outline" size={22} color={colors.primary} />
        <Text style={[typography.body, { color: colors.textSecondary, flex: 1, marginLeft: spacing.md }]}>
          Estimated total for {rows.length} item{rows.length === 1 ? '' : 's'}
        </Text>
        <Text style={[typography.price, { color: colors.textPrimary }]}>{formatPriceRange(totalMin, totalMax)}</Text>
      </View>

      {[...groups.entries()].map(([category, items]) => (
        <View key={category} style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Ionicons name={CATEGORY_ICON[category] ?? OTHER_ICON} size={16} color={colors.textTertiary} />
            <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginLeft: spacing.sm, textTransform: 'capitalize' }]}>
              {category}
            </Text>
          </View>
          {items.map((row) => (
            <View
              key={row.ingredient.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomColor: colors.divider,
                borderBottomWidth: hairline.divider,
              }}
            >
              <Text style={[typography.body, { color: colors.textPrimary }]}>{row.ingredient.name}</Text>
              <Text style={[typography.price, { color: colors.textPrimary }]}>
                {row.price ? formatPriceRange(row.price.minInr, row.price.maxInr) : 'Price unavailable'}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
