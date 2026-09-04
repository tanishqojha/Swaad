import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '@/components/EmptyState';
import { RecipeCard } from '@/components/RecipeCard';
import { matchReason, rankRecipes } from '@/lib/matching';
import { fetchPriceRanges, fetchRecipes } from '@/lib/recipesRepo';
import { getPreferences } from '@/lib/preferences';
import type { RankedRecipe } from '@/lib/types';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Results'>;

/** PRD §7 P0: 2-3 ranked results, or a clear empty state — never a blank screen. */
export function ResultsScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [ranked, setRanked] = useState<RankedRecipe[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await getPreferences();
        const [recipes, prices] = await Promise.all([fetchRecipes(), fetchPriceRanges(prefs.cityTier)]);
        if (cancelled) return;
        setRanked(
          rankRecipes(
            recipes,
            {
              availableIngredientSlugs: route.params.ingredientSlugs,
              freeTextIngredients: route.params.freeTextIngredients,
              availableApplianceSlugs: route.params.applianceSlugs,
              budget: route.params.budget,
              mealType: route.params.mealType,
              dietary: route.params.dietary,
              allergyNote: route.params.allergyNote,
              cityTier: prefs.cityTier,
            },
            prices,
          ),
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route.params]);

  if (error) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Couldn't load dishes"
        body="Check your connection and go back to try again."
      />
    );
  }

  if (ranked === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (ranked.length === 0) {
    return (
      <EmptyState
        icon="restaurant-outline"
        title="No dishes match yet"
        body="Try raising your budget or adding a few more ingredients — that usually unlocks a match."
      />
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.screenInset }}>
      <Text style={[typography.screenTitle, { color: colors.textPrimary, marginBottom: spacing.xl }]}>
        Here's what you can make
      </Text>
      {ranked.map((r) => (
        <RecipeCard
          key={r.recipe.id}
          ranked={r}
          reason={matchReason(r)}
          onPress={() => navigation.navigate('RecipeDetail', { recipe: r.recipe, ranked: r })}
        />
      ))}
    </ScrollView>
  );
}
