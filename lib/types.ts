/**
 * Shared domain types for Swaad's pure logic modules. These mirror the Supabase
 * schema in supabase/migrations/0001_init.sql but stay free of any Supabase or
 * React Native import so matching/budget/allergy logic can be unit tested
 * without a live connection (Rules.md #6, Skills.md §1).
 */

/** PRD §5 step 3 — the user picks exactly one of these. */
export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'morning_snack'
  | 'afternoon_snack'
  | 'evening_snack'
  | 'fancy'
  | 'light'
  | 'child_specific';

/** PRD §8 — structured dietary filters, single-select. */
export type DietaryCategory =
  | 'vegetarian'
  | 'non_vegetarian'
  | 'eggetarian'
  | 'vegan'
  | 'jain';

/** PRD §10 — price ranges are bucketed by city tier, not by exact location. */
export type CityTier = 'metro' | 'tier_2' | 'tier_3';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Ingredient = {
  id: string;
  /** Display name, e.g. "Moong dal". */
  name: string;
  /** Lowercase, hyphenated match key, e.g. "moong-dal". */
  slug: string;
  /** e.g. "dal", "spice", "vegetable" — used to group the shopping list. */
  category: string | null;
  /** Pre-populated on the input screen (PRD §5 step 1). */
  isStaple: boolean;
};

export type Appliance = {
  id: string;
  name: string;
  slug: string;
};

export type RecipeIngredient = {
  ingredient: Ingredient;
  /** Free-form so "1/2", "a pinch" and "2" all round-trip. */
  quantity: string;
  unit: string | null;
  /** Optional ingredients do not count against the match or the budget. */
  isOptional: boolean;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  /** Ordered method steps, original writing only (Rules.md #10). */
  steps: string[];
  prepMinutes: number;
  serves: number;
  difficulty: Difficulty;
  /** e.g. "South Indian", "Punjabi", "Bengali". */
  region: string;
  ingredients: RecipeIngredient[];
  applianceSlugs: string[];
  /** A recipe may carry several, e.g. ["dinner", "fancy"]. */
  mealTypes: MealType[];
  dietaryTags: DietaryCategory[];
};

export type PriceRange = {
  ingredientSlug: string;
  cityTier: CityTier;
  /** Whole rupees. Displayed as a range, never as false precision (PRD §10). */
  minInr: number;
  maxInr: number;
  /** The unit the price covers, e.g. "250g", "1 pc". */
  unit: string;
};

/** PRD §5 step 2 — budget for *additional* ingredients only. */
export type BudgetRange = {
  minInr: number;
  /** `null` means the open-ended "₹300+" bucket. */
  maxInr: number | null;
};

/** Everything the input flow collects, handed to the matcher in one object. */
export type UserInput = {
  /** Slugs of ingredients the user already has. */
  availableIngredientSlugs: string[];
  /** Free-text "anything else" entries, stored unstructured (PRD §7 P0). */
  freeTextIngredients: string[];
  availableApplianceSlugs: string[];
  budget: BudgetRange;
  mealType: MealType;
  dietary: DietaryCategory;
  /** Raw free-text allergy/avoid note, e.g. "allergic to peanuts". */
  allergyNote: string;
  cityTier: CityTier;
};

/** Where a shopping list total sits against the stated budget (Design.md §4). */
export type BudgetStatus = 'under' | 'near' | 'over';

export type ShoppingListItem = {
  ingredient: Ingredient;
  quantity: string;
  unit: string | null;
  /** `null` when no price row exists for this ingredient + city tier. */
  price: PriceRange | null;
};

export type ShoppingList = {
  items: ShoppingListItem[];
  /** Summed minimums, whole rupees. */
  totalMinInr: number;
  /** Summed maximums, whole rupees. */
  totalMaxInr: number;
  status: BudgetStatus;
  /** Slugs with no price row — surfaced so the total is honest about gaps. */
  unpricedSlugs: string[];
};

/** A recipe that survived every hard filter, with its score and shopping list. */
export type RankedRecipe = {
  recipe: Recipe;
  /** Non-optional ingredients the user already has. */
  matchedCount: number;
  /** Non-optional ingredient count — the denominator of the match ring. */
  totalCount: number;
  /** matchedCount / totalCount, 0-1. */
  matchRatio: number;
  missing: RecipeIngredient[];
  shoppingList: ShoppingList;
  /** Weighted total, 0-1. Higher ranks first. */
  score: number;
};
