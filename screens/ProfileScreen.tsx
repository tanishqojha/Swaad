import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/lib/auth';
import { getFavoriteIds } from '@/lib/favoritesRepo';
import { DEFAULT_PREFERENCES, getPreferences, setPreferences, type Preferences } from '@/lib/preferences';
import type { CityTier, DietaryCategory } from '@/lib/types';
import { useTheme, useThemeModePreference, type ThemeModePreference } from '@/theme/theme';

const DIETARY: { label: string; value: DietaryCategory }[] = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Non-vegetarian', value: 'non_vegetarian' },
  { label: 'Eggetarian', value: 'eggetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Jain', value: 'jain' },
];

const CITY_TIERS: { label: string; value: CityTier }[] = [
  { label: 'Metro', value: 'metro' },
  { label: 'Tier 2 city', value: 'tier_2' },
  { label: 'Tier 3 city / town', value: 'tier_3' },
];

const APPEARANCE: { label: string; value: ThemeModePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function SectionHeader({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
      <Ionicons name={icon} size={16} color={colors.textTertiary} />
      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginLeft: spacing.sm }]}>{label}</Text>
    </View>
  );
}

/** Identity block: avatar initial, email, and a real "saved dishes" count (no invented streaks or stats). */
function IdentityCard({ savedCount }: { savedCount: number | null }) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { user } = useAuth();

  return (
    <View
      style={[
        elevation.raised,
        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.xxl },
      ]}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.primaryTint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {user ? (
          <Text style={[typography.recipeNameCard, { color: colors.primary }]}>{user.email?.[0]?.toUpperCase() ?? '?'}</Text>
        ) : (
          <Ionicons name="person-outline" size={24} color={colors.primary} />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: spacing.lg }}>
        <Text style={[typography.recipeNameList, { color: colors.textPrimary }]} numberOfLines={1}>
          {user ? user.email : 'Not signed in'}
        </Text>
        <Text style={[typography.meta, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {user ? `${savedCount ?? '…'} dish${savedCount === 1 ? '' : 'es'} saved` : 'Sign in to save dishes'}
        </Text>
      </View>
    </View>
  );
}

/** Sign-in/out (overrides PRD §3's "no accounts" non-goal) plus local preferences. */
function AccountSection() {
  const { colors, typography, spacing, radii } = useTheme();
  const { user, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <View style={{ marginBottom: spacing.xxl }}>
        <SectionHeader icon="log-out-outline" label="Account" />
        <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} />
      </View>
    );
  }

  async function submit() {
    setError(null);
    setLoading(true);
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <View style={{ marginBottom: spacing.xxl }}>
      <SectionHeader icon="log-in-outline" label="Account" />
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        Sign in to save dishes and leave reviews.
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={colors.textTertiary}
        style={[
          typography.body,
          { color: colors.textPrimary, backgroundColor: colors.surface, borderRadius: radii.button, paddingHorizontal: spacing.lg, height: 48, marginBottom: spacing.sm },
        ]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={colors.textTertiary}
        style={[
          typography.body,
          { color: colors.textPrimary, backgroundColor: colors.surface, borderRadius: radii.button, paddingHorizontal: spacing.lg, height: 48, marginBottom: spacing.sm },
        ]}
      />
      {error && <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}>{error}</Text>}
      <PrimaryButton label={mode === 'signIn' ? 'Sign in' : 'Sign up'} onPress={submit} loading={loading} disabled={!email || !password} />
      <Pressable onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')} style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.primary }]}>
          {mode === 'signIn' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </View>
  );
}

export function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const { preference, setPreference } = useThemeModePreference();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    getPreferences().then(setPrefs);
  }, []);

  useEffect(() => {
    if (user) getFavoriteIds(user.id).then((ids) => setSavedCount(ids.length));
  }, [user]);

  function update(next: Preferences) {
    setPrefs(next);
    setPreferences(next);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.screenInset, paddingBottom: spacing.huge }}>
      <IdentityCard savedCount={savedCount} />

      <AccountSection />

      <View style={{ marginBottom: spacing.xxl }}>
        <SectionHeader icon="contrast-outline" label="Appearance" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {APPEARANCE.map((a) => (
            <Chip key={a.value} label={a.label} selected={preference === a.value} onPress={() => setPreference(a.value)} />
          ))}
        </View>
      </View>

      <View style={{ marginBottom: spacing.xxl }}>
        <SectionHeader icon="restaurant-outline" label="Default diet" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {DIETARY.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              selected={prefs.defaultDietary === d.value}
              onPress={() => update({ ...prefs, defaultDietary: d.value })}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionHeader icon="location-outline" label="City tier" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {CITY_TIERS.map((c) => (
            <Chip key={c.value} label={c.label} selected={prefs.cityTier === c.value} onPress={() => update({ ...prefs, cityTier: c.value })} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
