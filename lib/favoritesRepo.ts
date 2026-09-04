/**
 * Saved/favorite recipes, tied to the signed-in user (overrides PRD §3's
 * "no accounts" non-goal — RLS in supabase/migrations/0004_auth.sql scopes
 * every row to `auth.uid()`, so these calls only work for a signed-in user).
 */
import { supabase } from './supabase';

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('user_favorites').select('recipe_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((row) => row.recipe_id);
}

export async function isFavorite(userId: string, recipeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('recipe_id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function toggleFavorite(userId: string, recipeId: string): Promise<boolean> {
  const already = await isFavorite(userId, recipeId);
  if (already) {
    const { error } = await supabase.from('user_favorites').delete().eq('user_id', userId).eq('recipe_id', recipeId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('user_favorites').insert({ user_id: userId, recipe_id: recipeId });
  if (error) throw error;
  return true;
}
