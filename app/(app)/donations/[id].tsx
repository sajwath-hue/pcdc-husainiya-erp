import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteDocument, updateDocument, useDocument } from '@/supabase/data';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/theme';
import type { Donation } from '@/types';

export default function DonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: donation, loading } = useDocument<Donation>('husainiya_donations', id);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<Partial<Donation>>({});

  if (loading) return <LoadingScreen />;
  if (!donation) {
    return <EmptyState icon="alert-circle-outline" title="Donation not found" />;
  }

  const donorName = draft.donorName ?? donation.donorName;
  const amount = draft.amount !== undefined ? String(draft.amount) : String(donation.amount);
  const purpose = draft.purpose ?? donation.purpose;
  const notes = draft.notes ?? donation.notes ?? '';

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!donorName.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid data', 'Donor name and a valid amount are required.');
      return;
    }
    setSaving(true);
    try {
      await updateDocument<Donation>('husainiya_donations', donation.id, {
        donorName: donorName.trim(),
        amount: numericAmount,
        purpose: purpose.trim(),
        notes: notes.trim() || undefined,
      });
      setDraft({});
      Alert.alert('Saved', 'Donation updated.');
    } catch (err) {
      Alert.alert('Could not save', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete donation', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteDocument('husainiya_donations', donation.id);
            router.back();
          } catch (err) {
            Alert.alert('Could not delete', (err as Error).message);
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FormField
        label="Donor name"
        value={donorName}
        onChangeText={(v) => setDraft((d) => ({ ...d, donorName: v }))}
      />
      <FormField
        label="Amount (AED)"
        value={amount}
        onChangeText={(v) => setDraft((d) => ({ ...d, amount: Number(v) || 0 }))}
        keyboardType="numeric"
      />
      <FormField
        label="Purpose"
        value={purpose}
        onChangeText={(v) => setDraft((d) => ({ ...d, purpose: v }))}
      />
      <FormField
        label="Notes"
        value={notes}
        onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
      />

      <Text style={styles.meta}>
        {donation.paymentMethod} · {donation.date}
      </Text>

      <PrimaryButton title="Save Changes" onPress={handleSave} loading={saving} />
      <View style={styles.spacer} />
      <PrimaryButton
        title="Delete Donation"
        variant="danger"
        onPress={handleDelete}
        loading={deleting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  meta: { color: colors.textMuted, fontSize: 12, marginBottom: 20 },
  spacer: { height: 12 },
});
