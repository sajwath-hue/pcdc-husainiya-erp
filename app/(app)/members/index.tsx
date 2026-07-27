import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '@/firebase/firestore';
import { EmptyState } from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/constants/theme';
import type { Member } from '@/types';

export default function MembersListScreen() {
  const { data: members, loading } = useCollection<Member>('members');

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No members yet"
            subtitle="Tap the + button to add your first member."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(app)/members/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.fullName?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{item.fullName}</Text>
              <Text style={styles.rowSubtitle}>
                {item.phone} · {item.membershipType}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(app)/members/add')}>
        <Ionicons name="add" size={26} color="#0B1120" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '700' },
  rowBody: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '600', fontSize: 15 },
  rowSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
