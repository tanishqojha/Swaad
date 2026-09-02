/**
 * Shopping list and budget calculation (Skills.md §3, PRD §7 P0).
 *
 * Prices come from the static, manually-maintained `price_ranges` table
 * bucketed by city tier — there is no live pricing API in v1 (Rules.md #11).
 */
import type {
  BudgetRange,
  BudgetStatus,
  CityTier,
  PriceRange,
  RecipeIngredient,
  ShoppingList,
} from './types';

/**
 * Rupee window below the cap where a total counts as "near" rather than
 * "under" — drives the amber running total in Design.md §4.
 */
export const NEAR_BUDGET_WINDOW_INR = 10;

/**
 * Builds the itemised shopping list for a recipe's missing ingredients.
 *
 * Looks up each ingredient's price row for the given city tier, sums the min
 * and max columns separately, and classifies the result against the budget.
 * Ingredients with no price row are listed with `price: null` and reported in
 * `unpricedSlugs` — they contribute nothing to the total, so the UI can say
 * the estimate is incomplete rather than quietly understating it.
 *
 * Optional ingredients are the caller's decision; whatever is passed in is
 * priced.
 */
export function buildShoppingList(
  missing: readonly RecipeIngredient[],
  prices: readonly PriceRange[],
  cityTier: CityTier,
  budget: BudgetRange,
): ShoppingList {
  const items = missing.map(({ ingredient, quantity, unit }) => ({
    ingredient,
    quantity,
    unit,
    price:
      prices.find(
        (row) => row.ingredientSlug === ingredient.slug && row.cityTier === cityTier,
      ) ?? null,
  }));

  // ponytail: unpriced ingredients count as ₹0, so a recipe whose missing
  // items all lack price rows reads as free and can pass the budget filter.
  // `unpricedSlugs` is the honest signal; tighten this (treat unpriced as
  // over-budget, or backfill the price table) once coverage gaps show up in
  // the empty-result metric from PRD §12.
  const priced = items.filter((item) => item.price !== null);
  const totalMinInr = priced.reduce((sum, item) => sum + (item.price?.minInr ?? 0), 0);
  const totalMaxInr = priced.reduce((sum, item) => sum + (item.price?.maxInr ?? 0), 0);

  return {
    items,
    totalMinInr,
    totalMaxInr,
    status: budgetStatus(totalMaxInr, budget),
    unpricedSlugs: items
      .filter((item) => item.price === null)
      .map((item) => item.ingredient.slug),
  };
}

/**
 * Classifies a total against the budget, judged on the *maximum* estimate so
 * the app never tells a user something fits when the top of the range doesn't.
 *
 * - `over`  — maximum exceeds the cap
 * - `near`  — maximum is within NEAR_BUDGET_WINDOW_INR of the cap
 * - `under` — otherwise
 *
 * A `null` cap is the open-ended "₹300+" bucket and is always `under`.
 */
export function budgetStatus(totalMaxInr: number, budget: BudgetRange): BudgetStatus {
  const cap = budget.maxInr;
  if (cap === null) return 'under';
  if (totalMaxInr > cap) return 'over';
  if (totalMaxInr >= cap - NEAR_BUDGET_WINDOW_INR) return 'near';
  return 'under';
}

/**
 * Formats a rupee range for display, e.g. "₹35–50", collapsing to "₹40" when
 * min and max are equal. Ranges, never false precision (PRD §10).
 */
export function formatPriceRange(minInr: number, maxInr: number): string {
  return minInr === maxInr ? `₹${minInr}` : `₹${minInr}–${maxInr}`;
}
