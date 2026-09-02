import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

/**
 * The shared empty state. Every tab lands on one of these rather than a blank
 * screen — empty states are a P0 acceptance criterion, not polish (Rules.md
 * #13, PRD §7).
 */
export function EmptyState({ icon, title, body }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.root, { padding: spacing.xxxl, backgroundColor: colors.canvas }]}>
      <Ionicons name={icon} size={40} color={colors.textTertiary} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 320 },
});
