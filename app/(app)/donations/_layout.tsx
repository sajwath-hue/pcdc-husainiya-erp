import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function DonationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Donations' }} />
      <Stack.Screen name="add" options={{ title: 'Add Donation', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Donation' }} />
    </Stack>
  );
}
