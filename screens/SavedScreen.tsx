import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '@/components/EmptyState';
import { RecipeMeta } from '@/components/RecipeMeta';
import { useAuth } from '@/lib/auth';
import { dishPhoto } from '@/lib/dishPhotos';
import { getFavoriteIds } from '@/lib/favoritesRepo';
import { fetchRecipes } from '@/lib/recipesRepo';
import type { Recipe } from '@/lib/types';
import type { SavedStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<SavedStackParamList, 'SavedList'>;

/** Favorited recipes — overrides PRD §3's "no accounts" non-goal; tied to the signed-in user. */
export function SavedScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!user) return;
      Promise.all([getFavoriteIds(user.id), fetchRecipes()])
        .then(([ids, all]) => setRecipes(all.filter((r) => ids.includes(r.id))))
        .catch(() => setError(true));
    });
    return unsubscribe;
  }, [navigation, user]);

  if (!user) {
    return (
      <EmptyState
        icon="log-in-outline"
        title="Sign in to see your saved dishes"
        body="Favorites are tied to your account so they're there next time you open Swaad."
        actionLabel="Sign in"
        onAction={() => navigation.navigate('SignIn')}
      />
    );
  }

  if (error) {
    return <EmptyState icon="cloud-offline-outline" title="Couldn't load your saved dishes" body="Check your connection and reopen this tab." />;
  }

  if (recipes === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon="bookmark-outline"
        title="Nothing saved yet"
        body="Tap the bookmark on a dish you like from your results, and it'll show up here."
      />
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.screenInset }}>
      {recipes.map((recipe) => {
        const photo = dishPhoto(recipe.name);
        return (
          <Pressable
            key={recipe.id}
            onPress={() => navigation.navigate('RecipeDetail', { recipe })}
            style={[
              styles.row,
              elevation.raised,
              { backgroundColor: colors.surface, borderRadius: radii.card, marginBottom: spacing.lg },
            ]}
          >
            {photo ? (
              <Image source={photo} style={[styles.thumb, { borderRadius: radii.card }]} />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback, { borderRadius: radii.card, backgroundColor: colors.primaryTint }]}>
                <Ionicons name="restaurant-outline" size={22} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <Text style={[typography.recipeNameList, { color: colors.textPrimary }]}>{recipe.name}</Text>
              <View style={{ marginTop: spacing.xs }}>
                <RecipeMeta prepMinutes={recipe.prepMinutes} serves={recipe.serves} region={recipe.region} />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  thumb: { width: 56, height: 56 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
});
