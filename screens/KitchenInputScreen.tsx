import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StepProgress } from '@/components/StepProgress';
import { fetchAppliances, fetchIngredients } from '@/lib/recipesRepo';
import type { Appliance, Ingredient } from '@/lib/types';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'KitchenInput'>;

/** Best-effort icon per appliance slug — Ionicons has no literal stove/tawa glyphs, so these are the closest conceptual match. */
const APPLIANCE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  'gas-stove': 'flame-outline',
  induction: 'flash-outline',
  'pressure-cooker': 'aperture-outline',
  tawa: 'ellipse-outline',
  oven: 'cube-outline',
  microwave: 'tablet-landscape-outline',
  'mixer-grinder': 'sync-outline',
  'air-fryer': 'thermometer-outline',
};

/**
 * PRD §5 step 1: staples are pre-selected, the rest is search-and-select, and
 * anything not in the list is accepted as a free-text tag (PRD §7 P0).
 */
export function KitchenInputScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState<string[]>([]);
  const [selectedAppliances, setSelectedAppliances] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchIngredients(), fetchAppliances()])
      .then(([ing, app]) => {
        if (cancelled) return;
        setIngredients(ing);
        setAppliances(app);
        setSelectedIngredients(new Set(ing.filter((i) => i.isStaple).map((i) => i.slug)));
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIngredients = useMemo(
    () => (query.trim() ? ingredients.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase())) : ingredients),
    [ingredients, query],
  );
  const queryMatchesExisting = filteredIngredients.some((i) => i.name.toLowerCase() === query.trim().toLowerCase());

  function toggleIngredient(slug: string) {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function toggleAppliance(slug: string) {
    setSelectedAppliances((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function addFreeText() {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (!ingredients.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setFreeText((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    }
    setQuery('');
  }

  const canContinue = selectedIngredients.size > 0 || freeText.length > 0;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.canvas, padding: spacing.xxxl }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.textTertiary} style={{ marginBottom: spacing.md }} />
        <Text style={[typography.sectionHeader, { color: colors.textPrimary, textAlign: 'center' }]}>
          Couldn't load ingredients
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
          Check your connection and reopen the app.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StepProgress step={1} total={4} label="What's in your kitchen?" />
      <ScrollView contentContainerStyle={{ padding: spacing.screenInset, paddingBottom: spacing.huge }} keyboardShouldPersistTaps="handled">
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderRadius: radii.button }]}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={addFreeText}
            placeholder="Search or type an ingredient"
            placeholderTextColor={colors.textTertiary}
            style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.sm }]}
          />
          {query.trim().length > 0 && !queryMatchesExisting && (
            <Pressable onPress={addFreeText} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {freeText.length > 0 && (
          <View style={[styles.wrap, { marginTop: spacing.lg }]}>
            {freeText.map((text) => (
              <Chip
                key={text}
                label={text}
                icon="close-circle"
                selected
                onPress={() => setFreeText((prev) => prev.filter((t) => t !== text))}
              />
            ))}
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: spacing.xxl }]}>
          <Ionicons name="nutrition-outline" size={16} color={colors.textTertiary} />
          <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginLeft: spacing.sm }]}>Ingredients</Text>
        </View>
        <View style={[styles.wrap, { marginTop: spacing.md }]}>
          {filteredIngredients.map((i) => (
            <Chip key={i.id} label={i.name} selected={selectedIngredients.has(i.slug)} onPress={() => toggleIngredient(i.slug)} />
          ))}
        </View>

        <View style={[styles.sectionHeader, { marginTop: spacing.xxl }]}>
          <Ionicons name="construct-outline" size={16} color={colors.textTertiary} />
          <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginLeft: spacing.sm }]}>Appliances</Text>
        </View>
        <View style={[styles.wrap, { marginTop: spacing.md }]}>
          {appliances.map((a) => (
            <Chip
              key={a.id}
              label={a.name}
              icon={APPLIANCE_ICON[a.slug]}
              selected={selectedAppliances.has(a.slug)}
              onPress={() => toggleAppliance(a.slug)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={{ padding: spacing.screenInset }}>
        <PrimaryButton
          label="Next: Budget"
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('Budget', {
              ingredientSlugs: [...selectedIngredients],
              freeTextIngredients: freeText,
              applianceSlugs: [...selectedAppliances],
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 14 },
});
