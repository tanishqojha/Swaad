import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
};

/** 3-column icon tile for the meal-type grid (Design.md §4 "Meal-Type Grid"). */
export function MealTypeTile({ label, icon, selected, onPress }: Props) {
  const { colors, typography, radii, touchTarget, hairline, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.root,
        {
          width: touchTarget.mealTile,
          height: touchTarget.mealTile,
          borderRadius: radii.card,
          borderWidth: hairline.chipBorder,
          borderColor: selected ? colors.primary : colors.divider,
          backgroundColor: selected ? colors.primary : colors.surface,
        },
      ]}
    >
      <Ionicons name={icon} size={26} color={selected ? colors.onPrimary : colors.textSecondary} />
      <Text
        style={[
          typography.caption,
          { color: selected ? colors.onPrimary : colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', padding: 4 },
});
