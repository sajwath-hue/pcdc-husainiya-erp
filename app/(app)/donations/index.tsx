import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '@/supabase/data';
import { EmptyState } from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/constants/theme';
import type { Donation } from '@/types';

export default function DonationsListScreen() {
  const { data: donations, loading } = useCollection<Donation>('husainiya_donations');

  if (loading) return <LoadingScreen />;

  const total = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          donations.length ? (
            <Text style={styles.total}>Total collected: AED {total.toLocaleString()}</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash-outline"
            title="No donations recorded"
            subtitle="Tap the + button to log a donation."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(app)/donations/${item.id}`)}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{item.donorName}</Text>
              <Text style={styles.rowSubtitle}>
                {item.purpose} · {item.paymentMethod} · {item.date}
              </Text>
            </View>
            <Text style={styles.amount}>AED {Number(item.amount).toLocaleString()}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(app)/donations/add')}>
        <Ionicons name="add" size={26} color="#0B1120" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, flexGrow: 1 },
  total: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBody: { flex: 1, paddingRight: 8 },
  rowTitle: { color: colors.text, fontWeight: '600', fontSize: 15 },
  rowSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  amount: { color: colors.success, fontWeight: '700', fontSize: 14 },
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
