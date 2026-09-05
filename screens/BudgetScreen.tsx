import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
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

/** Slider covers 0 → this; the top of the track is the open-ended "₹300+" bucket. */
const SLIDER_MAX = 500;
const SLIDER_STEP = 10;

function sameRange(a: BudgetRange, b: BudgetRange): boolean {
  return a.minInr === b.minInr && a.maxInr === b.maxInr;
}

function sliderToRange(value: number): BudgetRange {
  return value >= SLIDER_MAX ? { minInr: 300, maxInr: null } : { minInr: 0, maxInr: value };
}

function rangeToSlider(range: BudgetRange | null): number {
  if (range === null) return 0;
  return range.maxInr === null ? SLIDER_MAX : range.maxInr;
}

export function BudgetScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [budget, setBudget] = useState<BudgetRange | null>(null);

  const readout =
    budget === null
      ? 'Drag to set a limit'
      : budget.maxInr === null
        ? 'Up to ₹500 or more'
        : `Up to ₹${budget.maxInr}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StepProgress step={2} total={4} label="What's your budget for extras?" />
      <View style={{ padding: spacing.screenInset }}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          How much are you willing to spend on ingredients you don't already have?
        </Text>

        <View style={[styles.wrap, { marginTop: spacing.xxl }]}>
          {BUCKETS.map((bucket) => (
            <Chip
              key={bucket.label}
              label={bucket.label}
              icon="cash-outline"
              selected={budget !== null && sameRange(budget, bucket.range)}
              onPress={() => setBudget(bucket.range)}
            />
          ))}
        </View>

        <View style={{ marginTop: spacing.xxl }}>
          <View style={styles.sliderHeader}>
            <Text style={[typography.sectionHeader, { color: colors.textPrimary }]}>Or set your own</Text>
            <Text style={[typography.price, { color: budget === null ? colors.textTertiary : colors.primary }]}>
              {readout}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={SLIDER_MAX}
            step={SLIDER_STEP}
            value={rangeToSlider(budget)}
            onValueChange={(value) => setBudget(sliderToRange(value))}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.divider}
            thumbTintColor={colors.primary}
            accessibilityLabel="Budget for extra ingredients, in rupees"
          />
          <View style={styles.sliderScale}>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>₹0</Text>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>₹500+</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ padding: spacing.screenInset }}>
        <PrimaryButton
          label="Next: Meal type"
          disabled={budget === null}
          onPress={() => navigation.navigate('MealType', { ...route.params, budget: budget! })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  slider: { width: '100%', height: 40, marginTop: 8 },
  sliderScale: { flexDirection: 'row', justifyContent: 'space-between' },
});
