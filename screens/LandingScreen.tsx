import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Landing'>;

/** A taste of what the input flow can turn up, using the actual dish photography from the Stitch landing screen. */
const PREVIEW_DISHES = [
  { name: 'Jeera Dal Tadka', photo: require('../assets/stitch/dishes/a-comforting-bowl-of-hot-homestyle.jpg') },
  { name: 'Kadai Paneer', photo: require('../assets/stitch/dishes/rich-kadai-paneer-curry-simmered-in.jpg') },
  { name: 'Aloo Gobi', photo: require('../assets/stitch/dishes/golden-spiced-aloo-gobi-subzi-served.jpg') },
  { name: 'Spiced Poha', photo: require('../assets/stitch/dishes/crispy-roasted-beaten-rice-poha-chivda.jpg') },
];

/**
 * The app's front door (Stitch's "Dish Discovery & Start Cooking Landing").
 * Everything past this screen is the input flow (PRD §5); this one is just
 * the welcome + entry point, pushed once per cold start onto the Home stack.
 */
export function LandingScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, padding: spacing.screenInset, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xxxl }}>
          <Logo height={36} />
        </View>

        <View style={styles.previewGrid}>
          {PREVIEW_DISHES.map((dish) => (
            <View key={dish.name} style={[styles.previewTile, elevation.raised, { borderRadius: radii.card }]}>
              <Image source={dish.photo} style={[styles.previewImage, { borderRadius: radii.card }]} />
              <Text style={[typography.caption, { color: colors.textPrimary, marginTop: spacing.xs }]} numberOfLines={1}>
                {dish.name}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[typography.screenTitle, { color: colors.textPrimary, marginTop: spacing.xxxl, textAlign: 'center' }]}>
          Cook what you have.{'\n'}Spend what you plan.
        </Text>
        <Text
          style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xxxl }]}
        >
          Tell Swaad your ingredients, appliances and budget, and it finds 2 to 3 Indian dishes you can actually cook tonight.
        </Text>

        <PrimaryButton label="Start cooking" onPress={() => navigation.navigate('KitchenInput')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  previewTile: { width: '48%', marginBottom: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: 90 },
});
