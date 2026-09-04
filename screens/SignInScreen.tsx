import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/lib/auth';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'SignIn'>;

/**
 * Overrides PRD §3's "no accounts" non-goal, at the user's explicit request —
 * a real Supabase Auth sign-in/sign-up, needed so favorites and reviews can
 * be tied to a user (supabase/migrations/0004_auth.sql).
 */
export function SignInScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  }

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.screenInset }}>
      <View style={[styles.badge, { backgroundColor: colors.primaryTint, marginBottom: spacing.xl }]}>
        <Ionicons name="lock-closed-outline" size={28} color={colors.primary} />
      </View>

      <Text style={[typography.screenTitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
        {mode === 'signIn' ? 'Welcome back' : 'Create an account'}
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
        Sign {mode === 'signIn' ? 'in' : 'up'} to save dishes and leave reviews.
      </Text>

      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Email</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderRadius: radii.button, marginBottom: spacing.lg }]}>
        <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textTertiary}
          style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.sm }]}
        />
      </View>

      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Password</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderRadius: radii.button, marginBottom: spacing.lg }]}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
          placeholderTextColor={colors.textTertiary}
          style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.sm }]}
        />
      </View>

      {error && <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.md }]}>{error}</Text>}

      <PrimaryButton label={mode === 'signIn' ? 'Sign in' : 'Sign up'} onPress={submit} loading={loading} disabled={!email || !password} />

      <Pressable onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')} style={{ marginTop: spacing.xl, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.primary }]}>
          {mode === 'signIn' ? "New here? Create an account" : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 14 },
});
