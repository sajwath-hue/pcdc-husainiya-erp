import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '@/supabase/data';
import { EmptyState } from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/constants/theme';
import type { EventItem } from '@/types';

export default function EventsListScreen() {
  const { data: events, loading } = useCollection<EventItem>('husainiya_events');

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No events scheduled"
            subtitle="Tap the + button to create an event."
          />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/(app)/events/${item.id}`)}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{item.date?.slice(8, 10) ?? '--'}</Text>
              <Text style={styles.dateBadgeMonth}>
                {item.date ? monthShort(item.date) : ''}
              </Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.location}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(app)/events/add')}>
        <Ionicons name="add" size={26} color="#0B1120" />
      </Pressable>
    </View>
  );
}

function monthShort(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short' });
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
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  dateBadgeMonth: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase' },
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
