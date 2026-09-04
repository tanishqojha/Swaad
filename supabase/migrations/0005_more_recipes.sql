-- Four more recipes, added so the dish photography extracted from the
-- Stitch project (assets/stitch/dishes/, lib/dishPhotos.ts) has a real
-- recipe to attach to instead of sitting unused. Same "sample set, not the
-- full ~150-200 database" caveat as 0003_sample_recipes.sql.

insert into ingredients (name, slug, category, is_staple) values
  ('Bell pepper (capsicum)', 'bell-pepper', 'vegetable', false),
  ('Brinjal (eggplant)',     'brinjal',     'vegetable', false),
  ('Green peas',             'green-peas',  'vegetable', false),
  ('Cauliflower',            'cauliflower', 'vegetable', false),
  ('Carrot',                 'carrot',      'vegetable', false),
  ('Cloves',                 'cloves',      'spice',     false),
  ('Bay leaf',               'bay-leaf',    'spice',     false),
  ('Green cardamom',         'green-cardamom', 'spice',  false)
on conflict (slug) do nothing;

with p (slug, unit, metro_min, metro_max, t2_min, t2_max, t3_min, t3_max) as (
  values
    ('bell-pepper', '250g', 30, 40, 26, 36, 24, 32),
    ('brinjal',     '500g', 20, 30, 18, 26, 16, 22),
    ('green-peas',  '250g', 25, 35, 22, 30, 20, 28),
    ('cauliflower', '1 pc', 25, 35, 22, 30, 20, 28),
    ('carrot',      '500g', 18, 26, 16, 24, 14, 20),
    ('cloves',      '20g',  15, 22, 13, 20, 12, 18),
    ('bay-leaf',    '10g',  8, 14, 7, 12, 6, 10),
    ('green-cardamom', '20g', 30, 45, 27, 40, 24, 36)
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

insert into recipes (name, description, steps, prep_minutes, serves, difficulty, region) values
  ('Kadai Paneer',
   'Paneer and bell peppers tossed through a coarsely ground kadai masala — a restaurant-style dinner that comes together in one wok.',
   array['Dry-roast coriander seeds and red chili, then grind coarsely for the kadai masala.',
         'Heat oil in a kadai and fry chopped onion until golden.',
         'Add ginger, garlic and chopped tomato, cooking until the oil separates.',
         'Stir in the ground masala, then add chopped bell pepper and cook until just tender.',
         'Fold in cubed paneer, simmer 3 minutes, and finish with coriander leaves.'],
   30, 3, 'medium', 'North Indian'),
  ('Aloo Gobi',
   'Cauliflower and potato dry-tossed with turmeric and ginger until lightly charred at the edges.',
   array['Heat oil in a pan and add cumin seeds until they crackle.',
         'Add chopped potato and cauliflower florets, tossing to coat in oil.',
         'Add turmeric, salt and julienned ginger, then cover and cook on low heat, stirring occasionally.',
         'Uncover once the vegetables are tender and let them catch lightly at the edges.',
         'Finish with chopped green chili and coriander leaves.'],
   30, 3, 'easy', 'Punjabi'),
  ('Baingan Bharta',
   'Fire-roasted eggplant mashed and cooked down with onion, tomato and green peas into a smoky, spoonable curry.',
   array['Char the whole brinjal directly over a flame or under a grill until the skin blisters and the flesh softens.',
         'Peel the brinjal once cool enough to handle and mash the flesh.',
         'Heat oil and fry chopped onion until golden, then add ginger, garlic and green chili.',
         'Add chopped tomato and green peas, cooking until the tomato breaks down.',
         'Fold in the mashed brinjal, season, and simmer 5 minutes before finishing with coriander leaves.'],
   40, 3, 'medium', 'North Indian'),
  ('Gujarati Masala Khichdi',
   'Rice and moong dal simmered together with carrot and whole spices into a one-pot, ghee-finished comfort meal.',
   array['Rinse the rice and moong dal together, then drain.',
         'Heat ghee in a pressure cooker and temper cloves, bay leaf and green cardamom.',
         'Add chopped carrot and green peas, stirring briefly.',
         'Add the rice and dal along with turmeric and salt, then water, and pressure-cook for 3 whistles.',
         'Rest before opening, then serve with a spoon of ghee on top.'],
   35, 3, 'easy', 'Gujarati')
on conflict do nothing;

insert into recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional)
select r.id, i.id, v.quantity, v.unit, v.is_optional
from (values
  ('Kadai Paneer', 'coriander-powder', '1', 'tbsp', false),
  ('Kadai Paneer', 'red-chili-powder', '1/2', 'tsp', false),
  ('Kadai Paneer', 'oil', '2', 'tbsp', false),
  ('Kadai Paneer', 'onion', '1', 'pc', false),
  ('Kadai Paneer', 'ginger', '1', 'tsp', false),
  ('Kadai Paneer', 'garlic', '4', 'cloves', false),
  ('Kadai Paneer', 'tomato', '2', 'pc', false),
  ('Kadai Paneer', 'bell-pepper', '1', 'pc', false),
  ('Kadai Paneer', 'paneer', '200', 'g', false),
  ('Kadai Paneer', 'coriander-leaves', 'a few sprigs', null, true),

  ('Aloo Gobi', 'oil', '2', 'tbsp', false),
  ('Aloo Gobi', 'cumin-seeds', '1', 'tsp', false),
  ('Aloo Gobi', 'potato', '2', 'pc', false),
  ('Aloo Gobi', 'cauliflower', '1', 'pc', false),
  ('Aloo Gobi', 'turmeric', '1/2', 'tsp', false),
  ('Aloo Gobi', 'salt', 'to taste', null, false),
  ('Aloo Gobi', 'ginger', '1', 'tsp', true),
  ('Aloo Gobi', 'green-chili', '1', 'pc', true),
  ('Aloo Gobi', 'coriander-leaves', 'a few sprigs', null, true),

  ('Baingan Bharta', 'brinjal', '1', 'pc', false),
  ('Baingan Bharta', 'oil', '2', 'tbsp', false),
  ('Baingan Bharta', 'onion', '1', 'pc', false),
  ('Baingan Bharta', 'ginger', '1', 'tsp', false),
  ('Baingan Bharta', 'garlic', '3', 'cloves', false),
  ('Baingan Bharta', 'green-chili', '1', 'pc', true),
  ('Baingan Bharta', 'tomato', '2', 'pc', false),
  ('Baingan Bharta', 'green-peas', '1/2', 'cup', true),
  ('Baingan Bharta', 'salt', 'to taste', null, false),
  ('Baingan Bharta', 'coriander-leaves', 'a few sprigs', null, true),

  ('Gujarati Masala Khichdi', 'rice', '1/2', 'cup', false),
  ('Gujarati Masala Khichdi', 'moong-dal', '1/2', 'cup', false),
  ('Gujarati Masala Khichdi', 'ghee', '2', 'tbsp', false),
  ('Gujarati Masala Khichdi', 'cloves', '2', 'pc', true),
  ('Gujarati Masala Khichdi', 'bay-leaf', '1', 'pc', true),
  ('Gujarati Masala Khichdi', 'green-cardamom', '2', 'pods', true),
  ('Gujarati Masala Khichdi', 'carrot', '1', 'pc', true),
  ('Gujarati Masala Khichdi', 'green-peas', '1/4', 'cup', true),
  ('Gujarati Masala Khichdi', 'turmeric', '1/2', 'tsp', false),
  ('Gujarati Masala Khichdi', 'salt', 'to taste', null, false)
) as v(recipe_name, ingredient_slug, quantity, unit, is_optional)
join recipes r on r.name = v.recipe_name
join ingredients i on i.slug = v.ingredient_slug
on conflict (recipe_id, ingredient_id) do nothing;

insert into recipe_appliances (recipe_id, appliance_id)
select r.id, a.id
from (values
  ('Kadai Paneer', 'gas-stove'),
  ('Aloo Gobi', 'gas-stove'),
  ('Baingan Bharta', 'gas-stove'),
  ('Gujarati Masala Khichdi', 'pressure-cooker'), ('Gujarati Masala Khichdi', 'gas-stove')
) as v(recipe_name, appliance_slug)
join recipes r on r.name = v.recipe_name
join appliances a on a.slug = v.appliance_slug
on conflict (recipe_id, appliance_id) do nothing;

insert into recipe_meal_types (recipe_id, meal_type)
select r.id, v.meal_type
from (values
  ('Kadai Paneer', 'lunch'::meal_type), ('Kadai Paneer', 'dinner'::meal_type), ('Kadai Paneer', 'fancy'::meal_type),
  ('Aloo Gobi', 'lunch'::meal_type), ('Aloo Gobi', 'dinner'::meal_type),
  ('Baingan Bharta', 'lunch'::meal_type), ('Baingan Bharta', 'dinner'::meal_type),
  ('Gujarati Masala Khichdi', 'lunch'::meal_type), ('Gujarati Masala Khichdi', 'dinner'::meal_type), ('Gujarati Masala Khichdi', 'light'::meal_type)
) as v(recipe_name, meal_type)
join recipes r on r.name = v.recipe_name
on conflict (recipe_id, meal_type) do nothing;

insert into recipe_dietary_tags (recipe_id, dietary_tag_id)
select r.id, dt.id
from (values
  ('Kadai Paneer', 'vegetarian'),
  ('Aloo Gobi', 'vegetarian'), ('Aloo Gobi', 'vegan'), ('Aloo Gobi', 'jain'),
  ('Baingan Bharta', 'vegetarian'), ('Baingan Bharta', 'vegan'),
  ('Gujarati Masala Khichdi', 'vegetarian'), ('Gujarati Masala Khichdi', 'vegan')
) as v(recipe_name, dietary_slug)
join recipes r on r.name = v.recipe_name
join dietary_tags dt on dt.slug = v.dietary_slug
on conflict (recipe_id, dietary_tag_id) do nothing;
