/**
 * Recipe matching and ranking (Skills.md §1, PRD §7 P0).
 *
 * Pure and network-free by design: the app fetches candidate recipes from
 * Supabase and scores them on-device, so this module can be unit tested
 * without a live connection (Rules.md #6). Moving this to an Edge Function is
 * a Phase 2 option, not a v1 requirement.
 */
import { conflictsWith, dietaryExclusions, parseExclusions, slugify } from './allergyMatch';
import { buildShoppingList } from './budget';
import type { PriceRange, RankedRecipe, Recipe, UserInput } from './types';

/** PRD §7: "exactly 2-3 recipes are shown". */
export const MAX_RESULTS = 3;
export const MIN_RESULTS = 2;

/**
 * Relative weights of the three scoring inputs. Hard filters (dietary,
 * allergy, appliance, meal type) are NOT scoring inputs — an excluded recipe
 * never appears regardless of how well it scores (Skills.md §1).
 */
export const SCORE_WEIGHTS = {
  ingredientMatch: 0.6,
  budgetFit: 0.25,
  mealTypeFit: 0.15,
} as const;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/**
 * Filters, scores and ranks candidate recipes.
 *
 * Order of operations:
 *  1. Hard-exclude on dietary category and allergy/free-text conflicts.
 *  2. Hard-exclude recipes needing an appliance the user does not have.
 *  3. Hard-exclude recipes not tagged with the selected meal type.
 *  4. Hard-exclude recipes whose missing-ingredient cost is over budget
 *     (PRD §7: only in-budget recipes are eligible for the top 3).
 *  5. Score survivors on ingredient match %, budget fit and meal-type fit.
 *  6. Return the top MAX_RESULTS, best first.
 *
 * Returns an empty array when nothing survives — the caller renders the
 * "relax your budget or ingredients" empty state (PRD §7 P0), never a blank
 * screen.
 *
 * Optional ingredients are excluded from both the match denominator and the
 * shopping list, so a recipe is not penalised for a garnish.
 */
export function rankRecipes(
  recipes: readonly Recipe[],
  input: UserInput,
  prices: readonly PriceRange[],
): RankedRecipe[] {
  const exclusions = [...dietaryExclusions(input.dietary), ...parseExclusions(input.allergyNote)];
  const available = new Set([
    ...input.availableIngredientSlugs,
    ...input.freeTextIngredients.map(slugify),
  ]);
  const appliances = new Set(input.availableApplianceSlugs);
  // The open-ended "₹300+" bucket has no cap, so score against what the user
  // was willing to spend at minimum rather than treating every price as equal.
  const budgetReference = input.budget.maxInr ?? Math.max(input.budget.minInr, 1);

  const ranked: RankedRecipe[] = [];

  for (const recipe of recipes) {
    // 1. Dietary and allergy exclusions. The tag check catches a meat dish
    //    whose ingredient slugs we have not enumerated in DIETARY_EXCLUSIONS.
    if (input.dietary !== 'non_vegetarian' && recipe.dietaryTags.includes('non_vegetarian')) {
      continue;
    }
    if (conflictsWith(recipe, exclusions)) continue;

    // 2. Appliances the user does not have.
    if (!recipe.applianceSlugs.every((slug) => appliances.has(slug))) continue;

    // 3. Meal type.
    if (!recipe.mealTypes.includes(input.mealType)) continue;

    // 4. Budget, judged on the missing ingredients only.
    const required = recipe.ingredients.filter((item) => !item.isOptional);
    const missing = required.filter((item) => !available.has(item.ingredient.slug));
    const shoppingList = buildShoppingList(missing, prices, input.cityTier, input.budget);
    if (shoppingList.status === 'over') continue;

    // 5. Score.
    const totalCount = required.length;
    const matchedCount = totalCount - missing.length;
    const matchRatio = totalCount === 0 ? 1 : matchedCount / totalCount;
    const budgetFit = clamp01(1 - shoppingList.totalMaxInr / budgetReference);
    // A dish tagged only "fancy" answers a "fancy" request better than one
    // tagged for every occasion.
    const mealTypeFit = 1 / Math.max(recipe.mealTypes.length, 1);

    ranked.push({
      recipe,
      matchedCount,
      totalCount,
      matchRatio,
      missing,
      shoppingList,
      score:
        SCORE_WEIGHTS.ingredientMatch * matchRatio +
        SCORE_WEIGHTS.budgetFit * budgetFit +
        SCORE_WEIGHTS.mealTypeFit * mealTypeFit,
    });
  }

  // 6. Best first.
  return ranked.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
}

/**
 * Human-readable reason a recipe was suggested — the trust signal from PRD §6's
 * user stories.
 */
export function matchReason(ranked: RankedRecipe): string {
  if (ranked.missing.length === 0) return 'Fully makeable now';
  return `You have ${ranked.matchedCount} of ${ranked.totalCount} ingredients`;
}
