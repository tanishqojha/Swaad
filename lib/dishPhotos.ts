import type { ImageSourcePropType } from 'react-native';

/**
 * Optional recipe photography, extracted from the Stitch project's mockup
 * screens (assets/stitch/dishes/ — the full set Stitch generated, most of
 * which don't correspond to a seeded recipe yet). Metro requires static
 * paths, so this is a hand-maintained lookup rather than a dynamic import;
 * add an entry here as recipe photos are sourced for more dishes.
 *
 * Photos are enrichment only (Design.md §7 — "never load-bearing"): a
 * recipe with no entry here just renders without one.
 */
export const DISH_PHOTOS: Record<string, ImageSourcePropType> = {
  'Jeera Dal Tadka': require('../assets/stitch/dishes/steaming-golden-jeera-dal-tadka-in.jpg'),
  'Kadai Paneer': require('../assets/stitch/dishes/rich-and-colorful-kadai-paneer-in.jpg'),
  'Aloo Gobi': require('../assets/stitch/dishes/golden-spiced-aloo-gobi-subzi-served.jpg'),
  'Baingan Bharta': require('../assets/stitch/dishes/rustic-flame-roasted-baingan-bharta-mashed.jpg'),
  'Gujarati Masala Khichdi': require('../assets/stitch/dishes/steaming-bowl-of-wholesome-gujarati-masala.jpg'),
  'Spiced Poha': require('../assets/stitch/dishes/golden-crisp-roasted-indian-poha-chivda.jpg'),
  'Vegetable Pulao': require('../assets/stitch/dishes/fluffy-long-grain-indian-basmati-rice.jpg'),
};

export function dishPhoto(recipeName: string): ImageSourcePropType | undefined {
  return DISH_PHOTOS[recipeName];
}
