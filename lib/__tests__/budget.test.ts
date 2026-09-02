/**
 * Executable spec for lib/budget.ts. Red until the stubs are filled in.
 */
import {
  NEAR_BUDGET_WINDOW_INR,
  budgetStatus,
  buildShoppingList,
  formatPriceRange,
} from '../budget';
import { price, recipeIng } from './fixtures';

const prices = [price('paneer', 40, 60), price('capsicum', 15, 25), price('cream', 20, 30)];

describe('buildShoppingList', () => {
  it('returns an empty, under-budget list for a fully makeable recipe', () => {
    const list = buildShoppingList([], prices, 'metro', { minInr: 0, maxInr: 50 });
    expect(list.items).toEqual([]);
    expect(list.totalMinInr).toBe(0);
    expect(list.totalMaxInr).toBe(0);
    expect(list.status).toBe('under');
  });

  it('itemises missing ingredients and sums min and max separately', () => {
    const list = buildShoppingList(
      [recipeIng('paneer'), recipeIng('capsicum')],
      prices,
      'metro',
      { minInr: 50, maxInr: 150 },
    );
    expect(list.items).toHaveLength(2);
    expect(list.totalMinInr).toBe(55);
    expect(list.totalMaxInr).toBe(85);
    expect(list.status).toBe('under');
  });

  it('flags an over-budget total on the maximum estimate, not the minimum', () => {
    const list = buildShoppingList(
      [recipeIng('paneer'), recipeIng('capsicum')],
      prices,
      'metro',
      { minInr: 0, maxInr: 60 },
    );
    // min 55 fits, max 85 does not — the honest answer is over.
    expect(list.status).toBe('over');
  });

  it('reports ingredients with no price row instead of understating the total', () => {
    const list = buildShoppingList(
      [recipeIng('paneer'), recipeIng('kasuri-methi')],
      prices,
      'metro',
      { minInr: 0, maxInr: 150 },
    );
    expect(list.unpricedSlugs).toEqual(['kasuri-methi']);
    expect(list.items).toHaveLength(2);
    expect(list.items[1].price).toBeNull();
    expect(list.totalMaxInr).toBe(60);
  });

  it('only uses price rows for the requested city tier (PRD §10)', () => {
    const tiered = [
      { ...price('paneer', 40, 60), cityTier: 'metro' as const },
      { ...price('paneer', 25, 35), cityTier: 'tier_3' as const },
    ];
    const list = buildShoppingList([recipeIng('paneer')], tiered, 'tier_3', {
      minInr: 0,
      maxInr: 150,
    });
    expect(list.totalMinInr).toBe(25);
    expect(list.totalMaxInr).toBe(35);
  });
});

describe('budgetStatus', () => {
  it('is under when comfortably below the cap', () => {
    expect(budgetStatus(20, { minInr: 0, maxInr: 50 })).toBe('under');
  });

  it('is near within the amber window below the cap (Design.md §4)', () => {
    expect(budgetStatus(50 - NEAR_BUDGET_WINDOW_INR + 1, { minInr: 0, maxInr: 50 })).toBe(
      'near',
    );
  });

  it('is near, not over, when exactly at the cap', () => {
    expect(budgetStatus(50, { minInr: 0, maxInr: 50 })).toBe('near');
  });

  it('is over by a single rupee', () => {
    expect(budgetStatus(51, { minInr: 0, maxInr: 50 })).toBe('over');
  });

  it('is always under for the open-ended ₹300+ bucket', () => {
    expect(budgetStatus(5000, { minInr: 300, maxInr: null })).toBe('under');
  });
});

describe('formatPriceRange', () => {
  it('renders a range with an en dash', () => {
    expect(formatPriceRange(35, 50)).toBe('₹35–50');
  });

  it('collapses an equal min and max to a single figure', () => {
    expect(formatPriceRange(40, 40)).toBe('₹40');
  });
});
