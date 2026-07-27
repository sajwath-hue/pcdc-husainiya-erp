import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
};

export function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'danger' && styles.danger,
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#0B1120'} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: { backgroundColor: colors.danger },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { color: '#0B1120', fontWeight: '700', fontSize: 15 },
  outlineText: { color: colors.primary },
});
