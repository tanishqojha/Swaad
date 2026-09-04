/**
 * Supabase reads, mapped into the pure domain types from `types.ts`. Kept
 * separate from matching.ts/budget.ts so those stay network-free and
 * unit-testable (Rules.md #6) — this module is the only one that talks to
 * Supabase.
 */
import { supabase } from './supabase';
import type { Appliance, CityTier, DietaryCategory, Difficulty, Ingredient, MealType, PriceRange, Recipe } from './types';

export async function fetchIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase.from('ingredients').select('*').order('name');
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    isStaple: row.is_staple,
  }));
}

export async function fetchAppliances(): Promise<Appliance[]> {
  const { data, error } = await supabase.from('appliances').select('*').order('name');
  if (error) throw error;
  return data.map((row) => ({ id: row.id, name: row.name, slug: row.slug }));
}

export async function fetchPriceRanges(cityTier: CityTier): Promise<PriceRange[]> {
  const { data, error } = await supabase
    .from('price_ranges')
    .select('min_inr, max_inr, unit, ingredients(slug)')
    .eq('city_tier', cityTier);
  if (error) throw error;
  return data.map((row: any) => ({
    ingredientSlug: row.ingredients.slug,
    cityTier,
    minInr: row.min_inr,
    maxInr: row.max_inr,
    unit: row.unit,
  }));
}

/**
 * One recipe with every join resolved. Supabase's nested-select syntax below
 * pulls ingredients (with the joined ingredient row), appliances, meal types
 * and dietary tags in a single round trip.
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('recipes').select(`
    id, name, description, steps, prep_minutes, serves, difficulty, region,
    recipe_ingredients ( quantity, unit, is_optional, ingredients ( id, name, slug, category, is_staple ) ),
    recipe_appliances ( appliances ( slug ) ),
    recipe_meal_types ( meal_type ),
    recipe_dietary_tags ( dietary_tags ( slug ) )
  `);
  if (error) throw error;

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    steps: row.steps,
    prepMinutes: row.prep_minutes,
    serves: row.serves,
    difficulty: row.difficulty as Difficulty,
    region: row.region,
    ingredients: row.recipe_ingredients.map((ri: any) => ({
      ingredient: {
        id: ri.ingredients.id,
        name: ri.ingredients.name,
        slug: ri.ingredients.slug,
        category: ri.ingredients.category,
        isStaple: ri.ingredients.is_staple,
      },
      quantity: ri.quantity,
      unit: ri.unit,
      isOptional: ri.is_optional,
    })),
    applianceSlugs: row.recipe_appliances.map((ra: any) => ra.appliances.slug),
    mealTypes: row.recipe_meal_types.map((rmt: any) => rmt.meal_type as MealType),
    dietaryTags: row.recipe_dietary_tags.map((rdt: any) => rdt.dietary_tags.slug as DietaryCategory),
  }));
}
