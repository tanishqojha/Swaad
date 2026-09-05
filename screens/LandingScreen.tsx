import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fetchRecipes } from '@/lib/recipesRepo';
import type { Recipe } from '@/lib/types';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Landing'>;

/** A taste of what the input flow can turn up, using the actual dish photography from the Stitch landing screen. */
const PREVIEW_DISHES = [
  { name: 'Jeera Dal Tadka', photo: require('../assets/stitch/dishes/a-comforting-bowl-of-hot-homestyle.jpg') },
  { name: 'Kadai Paneer', photo: require('../assets/stitch/dishes/rich-kadai-paneer-curry-simmered-in.jpg') },
  { name: 'Aloo Gobi', photo: require('../assets/stitch/dishes/golden-spiced-aloo-gobi-subzi-served.jpg') },
  { name: 'Spiced Poha', photo: require('../assets/stitch/dishes/crispy-roasted-beaten-rice-poha-chivda.jpg') },
];

/**
 * The app's front door (Stitch's "Dish Discovery & Start Cooking Landing").
 * Everything past this screen is the input flow (PRD §5); this one is just
 * the welcome + entry point, pushed once per cold start onto the Home stack.
 */
export function LandingScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch(() => {
        /* Preview tiles fall back to starting the flow if this never loads. */
      });
  }, []);

  function openDish(name: string) {
    const recipe = recipes?.find((r) => r.name === name);
    if (recipe) navigation.navigate('RecipeDetail', { recipe });
    else navigation.navigate('KitchenInput');
  }

  // Exact-pixel 2-column grid: two tiles + one gap span the content width, so
  // the columns can never round over each other or bleed past the inset.
  const gap = spacing.md;
  const tileWidth = Math.floor((windowWidth - spacing.screenInset * 2 - gap) / 2);
  const imageHeight = Math.round(tileWidth * 0.62);

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Landing runs with headerShown:false, so the top safe-area inset is applied by hand. */}
      <View style={{ flexGrow: 1, paddingHorizontal: spacing.screenInset, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Logo height={32} />
        </View>

        <View style={[styles.grid, { gap }]}>
          {PREVIEW_DISHES.map((dish) => (
            <Pressable
              key={dish.name}
              onPress={() => openDish(dish.name)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${dish.name}`}
              style={({ pressed }) => [{ width: tileWidth, opacity: pressed ? 0.85 : 1 }]}
            >
              <Image
                source={dish.photo}
                resizeMode="cover"
                style={{ width: tileWidth, height: imageHeight, borderRadius: radii.card, backgroundColor: colors.surface }}
              />
              <Text
                style={[typography.chipLabel, { color: colors.textPrimary, marginTop: spacing.sm }]}
                numberOfLines={1}
              >
                {dish.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text
          style={[typography.headlineLg, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xxl }]}
        >
          Cook what you have.{'\n'}Spend what you plan.
        </Text>
        <Text
          style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}
        >
          Tell Swaad your ingredients, appliances and budget, and it finds 2 to 3 Indian dishes you can actually cook tonight.
        </Text>

        <View style={{ flex: 1, minHeight: spacing.xxxl }} />

        <PrimaryButton label="Start cooking" onPress={() => navigation.navigate('KitchenInput')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
