import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MatchRing } from '@/components/MatchRing';
import { RecipeMeta } from '@/components/RecipeMeta';
import { formatPriceRange } from '@/lib/budget';
import type { RankedRecipe } from '@/lib/types';
import { useTheme } from '@/theme/theme';

type Props = {
  ranked: RankedRecipe;
  reason: string;
  onPress: () => void;
};

/** Ranked recipe result card — match ring, name, missing-ingredient cost (PRD §7). */
export function RecipeCard({ ranked, reason, onPress }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { recipe, shoppingList } = ranked;
  const cost =
    shoppingList.items.length === 0
      ? 'Nothing to buy'
      : formatPriceRange(shoppingList.totalMinInr, shoppingList.totalMaxInr);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.root,
        elevation.raised,
        { backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.lg },
      ]}
    >
      <MatchRing matchedCount={ranked.matchedCount} totalCount={ranked.totalCount} />
      <View style={{ flex: 1, marginLeft: spacing.lg }}>
        <Text style={[typography.recipeNameCard, { color: colors.textPrimary }]}>{recipe.name}</Text>
        <View style={{ marginTop: spacing.xs }}>
          <RecipeMeta prepMinutes={recipe.prepMinutes} serves={recipe.serves} region={recipe.region} />
        </View>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
          {reason}
        </Text>
        <Text style={[typography.price, { color: colors.textPrimary, marginTop: spacing.sm }]}>{cost}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
});
