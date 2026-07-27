import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useCollection } from '@/firebase/firestore';
import { colors } from '@/constants/theme';
import type { Donation, EventItem, Member } from '@/types';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { data: members } = useCollection<Member>('members');
  const { data: donations } = useCollection<Donation>('donations');
  const { data: events } = useCollection<EventItem>('events');

  const totalDonations = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const cards = [
    {
      label: 'Members',
      value: String(members.length),
      icon: 'people' as const,
      route: '/(app)/members' as const,
    },
    {
      label: 'Donations',
      value: `AED ${totalDonations.toLocaleString()}`,
      icon: 'cash' as const,
      route: '/(app)/donations' as const,
    },
    {
      label: 'Events',
      value: String(events.length),
      icon: 'calendar' as const,
      route: '/(app)/events' as const,
    },
    {
      label: 'Reports',
      value: 'View',
      icon: 'bar-chart' as const,
      route: '/(app)/reports' as const,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={18} color={colors.text} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable
            key={card.label}
            style={styles.card}
            onPress={() => router.push(card.route)}
          >
            <Ionicons name={card.icon} size={22} color={colors.primary} />
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  welcome: { color: colors.textMuted, fontSize: 13 },
  email: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardValue: { color: colors.text, fontSize: 20, fontWeight: '700' },
  cardLabel: { color: colors.textMuted, fontSize: 13 },
});
