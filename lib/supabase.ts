import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.',
  );
}

/**
 * Reference-data tables stay public-read with no write policy (see
 * supabase/migrations/0001_init.sql). Accounts were added on top for
 * sign-in-gated favorites and reviews (supabase/migrations/0004_auth.sql),
 * so sessions now persist in AsyncStorage and auto-refresh.
 */
export const supabase = createClient(url, anonKey, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
