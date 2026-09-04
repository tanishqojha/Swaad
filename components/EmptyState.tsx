import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTheme } from '@/theme/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * The shared empty state. Every tab lands on one of these rather than a blank
 * screen — empty states are a P0 acceptance criterion, not polish (Rules.md
 * #13, PRD §7). `actionLabel`/`onAction` are optional so a screen can offer a
 * next step (retry, sign in) without composing its own layout around this.
 */
export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.root, { padding: spacing.xxxl, backgroundColor: colors.canvas }]}>
      <View style={[styles.badge, { backgroundColor: colors.primaryTint }]}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text
        style={[
          typography.screenTitle,
          styles.title,
          { color: colors.textPrimary, marginTop: spacing.xl },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          typography.body,
          styles.body,
          { color: colors.textSecondary, marginTop: spacing.md },
        ]}
      >
        {body}
      </Text>
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.xl, width: '100%', maxWidth: 280 }}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 320 },
});
