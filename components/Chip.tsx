import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Selectable pill — ingredients, appliances, dietary and meal-type options all use this (Design.md §7). */
export function Chip({ label, selected, onPress, icon }: Props) {
  const { colors, typography, radii, touchTarget, hairline, spacing } = useTheme();
  const tint = selected ? colors.primary : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.root,
        {
          height: touchTarget.chipHeight,
          borderRadius: radii.chip,
          borderWidth: hairline.chipBorder,
          borderColor: selected ? colors.primary : colors.divider,
          backgroundColor: selected ? colors.primaryTint : colors.surface,
        },
      ]}
    >
      {icon && (
        <View style={{ marginRight: spacing.xs }}>
          <Ionicons name={icon} size={15} color={tint} />
        </View>
      )}
      <Text style={[typography.chipLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8 },
});
