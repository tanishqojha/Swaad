import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  matchedCount: number;
  totalCount: number;
};

/**
 * Static ring showing "matched of total" as a filled arc approximated with a
 * border-color split — the orchestrated fill animation (Design.md §6,
 * motion.matchRingFill) is a follow-up once this ships; ponytail: swap for an
 * SVG arc + Animated.Value when the static version needs the fill motion.
 */
export function MatchRing({ matchedCount, totalCount }: Props) {
  const { colors, typography, touchTarget } = useTheme();
  const ratio = totalCount === 0 ? 1 : matchedCount / totalCount;
  const ringColor = ratio === 1 ? colors.curryLeaf : colors.gold;

  return (
    <View
      style={[
        styles.root,
        {
          width: touchTarget.matchRing,
          height: touchTarget.matchRing,
          borderRadius: touchTarget.matchRing / 2,
          borderWidth: 4,
          borderColor: ringColor,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text style={[typography.matchLabel, { color: colors.textPrimary }]}>
        {matchedCount}/{totalCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});
