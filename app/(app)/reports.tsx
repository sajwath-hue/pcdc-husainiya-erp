import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '@/supabase/data';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/constants/theme';
import type { Donation, EventItem, Member } from '@/types';

export default function ReportsScreen() {
  const { data: members, loading: loadingMembers } = useCollection<Member>('husainiya_members');
  const { data: donations, loading: loadingDonations } = useCollection<Donation>('husainiya_donations');
  const { data: events, loading: loadingEvents } = useCollection<EventItem>('husainiya_events');

  if (loadingMembers || loadingDonations || loadingEvents) return <LoadingScreen />;

  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const totalDonations = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter((e) => e.date >= today).length;

  const byPaymentMethod = donations.reduce<Record<string, number>>((acc, d) => {
    acc[d.paymentMethod] = (acc[d.paymentMethod] ?? 0) + d.amount;
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.summaryGrid}>
        <SummaryTile icon="people" label="Total members" value={String(members.length)} />
        <SummaryTile icon="checkmark-circle" label="Active members" value={String(activeMembers)} />
        <SummaryTile icon="cash" label="Total donations" value={`AED ${totalDonations.toLocaleString()}`} />
        <SummaryTile icon="calendar" label="Upcoming events" value={String(upcomingEvents)} />
      </View>

      <Text style={styles.sectionTitle}>Donations by payment method</Text>
      <View style={styles.list}>
        {Object.keys(byPaymentMethod).length === 0 ? (
          <Text style={styles.emptyText}>No donations recorded yet.</Text>
        ) : (
          Object.entries(byPaymentMethod).map(([method, amount]) => (
            <View key={method} style={styles.listRow}>
              <Text style={styles.listLabel}>{method}</Text>
              <Text style={styles.listValue}>AED {amount.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12 },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tileValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  tileLabel: { color: colors.textMuted, fontSize: 12 },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listLabel: { color: colors.text, fontSize: 14 },
  listValue: { color: colors.success, fontWeight: '700', fontSize: 14 },
  emptyText: { color: colors.textMuted, padding: 16, textAlign: 'center' },
});
