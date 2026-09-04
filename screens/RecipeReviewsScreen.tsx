import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/lib/auth';
import { addReview, fetchReviews, type Review } from '@/lib/reviewsRepo';
import type { HomeStackParamList } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'RecipeReviews'>;

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= rating ? 'star' : 'star-outline'} size={size} color={colors.gold} />
      ))}
    </View>
  );
}

/** Community reviews and tips for a recipe — overrides PRD §3's non-goal on social features, at the user's request. */
export function RecipeReviewsScreen({ route, navigation }: Props) {
  const { recipe } = route.params;
  const { colors, typography, spacing, radii, hairline } = useTheme();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews(recipe.id)
      .then(setReviews)
      .catch(() => setError(true));
  }, [recipe.id]);

  async function submit() {
    if (!user || !body.trim()) return;
    setSubmitting(true);
    try {
      await addReview(recipe.id, user.id, rating, body.trim());
      setBody('');
      setReviews(await fetchReviews(recipe.id));
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.canvas }} contentContainerStyle={{ padding: spacing.screenInset, paddingBottom: spacing.huge }}>
      <Text style={[typography.screenTitle, { color: colors.textPrimary }]}>{recipe.name}</Text>
      <Text style={[typography.sectionHeader, { color: colors.textPrimary, marginTop: spacing.xxl, marginBottom: spacing.md }]}>
        Reviews &amp; tips
      </Text>

      {user ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.xxl }}>
          <Pressable style={{ flexDirection: 'row', marginBottom: spacing.md }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={4}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={24} color={colors.gold} style={{ marginRight: 4 }} />
              </Pressable>
            ))}
          </Pressable>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Share a tip — what worked, what you'd change"
            placeholderTextColor={colors.textTertiary}
            multiline
            style={[
              typography.body,
              { color: colors.textPrimary, backgroundColor: colors.surfaceDeep, borderRadius: radii.button, padding: spacing.md, minHeight: 70, textAlignVertical: 'top' },
            ]}
          />
          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton label="Post review" onPress={submit} loading={submitting} disabled={!body.trim()} />
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => navigation.navigate('SignIn')}
          style={{ borderWidth: hairline.chipBorder, borderColor: colors.divider, borderRadius: radii.button, padding: spacing.lg, marginBottom: spacing.xxl, alignItems: 'center' }}
        >
          <Text style={[typography.body, { color: colors.primary }]}>Sign in to leave a review</Text>
        </Pressable>
      )}

      {error && (
        <Text style={[typography.body, { color: colors.error }]}>Couldn't load reviews. Check your connection.</Text>
      )}

      {reviews === null && !error && <ActivityIndicator color={colors.primary} />}

      {reviews !== null && reviews.length === 0 && (
        <Text style={[typography.body, { color: colors.textSecondary }]}>No reviews yet — be the first to share a tip.</Text>
      )}

      {reviews?.map((review) => (
        <View key={review.id} style={{ borderBottomColor: colors.divider, borderBottomWidth: hairline.divider, paddingVertical: spacing.md }}>
          <Stars rating={review.rating} />
          <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.xs }]}>{review.body}</Text>
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.xs }]}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
