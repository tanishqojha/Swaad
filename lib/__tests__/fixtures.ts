/**
 * Test fixtures. Recipe text here is placeholder scaffolding for the logic
 * tests, not seed data — real recipes are authored separately under the
 * original-writing rule (Rules.md #10).
 */
import type {
  Ingredient,
  PriceRange,
  Recipe,
  RecipeIngredient,
  UserInput,
} from '../types';

export const ing = (slug: string, name = slug, isStaple = false): Ingredient => ({
  id: `ing-${slug}`,
  name,
  slug,
  category: null,
  isStaple,
});

export const recipeIng = (
  slug: string,
  quantity = '1',
  isOptional = false,
): RecipeIngredient => ({
  ingredient: ing(slug),
  quantity,
  unit: null,
  isOptional,
});

export const price = (
  ingredientSlug: string,
  minInr: number,
  maxInr: number,
): PriceRange => ({
  ingredientSlug,
  cityTier: 'metro',
  minInr,
  maxInr,
  unit: '250g',
});

export const makeRecipe = (over: Partial<Recipe> & { id: string }): Recipe => ({
  name: 'Test recipe',
  description: 'A recipe used only in tests.',
  steps: ['Step one.', 'Step two.'],
  prepMinutes: 25,
  serves: 2,
  difficulty: 'easy',
  region: 'South Indian',
  ingredients: [],
  applianceSlugs: ['gas-stove'],
  mealTypes: ['dinner'],
  dietaryTags: ['vegetarian'],
  ...over,
});

export const makeInput = (over: Partial<UserInput> = {}): UserInput => ({
  availableIngredientSlugs: [],
  freeTextIngredients: [],
  availableApplianceSlugs: ['gas-stove', 'pressure-cooker'],
  budget: { minInr: 0, maxInr: 150 },
  mealType: 'dinner',
  dietary: 'vegetarian',
  allergyNote: '',
  cityTier: 'metro',
  ...over,
});
