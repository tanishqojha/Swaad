import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  step: number;
  total: number;
  label: string;
};

/** "Step X of 4" pill + track, shown atop each input-flow screen (PRD §5). */
export function StepProgress({ step, total, label }: Props) {
  const { colors, typography, spacing, radii } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing.screenInset, paddingTop: spacing.lg }}>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        Step {step} of {total}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.divider, borderRadius: radii.full }]}>
        <View
          style={[
            styles.fill,
            { width: `${(step / total) * 100}%`, backgroundColor: colors.primary, borderRadius: radii.full },
          ]}
        />
      </View>
      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginTop: spacing.lg }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, overflow: 'hidden' },
  fill: { height: 4 },
});
