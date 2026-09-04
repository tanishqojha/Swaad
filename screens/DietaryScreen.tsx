import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StepProgress } from '@/components/StepProgress';
import { getPreferences } from '@/lib/preferences';
import type { DietaryCategory } from '@/lib/types';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Dietary'>;

/** PRD §8 — structured single-select dietary category plus a free-text allergy/avoid note. */
const DIETARY: { label: string; value: DietaryCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Vegetarian', value: 'vegetarian', icon: 'leaf-outline' },
  { label: 'Non-vegetarian', value: 'non_vegetarian', icon: 'restaurant-outline' },
  { label: 'Eggetarian', value: 'eggetarian', icon: 'egg-outline' },
  { label: 'Vegan', value: 'vegan', icon: 'nutrition-outline' },
  { label: 'Jain', value: 'jain', icon: 'flower-outline' },
];

export function DietaryScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [selected, setSelected] = useState<DietaryCategory>('vegetarian');
  const [allergyNote, setAllergyNote] = useState('');

  // Starts the flow with the user's saved default rather than always
  // "vegetarian" (Profile screen preference, PRD's "closer to what you
  // actually cook" goal).
  useEffect(() => {
    getPreferences().then((prefs) => setSelected(prefs.defaultDietary));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StepProgress step={4} total={4} label="Any dietary restrictions?" />
      <View style={{ padding: spacing.screenInset }}>
        <View style={styles.wrap}>
          {DIETARY.map((d) => (
            <Chip key={d.value} label={d.label} icon={d.icon} selected={selected === d.value} onPress={() => setSelected(d.value)} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxl }}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.textTertiary} />
          <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
            Allergies or anything to avoid
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          e.g. "allergic to peanuts, on a low-sodium diet" — we'll exclude anything matching, even as a "needs more ingredients" suggestion.
        </Text>
        <TextInput
          value={allergyNote}
          onChangeText={setAllergyNote}
          placeholder="Type here"
          placeholderTextColor={colors.textTertiary}
          multiline
          style={[
            typography.body,
            {
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: spacing.md,
              marginTop: spacing.md,
              minHeight: 80,
              textAlignVertical: 'top',
            },
          ]}
        />
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ padding: spacing.screenInset }}>
        <PrimaryButton
          label="Find dishes"
          onPress={() => navigation.navigate('Results', { ...route.params, dietary: selected, allergyNote })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
