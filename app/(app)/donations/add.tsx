import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { addDocument } from '@/supabase/data';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/constants/theme';
import type { Donation } from '@/types';

const PAYMENT_METHODS: Donation['paymentMethod'][] = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];

export default function AddDonationScreen() {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Donation['paymentMethod']>('Cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!donorName.trim() || !amount.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Missing information', 'Donor name and a valid amount are required.');
      return;
    }
    setSaving(true);
    try {
      await addDocument<Omit<Donation, 'id' | 'createdAt'>>('husainiya_donations', {
        donorName: donorName.trim(),
        amount: numericAmount,
        purpose: purpose.trim() || 'General',
        paymentMethod,
        date: new Date().toISOString().slice(0, 10),
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert('Could not save donation', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FormField label="Donor name" value={donorName} onChangeText={setDonorName} />
      <FormField
        label="Amount (AED)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <FormField label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="General" />
      <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} />

      <Text style={styles.label}>Payment method</Text>
      <View style={styles.chipRow}>
        {PAYMENT_METHODS.map((method) => (
          <Text
            key={method}
            onPress={() => setPaymentMethod(method)}
            style={[styles.chip, paymentMethod === method && styles.chipActive]}
          >
            {method}
          </Text>
        ))}
      </View>

      <PrimaryButton title="Save Donation" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 13, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: colors.primary,
    color: '#0B1120',
    borderColor: colors.primary,
    fontWeight: '700',
  },
});
