import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MealTypeTile } from '@/components/MealTypeTile';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StepProgress } from '@/components/StepProgress';
import type { MealType } from '@/lib/types';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'MealType'>;

/** PRD §5 step 3 — single-select occasion, shown as a 3-column icon grid (Design.md §4). */
const MEAL_TYPES: { label: string; value: MealType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Breakfast', value: 'breakfast', icon: 'sunny-outline' },
  { label: 'Lunch', value: 'lunch', icon: 'restaurant-outline' },
  { label: 'Dinner', value: 'dinner', icon: 'moon-outline' },
  { label: 'Morning snack', value: 'morning_snack', icon: 'cafe-outline' },
  { label: 'Afternoon snack', value: 'afternoon_snack', icon: 'fast-food-outline' },
  { label: 'Evening snack', value: 'evening_snack', icon: 'nutrition-outline' },
  { label: 'Something fancy', value: 'fancy', icon: 'sparkles-outline' },
  { label: 'Something light', value: 'light', icon: 'leaf-outline' },
  { label: 'Kid-friendly', value: 'child_specific', icon: 'happy-outline' },
];

export function MealTypeScreen({ navigation, route }: Props) {
  const { colors, spacing } = useTheme();
  const [selected, setSelected] = useState<MealType | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StepProgress step={3} total={4} label="What's the occasion?" />
      <View style={{ padding: spacing.screenInset }}>
        <View style={styles.grid}>
          {MEAL_TYPES.map((meal) => (
            <MealTypeTile
              key={meal.value}
              label={meal.label}
              icon={meal.icon}
              selected={selected === meal.value}
              onPress={() => setSelected(meal.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ padding: spacing.screenInset }}>
        <PrimaryButton
          label="Next: Dietary"
          disabled={selected === null}
          onPress={() => navigation.navigate('Dietary', { ...route.params, mealType: selected! })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
