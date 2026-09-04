import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  prepMinutes: number;
  serves: number;
  region: string;
};

/** "25 min · Serves 2 · South Indian" with icons — shared by RecipeCard, RecipeDetailScreen and SavedScreen. */
export function RecipeMeta({ prepMinutes, serves, region }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={styles.row}>
      <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
      <Text style={[typography.meta, { color: colors.textSecondary, marginLeft: 3, marginRight: spacing.sm }]}>{prepMinutes} min</Text>
      <Ionicons name="people-outline" size={13} color={colors.textTertiary} />
      <Text style={[typography.meta, { color: colors.textSecondary, marginLeft: 3, marginRight: spacing.sm }]}>Serves {serves}</Text>
      <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
      <Text style={[typography.meta, { color: colors.textSecondary, marginLeft: 3 }]}>{region}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
