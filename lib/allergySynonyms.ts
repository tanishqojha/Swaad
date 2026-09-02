/**
 * Free-text allergy/avoid input maps to real ingredient slugs through this
 * table rather than a literal string match, so "allergic to nuts" excludes
 * peanut, cashew, almond and walnut (PRD §8, Skills.md §2).
 *
 * Kept as a static config rather than a Supabase table: allergyMatch.ts must
 * stay pure and offline-testable, and at ~200 recipes the edit cadence is low
 * enough that shipping changes with the app is fine.
 *
 * Keys are the words a user might type; values are ingredient slugs as they
 * appear in the `ingredients` table. A key that is itself an ingredient slug
 * still belongs here if it has aliases.
 */
export const ALLERGY_SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  // ── Nuts ──────────────────────────────────────────────────────────────
  nut: ['peanut', 'cashew', 'almond', 'walnut', 'pistachio', 'hazelnut'],
  nuts: ['peanut', 'cashew', 'almond', 'walnut', 'pistachio', 'hazelnut'],
  'tree nut': ['cashew', 'almond', 'walnut', 'pistachio', 'hazelnut'],
  'tree nuts': ['cashew', 'almond', 'walnut', 'pistachio', 'hazelnut'],
  'dry fruit': ['cashew', 'almond', 'walnut', 'pistachio', 'raisin'],
  'dry fruits': ['cashew', 'almond', 'walnut', 'pistachio', 'raisin'],
  peanut: ['peanut'],
  peanuts: ['peanut'],
  groundnut: ['peanut'],
  groundnuts: ['peanut'],
  moongphali: ['peanut'],
  cashew: ['cashew'],
  cashews: ['cashew'],
  kaju: ['cashew'],
  almond: ['almond'],
  almonds: ['almond'],
  badam: ['almond'],
  walnut: ['walnut'],
  walnuts: ['walnut'],
  akhrot: ['walnut'],
  pistachio: ['pistachio'],
  pista: ['pistachio'],

  // ── Dairy ─────────────────────────────────────────────────────────────
  dairy: ['milk', 'curd', 'paneer', 'butter', 'ghee', 'cream', 'cheese', 'khoya'],
  milk: ['milk', 'cream', 'khoya'],
  lactose: ['milk', 'curd', 'paneer', 'butter', 'cream', 'cheese', 'khoya'],
  curd: ['curd'],
  dahi: ['curd'],
  yogurt: ['curd'],
  yoghurt: ['curd'],
  paneer: ['paneer'],
  cheese: ['cheese'],
  butter: ['butter'],
  ghee: ['ghee'],
  cream: ['cream'],

  // ── Gluten ────────────────────────────────────────────────────────────
  gluten: ['wheat-flour', 'maida', 'suji', 'daliya', 'bread', 'pasta'],
  wheat: ['wheat-flour', 'maida', 'suji', 'daliya'],
  atta: ['wheat-flour'],
  maida: ['maida'],
  suji: ['suji'],
  rava: ['suji'],
  semolina: ['suji'],

  // ── Eggs, fish, meat ──────────────────────────────────────────────────
  egg: ['egg'],
  eggs: ['egg'],
  anda: ['egg'],
  seafood: ['fish', 'prawn', 'crab'],
  shellfish: ['prawn', 'crab'],
  prawn: ['prawn'],
  prawns: ['prawn'],
  shrimp: ['prawn'],
  fish: ['fish'],
  chicken: ['chicken'],
  mutton: ['mutton'],
  pork: ['pork'],
  beef: ['beef'],

  // ── Legumes & soy ─────────────────────────────────────────────────────
  soy: ['soy-sauce', 'soya-chunks', 'tofu'],
  soya: ['soy-sauce', 'soya-chunks', 'tofu'],
  tofu: ['tofu'],

  // ── Common "avoid" notes (not allergies, but the same exclusion path) ──
  onion: ['onion'],
  garlic: ['garlic'],
  'onion garlic': ['onion', 'garlic'],
  mushroom: ['mushroom'],
  mushrooms: ['mushroom'],
  brinjal: ['brinjal'],
  eggplant: ['brinjal'],
  baingan: ['brinjal'],
  sesame: ['sesame-seed', 'til'],
  til: ['sesame-seed', 'til'],
  mustard: ['mustard-seed', 'mustard-oil'],
  coconut: ['coconut', 'coconut-milk'],
} as const;

/**
 * Ingredient slugs a diet excludes outright, independent of the free-text note.
 * Jain is no onion/garlic/root vegetables per PRD §8; vegan excludes all dairy
 * and honey on top of the non-vegetarian exclusions.
 */
export const DIETARY_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {
  vegetarian: ['chicken', 'mutton', 'fish', 'prawn', 'crab', 'pork', 'beef', 'egg'],
  eggetarian: ['chicken', 'mutton', 'fish', 'prawn', 'crab', 'pork', 'beef'],
  vegan: [
    'chicken',
    'mutton',
    'fish',
    'prawn',
    'crab',
    'pork',
    'beef',
    'egg',
    'milk',
    'curd',
    'paneer',
    'butter',
    'ghee',
    'cream',
    'cheese',
    'khoya',
    'honey',
  ],
  jain: [
    'chicken',
    'mutton',
    'fish',
    'prawn',
    'crab',
    'pork',
    'beef',
    'egg',
    'onion',
    'garlic',
    'potato',
    'ginger',
    'carrot',
    'radish',
    'beetroot',
    'sweet-potato',
    'yam',
    'mushroom',
  ],
  non_vegetarian: [],
} as const;

/** Words stripped before synonym lookup, so "allergic to peanuts" resolves. */
export const ALLERGY_STOP_WORDS: readonly string[] = [
  'allergic',
  'allergy',
  'allergies',
  'to',
  'and',
  'or',
  'no',
  'not',
  'avoid',
  'avoiding',
  'cant',
  'cannot',
  'eat',
  'have',
  'a',
  'an',
  'the',
  'im',
  'i',
  'am',
  'my',
  'on',
  'diet',
  'intolerant',
  'intolerance',
  'sensitive',
  'please',
  'without',
];
