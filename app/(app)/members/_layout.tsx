import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MembersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Members' }} />
      <Stack.Screen name="add" options={{ title: 'Add Member', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Member' }} />
    </Stack>
  );
}
