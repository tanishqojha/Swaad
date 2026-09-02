-- Closed enumerations that are effectively part of the schema: the five
-- dietary categories (PRD §8) and the eight appliances the input screen offers
-- (PRD §5 step 1). No recipes and no ingredients here — those are authored
-- separately under the original-writing rule (Rules.md #10).

insert into dietary_tags (name, slug, description) values
  ('Vegetarian',     'vegetarian',     'No meat, fish or egg.'),
  ('Non-Vegetarian', 'non_vegetarian', 'Includes meat, fish and egg.'),
  ('Eggetarian',     'eggetarian',     'Egg is fine; no meat or fish.'),
  ('Vegan',          'vegan',          'No animal products at all, dairy and honey included.'),
  ('Jain',           'jain',           'No onion, garlic or root vegetables, and no meat, fish or egg.')
on conflict (slug) do nothing;

insert into appliances (name, slug) values
  ('Gas stove',     'gas-stove'),
  ('Induction',     'induction'),
  ('Pressure cooker', 'pressure-cooker'),
  ('Tawa',          'tawa'),
  ('Oven',          'oven'),
  ('Microwave',     'microwave'),
  ('Mixer-grinder', 'mixer-grinder'),
  ('Air fryer',     'air-fryer')
on conflict (slug) do nothing;
