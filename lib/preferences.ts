/**
 * Local preferences only: default dietary filter and city tier for pricing
 * (Profile screen). No accounts in v1 (PRD §3 non-goal), so this is
 * AsyncStorage, not a Supabase user row (Rules.md #8).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CityTier, DietaryCategory } from './types';

const KEY = 'swaad.preferences';

export type Preferences = {
  defaultDietary: DietaryCategory;
  cityTier: CityTier;
};

export const DEFAULT_PREFERENCES: Preferences = {
  defaultDietary: 'vegetarian',
  cityTier: 'metro',
};

export async function getPreferences(): Promise<Preferences> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
}

export async function setPreferences(prefs: Preferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
