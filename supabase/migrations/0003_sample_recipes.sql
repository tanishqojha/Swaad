-- Sample recipe content so the app is runnable end-to-end. This is NOT the
-- full ~150-200 recipe database the PRD asks for at P0 — that is a separate
-- content-authoring task (Rules.md #10: original writing, not a quick seed).
-- Ten recipes here cover every meal type, dietary tag and appliance used by
-- lib/matching.ts's tests, enough to demo and manually test the input flow.

-- ── Ingredients ──────────────────────────────────────────────────────────

insert into ingredients (name, slug, category, is_staple) values
  ('Toor dal',            'toor-dal',        'dal',        false),
  ('Moong dal',           'moong-dal',       'dal',        false),
  ('Rice',                'rice',            'grain',      true),
  ('Poha (flattened rice)','poha',           'grain',      false),
  ('Semolina (sooji)',    'sooji',           'grain',      false),
  ('Wheat flour',         'wheat-flour',     'grain',      true),
  ('Chickpeas (chana)',   'chickpea',        'legume',     false),
  ('Onion',               'onion',           'vegetable',  true),
  ('Tomato',              'tomato',          'vegetable',  true),
  ('Potato',              'potato',          'vegetable',  true),
  ('Garlic',              'garlic',          'vegetable',  true),
  ('Ginger',              'ginger',          'vegetable',  true),
  ('Green chili',         'green-chili',     'vegetable',  true),
  ('Coriander leaves',    'coriander-leaves','vegetable',  true),
  ('Curry leaves',        'curry-leaves',    'vegetable',  false),
  ('Paneer',              'paneer',          'dairy',      false),
  ('Curd',                'curd',            'dairy',      true),
  ('Milk',                'milk',            'dairy',      true),
  ('Egg',                 'egg',             'protein',    false),
  ('Peanut',              'peanut',          'nut',        false),
  ('Cumin seeds',         'cumin-seeds',     'spice',      true),
  ('Mustard seeds',       'mustard-seeds',   'spice',      true),
  ('Turmeric',            'turmeric',        'spice',      true),
  ('Red chili powder',    'red-chili-powder','spice',      true),
  ('Coriander powder',    'coriander-powder','spice',      true),
  ('Salt',                'salt',            'spice',      true),
  ('Oil',                 'oil',             'fat',        true),
  ('Ghee',                'ghee',            'fat',        true),
  ('Sugar',               'sugar',           'pantry',     true),
  ('Jaggery',             'jaggery',         'pantry',     false)
on conflict (slug) do nothing;

-- ── Prices (per city tier; unpriced ingredients are treated as free by
-- budget.ts, so anything that can be a *missing* ingredient needs a row) ──

with p (slug, unit, metro_min, metro_max, t2_min, t2_max, t3_min, t3_max) as (
  values
    ('toor-dal',         '250g', 35, 45, 30, 40, 28, 36),
    ('moong-dal',        '250g', 32, 42, 28, 38, 26, 34),
    ('poha',              '250g', 20, 28, 18, 24, 16, 22),
    ('sooji',             '250g', 18, 24, 16, 22, 14, 20),
    ('chickpea',          '250g', 30, 40, 26, 36, 24, 32),
    ('onion',              '500g', 15, 25, 12, 20, 10, 18),
    ('tomato',             '500g', 18, 30, 15, 26, 12, 22),
    ('potato',             '500g', 12, 20, 10, 18, 8, 16),
    ('garlic',             '100g', 10, 18, 9, 16, 8, 14),
    ('ginger',             '100g', 10, 18, 9, 16, 8, 14),
    ('green-chili',        '100g', 6, 12, 5, 10, 5, 9),
    ('coriander-leaves',   '1 bunch', 8, 15, 7, 13, 6, 11),
    ('curry-leaves',       '1 bunch', 5, 10, 5, 9, 4, 8),
    ('paneer',             '200g', 60, 80, 55, 75, 50, 68),
    ('curd',               '400g', 25, 35, 22, 30, 20, 28),
    ('milk',               '500ml', 25, 32, 24, 30, 22, 28),
    ('egg',                '6 pc', 42, 54, 38, 48, 35, 45),
    ('peanut',             '250g', 28, 38, 25, 34, 22, 30),
    ('jaggery',            '250g', 22, 30, 20, 27, 18, 24)
)
insert into price_ranges (ingredient_id, city_tier, min_inr, max_inr, unit)
select i.id, tier.city_tier, tier.min_inr, tier.max_inr, p.unit
from p
join ingredients i on i.slug = p.slug
cross join lateral (
  values
    ('metro'::city_tier, p.metro_min, p.metro_max),
    ('tier_2'::city_tier, p.t2_min, p.t2_max),
    ('tier_3'::city_tier, p.t3_min, p.t3_max)
) as tier(city_tier, min_inr, max_inr)
on conflict (ingredient_id, city_tier) do nothing;

-- ── Recipes ──────────────────────────────────────────────────────────────

insert into recipes (name, description, steps, prep_minutes, serves, difficulty, region) values
  ('Jeera Dal Tadka',
   'A everyday toor dal finished with a cumin-garlic tadka — the dish most North Indian kitchens fall back on when the fridge is otherwise bare.',
   array['Pressure-cook the toor dal with turmeric and salt until soft, then mash lightly.',
         'Heat ghee in a small pan and crackle the cumin seeds.',
         'Add chopped garlic and green chili, fry until the garlic turns golden.',
         'Pour the tadka over the dal, stir in chopped tomato, and simmer 5 minutes.',
         'Finish with chopped coriander leaves and serve hot with rice.'],
   30, 2, 'easy', 'Punjabi'),
  ('Vegetable Pulao',
   'One-pot rice cooked with whatever vegetables are on hand, lifted by whole spices rather than a heavy gravy.',
   array['Heat oil in a pressure cooker and crackle cumin seeds.',
         'Add chopped onion and fry until translucent.',
         'Add chopped potato and tomato, cook 3 minutes.',
         'Stir in soaked rice, salt and turmeric, add water and pressure-cook for 2 whistles.',
         'Rest 5 minutes before opening, then fluff and serve.'],
   35, 3, 'easy', 'North Indian'),
  ('Spiced Poha',
   'Flattened rice tossed with mustard-seed tempering, peanuts and a squeeze of lime — a light, fast breakfast.',
   array['Rinse the poha in a colander until soft, then drain fully.',
         'Heat oil and crackle mustard seeds, then add curry leaves and chopped green chili.',
         'Add chopped onion and peanuts, fry until the onion softens.',
         'Add turmeric and the drained poha, toss gently to coat and heat through.',
         'Finish with chopped coriander leaves and serve warm.'],
   20, 2, 'easy', 'Maharashtrian'),
  ('Aloo Paratha',
   'Whole-wheat flatbread stuffed with spiced mashed potato, cooked on a tawa with ghee until both sides blister.',
   array['Boil and mash the potato with salt, red chili powder and chopped coriander leaves.',
         'Knead the wheat flour into a soft dough with water.',
         'Roll a portion of dough, place the potato filling inside, and seal.',
         'Roll the stuffed dough gently into a disc, dusting with flour as needed.',
         'Cook on a hot tawa with ghee until golden spots appear on both sides.'],
   40, 2, 'medium', 'Punjabi'),
  ('Besan Chilla',
   'A savoury gram-flour pancake spiked with onion and green chili — quick enough for a weekday evening snack.',
   array['Whisk chickpea flour with water, salt and turmeric into a smooth, pourable batter.',
         'Stir in finely chopped onion, tomato, green chili and coriander leaves.',
         'Heat a tawa with a little oil and pour a ladle of batter, spreading it thin.',
         'Cook until the edges lift and the underside browns, then flip.',
         'Cook the second side until golden and serve hot.'],
   20, 2, 'easy', 'Gujarati'),
  ('Paneer Bhurji',
   'Crumbled paneer scrambled with onion, tomato and everyday spices — a fast protein-forward dinner.',
   array['Heat oil in a pan and crackle cumin seeds.',
         'Add chopped onion and fry until soft, then add ginger and green chili.',
         'Add chopped tomato and cook until it breaks down.',
         'Add turmeric, red chili powder and crumbled paneer, and stir to combine.',
         'Cook 3-4 minutes, finish with coriander leaves, and serve with roti.'],
   20, 2, 'easy', 'North Indian'),
  ('Curd Rice',
   'Cooked rice folded into curd with a light tempering — cooling, no-cook-adjacent comfort food.',
   array['Mash cooked rice with milk until loose.',
         'Stir in curd and salt.',
         'Heat oil in a small pan and crackle mustard seeds and curry leaves.',
         'Add chopped green chili and pour the tempering over the rice.',
         'Mix gently and serve at room temperature.'],
   10, 2, 'easy', 'South Indian'),
  ('Masala Omelette',
   'A fast, spiced take on the everyday omelette, chopped fine so onion and chili turn up in every bite.',
   array['Whisk eggs with salt, turmeric and red chili powder.',
         'Stir in finely chopped onion, tomato, green chili and coriander leaves.',
         'Heat oil on a tawa and pour the egg mixture, spreading it evenly.',
         'Cook until the underside sets, then flip and cook through.',
         'Serve hot with toast or roti.'],
   12, 1, 'easy', 'North Indian'),
  ('Sooji Halwa',
   'Roasted semolina cooked into a soft, ghee-rich sweet — the go-to festive-morning dessert.',
   array['Roast the sooji in ghee on low heat until fragrant and lightly golden.',
         'In a separate pan, warm milk with sugar until the sugar dissolves.',
         'Pour the warm milk slowly into the roasted sooji, stirring constantly to avoid lumps.',
         'Cook until the mixture thickens and pulls away from the sides of the pan.',
         'Finish with a spoon of ghee and serve warm.'],
   15, 2, 'easy', 'North Indian'),
  ('Chana Masala',
   'Chickpeas simmered in an onion-tomato masala — a hearty, budget-friendly dinner staple.',
   array['Pressure-cook the chickpeas with salt until tender.',
         'Heat oil and crackle cumin seeds, then add chopped onion and fry until golden.',
         'Add ginger, garlic and chopped tomato, and cook until the oil separates.',
         'Stir in turmeric, coriander powder and red chili powder, then add the cooked chickpeas with their liquid.',
         'Simmer 10 minutes and finish with chopped coriander leaves.'],
   45, 3, 'medium', 'North Indian')
on conflict do nothing;

-- ── Recipe ingredients ───────────────────────────────────────────────────

insert into recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional)
select r.id, i.id, v.quantity, v.unit, v.is_optional
from (values
  ('Jeera Dal Tadka', 'toor-dal', '1', 'cup', false),
  ('Jeera Dal Tadka', 'turmeric', '1/2', 'tsp', false),
  ('Jeera Dal Tadka', 'salt', 'to taste', null, false),
  ('Jeera Dal Tadka', 'ghee', '2', 'tbsp', false),
  ('Jeera Dal Tadka', 'cumin-seeds', '1', 'tsp', false),
  ('Jeera Dal Tadka', 'garlic', '4', 'cloves', false),
  ('Jeera Dal Tadka', 'green-chili', '1', 'pc', true),
  ('Jeera Dal Tadka', 'tomato', '1', 'pc', false),
  ('Jeera Dal Tadka', 'coriander-leaves', 'a few sprigs', null, true),

  ('Vegetable Pulao', 'rice', '1.5', 'cups', false),
  ('Vegetable Pulao', 'oil', '2', 'tbsp', false),
  ('Vegetable Pulao', 'cumin-seeds', '1', 'tsp', false),
  ('Vegetable Pulao', 'onion', '1', 'pc', false),
  ('Vegetable Pulao', 'potato', '1', 'pc', false),
  ('Vegetable Pulao', 'tomato', '1', 'pc', false),
  ('Vegetable Pulao', 'turmeric', '1/2', 'tsp', false),
  ('Vegetable Pulao', 'salt', 'to taste', null, false),

  ('Spiced Poha', 'poha', '2', 'cups', false),
  ('Spiced Poha', 'oil', '2', 'tbsp', false),
  ('Spiced Poha', 'mustard-seeds', '1', 'tsp', false),
  ('Spiced Poha', 'curry-leaves', '8', 'leaves', true),
  ('Spiced Poha', 'green-chili', '1', 'pc', false),
  ('Spiced Poha', 'onion', '1', 'pc', false),
  ('Spiced Poha', 'peanut', '2', 'tbsp', true),
  ('Spiced Poha', 'turmeric', '1/4', 'tsp', false),
  ('Spiced Poha', 'coriander-leaves', 'a few sprigs', null, true),

  ('Aloo Paratha', 'potato', '2', 'pc', false),
  ('Aloo Paratha', 'salt', 'to taste', null, false),
  ('Aloo Paratha', 'red-chili-powder', '1/2', 'tsp', false),
  ('Aloo Paratha', 'coriander-leaves', 'a few sprigs', null, true),
  ('Aloo Paratha', 'wheat-flour', '2', 'cups', false),
  ('Aloo Paratha', 'ghee', '2', 'tbsp', false),

  ('Besan Chilla', 'chickpea', '1', 'cup', false),
  ('Besan Chilla', 'salt', 'to taste', null, false),
  ('Besan Chilla', 'turmeric', '1/4', 'tsp', false),
  ('Besan Chilla', 'onion', '1', 'pc', false),
  ('Besan Chilla', 'tomato', '1', 'pc', true),
  ('Besan Chilla', 'green-chili', '1', 'pc', true),
  ('Besan Chilla', 'coriander-leaves', 'a few sprigs', null, true),
  ('Besan Chilla', 'oil', '1', 'tbsp', false),

  ('Paneer Bhurji', 'oil', '2', 'tbsp', false),
  ('Paneer Bhurji', 'cumin-seeds', '1', 'tsp', false),
  ('Paneer Bhurji', 'onion', '1', 'pc', false),
  ('Paneer Bhurji', 'ginger', '1', 'tsp', true),
  ('Paneer Bhurji', 'green-chili', '1', 'pc', true),
  ('Paneer Bhurji', 'tomato', '1', 'pc', false),
  ('Paneer Bhurji', 'turmeric', '1/4', 'tsp', false),
  ('Paneer Bhurji', 'red-chili-powder', '1/2', 'tsp', false),
  ('Paneer Bhurji', 'paneer', '200', 'g', false),
  ('Paneer Bhurji', 'coriander-leaves', 'a few sprigs', null, true),

  ('Curd Rice', 'rice', '1', 'cup', false),
  ('Curd Rice', 'milk', '1/4', 'cup', true),
  ('Curd Rice', 'curd', '1', 'cup', false),
  ('Curd Rice', 'salt', 'to taste', null, false),
  ('Curd Rice', 'oil', '1', 'tsp', false),
  ('Curd Rice', 'mustard-seeds', '1/2', 'tsp', false),
  ('Curd Rice', 'curry-leaves', '6', 'leaves', true),
  ('Curd Rice', 'green-chili', '1', 'pc', true),

  ('Masala Omelette', 'egg', '2', 'pc', false),
  ('Masala Omelette', 'salt', 'to taste', null, false),
  ('Masala Omelette', 'turmeric', 'a pinch', null, true),
  ('Masala Omelette', 'red-chili-powder', 'a pinch', null, true),
  ('Masala Omelette', 'onion', '1/2', 'pc', false),
  ('Masala Omelette', 'tomato', '1/2', 'pc', true),
  ('Masala Omelette', 'green-chili', '1', 'pc', true),
  ('Masala Omelette', 'coriander-leaves', 'a few sprigs', null, true),
  ('Masala Omelette', 'oil', '1', 'tsp', false),

  ('Sooji Halwa', 'sooji', '1', 'cup', false),
  ('Sooji Halwa', 'ghee', '3', 'tbsp', false),
  ('Sooji Halwa', 'milk', '2', 'cups', false),
  ('Sooji Halwa', 'sugar', '3/4', 'cup', false),

  ('Chana Masala', 'chickpea', '1.5', 'cups', false),
  ('Chana Masala', 'salt', 'to taste', null, false),
  ('Chana Masala', 'oil', '2', 'tbsp', false),
  ('Chana Masala', 'cumin-seeds', '1', 'tsp', false),
  ('Chana Masala', 'onion', '1', 'pc', false),
  ('Chana Masala', 'ginger', '1', 'tsp', false),
  ('Chana Masala', 'garlic', '4', 'cloves', false),
  ('Chana Masala', 'tomato', '2', 'pc', false),
  ('Chana Masala', 'turmeric', '1/2', 'tsp', false),
  ('Chana Masala', 'coriander-powder', '1', 'tsp', false),
  ('Chana Masala', 'red-chili-powder', '1/2', 'tsp', false),
  ('Chana Masala', 'coriander-leaves', 'a few sprigs', null, true)
) as v(recipe_name, ingredient_slug, quantity, unit, is_optional)
join recipes r on r.name = v.recipe_name
join ingredients i on i.slug = v.ingredient_slug
on conflict (recipe_id, ingredient_id) do nothing;

-- ── Recipe appliances ────────────────────────────────────────────────────

insert into recipe_appliances (recipe_id, appliance_id)
select r.id, a.id
from (values
  ('Jeera Dal Tadka', 'pressure-cooker'), ('Jeera Dal Tadka', 'gas-stove'),
  ('Vegetable Pulao', 'pressure-cooker'), ('Vegetable Pulao', 'gas-stove'),
  ('Spiced Poha', 'gas-stove'),
  ('Aloo Paratha', 'tawa'), ('Aloo Paratha', 'gas-stove'),
  ('Besan Chilla', 'tawa'), ('Besan Chilla', 'gas-stove'),
  ('Paneer Bhurji', 'gas-stove'),
  ('Masala Omelette', 'tawa'), ('Masala Omelette', 'gas-stove'),
  ('Sooji Halwa', 'gas-stove'),
  ('Chana Masala', 'pressure-cooker'), ('Chana Masala', 'gas-stove')
) as v(recipe_name, appliance_slug)
join recipes r on r.name = v.recipe_name
join appliances a on a.slug = v.appliance_slug
on conflict (recipe_id, appliance_id) do nothing;

-- ── Recipe meal types ────────────────────────────────────────────────────

insert into recipe_meal_types (recipe_id, meal_type)
select r.id, v.meal_type
from (values
  ('Jeera Dal Tadka', 'lunch'::meal_type), ('Jeera Dal Tadka', 'dinner'::meal_type),
  ('Vegetable Pulao', 'lunch'::meal_type), ('Vegetable Pulao', 'dinner'::meal_type),
  ('Spiced Poha', 'breakfast'::meal_type), ('Spiced Poha', 'morning_snack'::meal_type),
  ('Aloo Paratha', 'breakfast'::meal_type),
  ('Besan Chilla', 'breakfast'::meal_type), ('Besan Chilla', 'evening_snack'::meal_type),
  ('Paneer Bhurji', 'lunch'::meal_type), ('Paneer Bhurji', 'dinner'::meal_type), ('Paneer Bhurji', 'fancy'::meal_type),
  ('Curd Rice', 'lunch'::meal_type), ('Curd Rice', 'light'::meal_type),
  ('Masala Omelette', 'breakfast'::meal_type), ('Masala Omelette', 'morning_snack'::meal_type),
  ('Sooji Halwa', 'evening_snack'::meal_type), ('Sooji Halwa', 'child_specific'::meal_type),
  ('Chana Masala', 'lunch'::meal_type), ('Chana Masala', 'dinner'::meal_type)
) as v(recipe_name, meal_type)
join recipes r on r.name = v.recipe_name
on conflict (recipe_id, meal_type) do nothing;

-- ── Recipe dietary tags ──────────────────────────────────────────────────

insert into recipe_dietary_tags (recipe_id, dietary_tag_id)
select r.id, dt.id
from (values
  ('Jeera Dal Tadka', 'vegetarian'), ('Jeera Dal Tadka', 'vegan'),
  ('Vegetable Pulao', 'vegetarian'), ('Vegetable Pulao', 'vegan'), ('Vegetable Pulao', 'jain'),
  ('Spiced Poha', 'vegetarian'), ('Spiced Poha', 'vegan'),
  ('Aloo Paratha', 'vegetarian'), ('Aloo Paratha', 'vegan'),
  ('Besan Chilla', 'vegetarian'), ('Besan Chilla', 'vegan'), ('Besan Chilla', 'jain'),
  ('Paneer Bhurji', 'vegetarian'),
  ('Curd Rice', 'vegetarian'),
  ('Masala Omelette', 'eggetarian'), ('Masala Omelette', 'non_vegetarian'),
  ('Sooji Halwa', 'vegetarian'),
  ('Chana Masala', 'vegetarian'), ('Chana Masala', 'vegan')
) as v(recipe_name, dietary_slug)
join recipes r on r.name = v.recipe_name
join dietary_tags dt on dt.slug = v.dietary_slug
on conflict (recipe_id, dietary_tag_id) do nothing;
