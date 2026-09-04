/**
 * Recipe reviews — the community-tips feature from the Stitch designs.
 * Public-read, write-scoped-to-owner (supabase/migrations/0004_auth.sql).
 */
import { supabase } from './supabase';

export type Review = {
  id: string;
  recipeId: string;
  userId: string;
  rating: number;
  body: string;
  createdAt: string;
};

export async function fetchReviews(recipeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('recipe_reviews')
    .select('id, recipe_id, user_id, rating, body, created_at')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    recipeId: row.recipe_id,
    userId: row.user_id,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function addReview(recipeId: string, userId: string, rating: number, body: string): Promise<void> {
  const { error } = await supabase.from('recipe_reviews').insert({ recipe_id: recipeId, user_id: userId, rating, body });
  if (error) throw error;
}
