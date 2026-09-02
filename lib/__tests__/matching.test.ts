/**
 * Executable spec for lib/matching.ts. Red until the stubs are filled in.
 * Each block maps to a P0 acceptance criterion in PRD §7.
 */
import { MAX_RESULTS, matchReason, rankRecipes } from '../matching';
import { makeInput, makeRecipe, price, recipeIng } from './fixtures';

const prices = [
  price('paneer', 40, 60),
  price('capsicum', 15, 25),
  price('cashew', 60, 90),
  price('chicken', 120, 180),
  price('cream', 20, 30),
];

const pulaoRice = makeRecipe({
  id: 'pulao',
  name: 'Veg pulao',
  ingredients: [recipeIng('rice'), recipeIng('peas'), recipeIng('onion')],
  mealTypes: ['lunch', 'dinner'],
});

describe('rankRecipes — ingredient matching (PRD §7)', () => {
  it('reports the match fraction the ring renders', () => {
    const input = makeInput({ availableIngredientSlugs: ['rice', 'peas'] });
    const [top] = rankRecipes([pulaoRice], input, prices);
    expect(top.matchedCount).toBe(2);
    expect(top.totalCount).toBe(3);
    expect(top.matchRatio).toBeCloseTo(2 / 3);
  });

  it('lists exactly what is missing', () => {
    const input = makeInput({ availableIngredientSlugs: ['rice', 'peas'] });
    const [top] = rankRecipes([pulaoRice], input, prices);
    expect(top.missing.map((m) => m.ingredient.slug)).toEqual(['onion']);
  });

  it('excludes optional ingredients from the match denominator', () => {
    const garnished = makeRecipe({
      id: 'g',
      ingredients: [recipeIng('rice'), recipeIng('coriander', '1 sprig', true)],
    });
    const input = makeInput({ availableIngredientSlugs: ['rice'] });
    const [top] = rankRecipes([garnished], input, prices);
    expect(top.totalCount).toBe(1);
    expect(top.matchRatio).toBe(1);
    expect(top.missing).toEqual([]);
  });

  it('ranks a better ingredient fit above a worse one', () => {
    const worse = makeRecipe({
      id: 'worse',
      ingredients: [recipeIng('rice'), recipeIng('capsicum'), recipeIng('cream')],
    });
    const input = makeInput({ availableIngredientSlugs: ['rice', 'peas', 'onion'] });
    const ranked = rankRecipes([worse, pulaoRice], input, prices);
    expect(ranked[0].recipe.id).toBe('pulao');
  });
});

describe('rankRecipes — hard filters', () => {
  it('excludes an allergen recipe even at a perfect ingredient match (PRD §8)', () => {
    const kajuCurry = makeRecipe({
      id: 'kaju',
      ingredients: [recipeIng('cashew'), recipeIng('cream')],
    });
    const input = makeInput({
      availableIngredientSlugs: ['cashew', 'cream'],
      allergyNote: 'allergic to cashews',
    });
    expect(rankRecipes([kajuCurry], input, prices)).toEqual([]);
  });

  it('excludes non-vegetarian recipes for a vegetarian user', () => {
    const chicken = makeRecipe({
      id: 'chicken',
      ingredients: [recipeIng('chicken'), recipeIng('onion')],
      dietaryTags: ['non_vegetarian'],
    });
    const input = makeInput({ dietary: 'vegetarian' });
    expect(rankRecipes([chicken, pulaoRice], input, prices).map((r) => r.recipe.id)).toEqual(
      ['pulao'],
    );
  });

  it('excludes recipes needing an appliance the user does not have (PRD §6)', () => {
    const baked = makeRecipe({
      id: 'baked',
      ingredients: [recipeIng('rice')],
      applianceSlugs: ['oven'],
    });
    const input = makeInput({ availableApplianceSlugs: ['gas-stove'] });
    expect(rankRecipes([baked], input, prices)).toEqual([]);
  });

  it('excludes recipes not tagged with the selected meal type (PRD §7)', () => {
    const input = makeInput({ mealType: 'evening_snack' });
    expect(rankRecipes([pulaoRice], input, prices)).toEqual([]);
  });

  it('keeps a recipe tagged with several meal types when one is selected', () => {
    const input = makeInput({ mealType: 'lunch' });
    expect(rankRecipes([pulaoRice], input, prices)).toHaveLength(1);
  });

  it('excludes recipes whose missing-ingredient cost is over budget (PRD §7)', () => {
    const pricey = makeRecipe({
      id: 'pricey',
      ingredients: [recipeIng('chicken'), recipeIng('cashew')],
      dietaryTags: ['non_vegetarian'],
    });
    const input = makeInput({ dietary: 'non_vegetarian', budget: { minInr: 0, maxInr: 50 } });
    expect(rankRecipes([pricey], input, prices)).toEqual([]);
  });

  it('allows any cost in the open-ended ₹300+ bucket', () => {
    const pricey = makeRecipe({
      id: 'pricey',
      ingredients: [recipeIng('chicken'), recipeIng('cashew')],
      dietaryTags: ['non_vegetarian'],
    });
    const input = makeInput({
      dietary: 'non_vegetarian',
      budget: { minInr: 300, maxInr: null },
    });
    expect(rankRecipes([pricey], input, prices)).toHaveLength(1);
  });
});

describe('rankRecipes — result shape', () => {
  it('returns at most 3 recipes (PRD §7)', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      makeRecipe({ id: `r${i}`, ingredients: [recipeIng('rice')] }),
    );
    const input = makeInput({ availableIngredientSlugs: ['rice'] });
    expect(rankRecipes(many, input, prices).length).toBeLessThanOrEqual(MAX_RESULTS);
  });

  it('returns an empty array rather than throwing when nothing matches', () => {
    expect(rankRecipes([], makeInput(), prices)).toEqual([]);
  });

  it('attaches a shopping list to each result', () => {
    const input = makeInput({ availableIngredientSlugs: ['rice', 'peas'] });
    const [top] = rankRecipes([pulaoRice], input, prices);
    expect(top.shoppingList.items).toHaveLength(1);
  });

  it('is sorted by descending score', () => {
    const partial = makeRecipe({
      id: 'partial',
      ingredients: [recipeIng('rice'), recipeIng('capsicum')],
    });
    const full = makeRecipe({ id: 'full', ingredients: [recipeIng('rice')] });
    const input = makeInput({ availableIngredientSlugs: ['rice'] });
    const ranked = rankRecipes([partial, full], input, prices);
    expect(ranked.map((r) => r.score)).toEqual([...ranked.map((r) => r.score)].sort((a, b) => b - a));
  });
});

describe('matchReason', () => {
  it('explains the match in the user’s own terms (PRD §6)', () => {
    const input = makeInput({ availableIngredientSlugs: ['rice', 'peas'] });
    const [top] = rankRecipes([pulaoRice], input, prices);
    expect(matchReason(top)).toMatch(/2 of (your )?3/i);
  });
});
