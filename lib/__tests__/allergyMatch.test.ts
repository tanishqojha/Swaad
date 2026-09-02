/**
 * Executable spec for lib/allergyMatch.ts. Red until the stubs are filled in.
 */
import { conflictsWith, dietaryExclusions, parseExclusions } from '../allergyMatch';
import { makeRecipe, recipeIng } from './fixtures';

describe('parseExclusions', () => {
  it('returns nothing for empty or whitespace input', () => {
    expect(parseExclusions('')).toEqual([]);
    expect(parseExclusions('   ')).toEqual([]);
  });

  it('resolves a plain ingredient name', () => {
    expect(parseExclusions('cashew')).toContain('cashew');
  });

  it('strips stop words around the allergen (PRD §8 free-text field)', () => {
    expect(parseExclusions('allergic to cashews')).toContain('cashew');
    expect(parseExclusions('I cannot eat peanuts')).toContain('peanut');
  });

  it('expands a category word to every ingredient it covers', () => {
    const out = parseExclusions('nuts');
    expect(out).toEqual(expect.arrayContaining(['peanut', 'cashew', 'almond', 'walnut']));
  });

  it('handles multi-word synonyms', () => {
    expect(parseExclusions('no tree nuts please')).toEqual(
      expect.arrayContaining(['cashew', 'almond', 'walnut']),
    );
  });

  it('handles several exclusions in one note', () => {
    const out = parseExclusions('allergic to peanuts and dairy');
    expect(out).toEqual(expect.arrayContaining(['peanut', 'milk', 'paneer']));
  });

  it('resolves Hindi ingredient names', () => {
    expect(parseExclusions('kaju')).toContain('cashew');
    expect(parseExclusions('badam se allergy hai')).toContain('almond');
  });

  it('is case and punctuation insensitive', () => {
    expect(parseExclusions('ALLERGIC TO: Peanuts!')).toContain('peanut');
  });

  it('de-duplicates overlapping terms', () => {
    const out = parseExclusions('nuts, cashew, kaju');
    expect(out.filter((s) => s === 'cashew')).toHaveLength(1);
  });

  it('keeps an unrecognised term as a slug rather than dropping it silently', () => {
    expect(parseExclusions('jackfruit')).toContain('jackfruit');
  });
});

describe('dietaryExclusions', () => {
  it('excludes meat and egg for vegetarian', () => {
    const out = dietaryExclusions('vegetarian');
    expect(out).toEqual(expect.arrayContaining(['chicken', 'fish', 'egg']));
  });

  it('allows egg for eggetarian but not meat', () => {
    const out = dietaryExclusions('eggetarian');
    expect(out).not.toContain('egg');
    expect(out).toContain('chicken');
  });

  it('excludes dairy for vegan', () => {
    expect(dietaryExclusions('vegan')).toEqual(
      expect.arrayContaining(['milk', 'paneer', 'ghee', 'honey']),
    );
  });

  it('excludes onion, garlic and root vegetables for Jain (PRD §8)', () => {
    expect(dietaryExclusions('jain')).toEqual(
      expect.arrayContaining(['onion', 'garlic', 'potato', 'carrot']),
    );
  });

  it('excludes nothing for non-vegetarian', () => {
    expect(dietaryExclusions('non_vegetarian')).toEqual([]);
  });
});

describe('conflictsWith', () => {
  const withCashew = makeRecipe({
    id: 'r1',
    ingredients: [recipeIng('rice'), recipeIng('cashew')],
  });

  it('is false when nothing is excluded', () => {
    expect(conflictsWith(withCashew, [])).toBe(false);
  });

  it('is true when a recipe ingredient is excluded', () => {
    expect(conflictsWith(withCashew, ['cashew'])).toBe(true);
  });

  it('is true even when the allergen is an optional ingredient', () => {
    const garnished = makeRecipe({
      id: 'r2',
      ingredients: [recipeIng('rice'), recipeIng('cashew', '6', true)],
    });
    expect(conflictsWith(garnished, ['cashew'])).toBe(true);
  });

  it('does not match on a substring of an unrelated slug', () => {
    const withCoconut = makeRecipe({
      id: 'r3',
      ingredients: [recipeIng('coconut-milk')],
    });
    expect(conflictsWith(withCoconut, ['milk'])).toBe(false);
  });
});
