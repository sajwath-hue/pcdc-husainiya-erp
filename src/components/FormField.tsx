import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: colors.textMuted, marginBottom: 6, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  error: { color: colors.danger, marginTop: 4, fontSize: 12 },
});
