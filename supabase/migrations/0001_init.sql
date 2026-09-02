-- Swaad — initial schema.
--
-- RLS decision, recorded once and applied to every table below (Rules.md #9):
-- all ten tables hold curated reference data maintained out-of-band by the
-- Swaad team. The app is anonymous in v1 (no accounts — PRD §3 non-goal), so
-- every table gets RLS enabled with a single "public read" policy for anon and
-- authenticated, and *no* insert/update/delete policy. Under RLS, an operation
-- with no permissive policy is denied, so writes are closed by default and
-- only the service_role key (which bypasses RLS) can seed or edit content.

-- ── Enums ────────────────────────────────────────────────────────────────

-- PRD §5 step 3. A recipe may carry several of these (see recipe_meal_types),
-- so "Dinner" and "Fancy" can both apply to one dish — this settles the open
-- [Design] question in PRD §13.
create type meal_type as enum (
  'breakfast',
  'lunch',
  'dinner',
  'morning_snack',
  'afternoon_snack',
  'evening_snack',
  'fancy',
  'light',
  'child_specific'
);

-- PRD §10 — prices are bucketed by city tier, never geocoded.
create type city_tier as enum ('metro', 'tier_2', 'tier_3');

create type difficulty as enum ('easy', 'medium', 'hard');

-- ── Ingredients ──────────────────────────────────────────────────────────

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  -- Display name, e.g. "Moong dal".
  name text not null,
  -- Lowercase hyphenated match key, e.g. "moong-dal". Also the join key used
  -- by lib/allergySynonyms.ts, so it must stay stable once published.
  slug text not null unique,
  -- Grouping for the shopping list, e.g. "dal", "spice", "vegetable".
  category text,
  -- Pre-populated on the input screen (PRD §5 step 1).
  is_staple boolean not null default false,
  created_at timestamptz not null default now()
);

alter table ingredients enable row level security;
create policy "ingredients are publicly readable"
  on ingredients for select to anon, authenticated using (true);

-- ── Appliances ───────────────────────────────────────────────────────────

create table appliances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table appliances enable row level security;
create policy "appliances are publicly readable"
  on appliances for select to anon, authenticated using (true);

-- ── Dietary tags ─────────────────────────────────────────────────────────

-- PRD §8 structured filters. Kept as a table rather than an enum so the label
-- and description shown in the UI can be edited without a migration.
create table dietary_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

alter table dietary_tags enable row level security;
create policy "dietary tags are publicly readable"
  on dietary_tags for select to anon, authenticated using (true);

-- ── Recipes ──────────────────────────────────────────────────────────────

create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Original writing only, never copied from a source (Rules.md #10).
  description text not null,
  -- Ordered method steps.
  steps text[] not null check (array_length(steps, 1) > 0),
  prep_minutes integer not null check (prep_minutes > 0),
  serves integer not null check (serves > 0),
  difficulty difficulty not null default 'easy',
  -- e.g. "South Indian", "Punjabi", "Bengali" (PRD §5 step 5).
  region text not null,
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;
create policy "recipes are publicly readable"
  on recipes for select to anon, authenticated using (true);

-- ── Recipe joins ─────────────────────────────────────────────────────────

create table recipe_ingredients (
  recipe_id uuid not null references recipes (id) on delete cascade,
  ingredient_id uuid not null references ingredients (id) on delete restrict,
  -- Free-form so "1/2", "a pinch" and "2" all round-trip.
  quantity text not null,
  unit text,
  -- Optional ingredients count toward neither the match nor the budget.
  is_optional boolean not null default false,
  primary key (recipe_id, ingredient_id)
);

create index recipe_ingredients_ingredient_idx on recipe_ingredients (ingredient_id);

alter table recipe_ingredients enable row level security;
create policy "recipe ingredients are publicly readable"
  on recipe_ingredients for select to anon, authenticated using (true);

create table recipe_appliances (
  recipe_id uuid not null references recipes (id) on delete cascade,
  appliance_id uuid not null references appliances (id) on delete restrict,
  primary key (recipe_id, appliance_id)
);

alter table recipe_appliances enable row level security;
create policy "recipe appliances are publicly readable"
  on recipe_appliances for select to anon, authenticated using (true);

create table recipe_meal_types (
  recipe_id uuid not null references recipes (id) on delete cascade,
  meal_type meal_type not null,
  primary key (recipe_id, meal_type)
);

create index recipe_meal_types_meal_type_idx on recipe_meal_types (meal_type);

alter table recipe_meal_types enable row level security;
create policy "recipe meal types are publicly readable"
  on recipe_meal_types for select to anon, authenticated using (true);

create table recipe_dietary_tags (
  recipe_id uuid not null references recipes (id) on delete cascade,
  dietary_tag_id uuid not null references dietary_tags (id) on delete restrict,
  primary key (recipe_id, dietary_tag_id)
);

alter table recipe_dietary_tags enable row level security;
create policy "recipe dietary tags are publicly readable"
  on recipe_dietary_tags for select to anon, authenticated using (true);

-- ── Prices ───────────────────────────────────────────────────────────────

-- PRD §10 / Rules.md #11: static, manually maintained, no live pricing API.
-- Whole rupees, shown to users as a range ("₹20-30"), never false precision.
create table price_ranges (
  ingredient_id uuid not null references ingredients (id) on delete cascade,
  city_tier city_tier not null,
  min_inr integer not null check (min_inr >= 0),
  max_inr integer not null check (max_inr >= min_inr),
  -- What the price covers, e.g. "250g", "1 pc".
  unit text not null,
  updated_at timestamptz not null default now(),
  primary key (ingredient_id, city_tier)
);

alter table price_ranges enable row level security;
create policy "price ranges are publicly readable"
  on price_ranges for select to anon, authenticated using (true);
