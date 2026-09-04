import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StepProgress } from '@/components/StepProgress';
import type { BudgetRange } from '@/lib/types';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Budget'>;

/** PRD §5 step 2 — a rupee bucket for *additional* ingredients, not what's already on hand. */
const BUCKETS: { label: string; range: BudgetRange }[] = [
  { label: '₹0–50', range: { minInr: 0, maxInr: 50 } },
  { label: '₹50–150', range: { minInr: 50, maxInr: 150 } },
  { label: '₹150–300', range: { minInr: 150, maxInr: 300 } },
  { label: '₹300+', range: { minInr: 300, maxInr: null } },
];

export function BudgetScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StepProgress step={2} total={4} label="What's your budget for extras?" />
      <View style={{ padding: spacing.screenInset }}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          How much are you willing to spend on ingredients you don't already have?
        </Text>
        <View style={[styles.wrap, { marginTop: spacing.xxl }]}>
          {BUCKETS.map((bucket, index) => (
            <Chip
              key={bucket.label}
              label={bucket.label}
              icon="cash-outline"
              selected={selected === index}
              onPress={() => setSelected(index)}
            />
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ padding: spacing.screenInset }}>
        <PrimaryButton
          label="Next: Meal type"
          disabled={selected === null}
          onPress={() => navigation.navigate('MealType', { ...route.params, budget: BUCKETS[selected!].range })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
