import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({ label, onPress, disabled, loading, variant = 'primary' }: Props) {
  const { colors, typography, radii, touchTarget } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.root,
        {
          height: touchTarget.primaryButtonHeight,
          borderRadius: radii.button,
          backgroundColor: isPrimary ? colors.primary : colors.surface,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: colors.divider,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[typography.button, { color: isPrimary ? colors.onPrimary : colors.textPrimary }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
