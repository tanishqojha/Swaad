-- Accounts, added on top of the anonymous v1 schema so favorites and reviews
-- can be tied to a real user (overrides PRD §3's "no accounts" non-goal —
-- recorded here since it's a deliberate scope change, not a silent one).
--
-- RLS decision (Rules.md #9): both tables are owned by the authenticated
-- user. `user_favorites` is fully private — a user can only read or write
-- their own rows. `recipe_reviews` is public-read (reviews are a community
-- feature) but a user can only insert/update/delete their own row.

create table user_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table user_favorites enable row level security;

create policy "users read their own favorites"
  on user_favorites for select to authenticated using (auth.uid() = user_id);
create policy "users insert their own favorites"
  on user_favorites for insert to authenticated with check (auth.uid() = user_id);
create policy "users delete their own favorites"
  on user_favorites for delete to authenticated using (auth.uid() = user_id);

create table recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) > 0),
  created_at timestamptz not null default now()
);

create index recipe_reviews_recipe_idx on recipe_reviews (recipe_id);

alter table recipe_reviews enable row level security;

create policy "reviews are publicly readable"
  on recipe_reviews for select to anon, authenticated using (true);
create policy "users insert their own reviews"
  on recipe_reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "users update their own reviews"
  on recipe_reviews for update to authenticated using (auth.uid() = user_id);
create policy "users delete their own reviews"
  on recipe_reviews for delete to authenticated using (auth.uid() = user_id);
