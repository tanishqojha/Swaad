/**
 * Free-text allergy/avoid matching (Skills.md §2, PRD §8).
 *
 * A recipe conflicting with any exclusion is removed from results entirely —
 * it never appears even as a "needs more ingredients" suggestion (PRD §8).
 */
import { ALLERGY_STOP_WORDS, ALLERGY_SYNONYMS, DIETARY_EXCLUSIONS } from './allergySynonyms';
import type { DietaryCategory, Recipe } from './types';

/** Tokens shorter than this are noise ("se", "hai", stray letters). */
const MIN_TOKEN_LENGTH = 3;

const STOP_WORDS = new Set(ALLERGY_STOP_WORDS);

/**
 * Lowercase, hyphenated match key — the same shape as `ingredients.slug`.
 * Keeps internal hyphens so "low-sodium" survives intact.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenize(freeText: string): string[] {
  return freeText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ''))
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !STOP_WORDS.has(token));
}

/**
 * Turns a free-text note into the set of ingredient slugs to exclude.
 *
 * Lowercases, strips punctuation and stop words, then resolves each remaining
 * token — and each adjacent word pair, so "tree nuts" and "onion garlic" hit —
 * against ALLERGY_SYNONYMS. Unrecognised tokens are kept as slugified
 * candidates so a typed ingredient name still filters even without a synonym
 * entry. Returns a de-duplicated, sorted list; empty for empty/blank input.
 *
 * @example parseExclusions('allergic to peanuts, on a low-sodium diet')
 *          → ['low-sodium', 'peanut']
 */
export function parseExclusions(freeText: string): string[] {
  const tokens = tokenize(freeText);
  const excluded = new Set<string>();

  for (let i = 0; i < tokens.length; i += 1) {
    // Two-word synonyms win over one-word ones, so "tree nuts" does not
    // resolve through the broader "nuts" entry.
    const pair = `${tokens[i]} ${tokens[i + 1]}`;
    const pairMatch = i + 1 < tokens.length ? ALLERGY_SYNONYMS[pair] : undefined;
    if (pairMatch) {
      pairMatch.forEach((slug) => excluded.add(slug));
      i += 1;
      continue;
    }

    const match = ALLERGY_SYNONYMS[tokens[i]];
    if (match) {
      match.forEach((slug) => excluded.add(slug));
    } else {
      // Unknown word — keep it as a slug rather than dropping it silently, so
      // an ingredient we have no synonym entry for still filters.
      excluded.add(slugify(tokens[i]));
    }
  }

  return [...excluded].sort();
}

/**
 * Ingredient slugs excluded by the structured dietary filter alone, before any
 * free-text note is considered.
 */
export function dietaryExclusions(dietary: DietaryCategory): string[] {
  return [...(DIETARY_EXCLUSIONS[dietary] ?? [])];
}

/**
 * True if the recipe contains any excluded slug — including optional
 * ingredients, since an allergen the cook is meant to skip is still an
 * allergen printed in the recipe.
 *
 * Slugs match whole, never by substring: excluding "milk" must not knock out
 * "coconut-milk".
 */
export function conflictsWith(recipe: Recipe, exclusions: readonly string[]): boolean {
  if (exclusions.length === 0) return false;
  const excluded = new Set(exclusions);
  return recipe.ingredients.some(({ ingredient }) => excluded.has(ingredient.slug));
}
