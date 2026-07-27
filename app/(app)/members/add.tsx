import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { addDocument } from '@/firebase/firestore';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/constants/theme';
import type { Member } from '@/types';

const MEMBERSHIP_TYPES: Member['membershipType'][] = ['Regular', 'Life', 'Honorary'];

export default function AddMemberScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [membershipType, setMembershipType] = useState<Member['membershipType']>('Regular');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing information', 'Full name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      await addDocument<Omit<Member, 'id' | 'createdAt'>>('members', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        membershipType,
        status: 'Active',
        joinDate: new Date().toISOString().slice(0, 10),
      });
      router.back();
    } catch (err) {
      Alert.alert('Could not save member', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FormField label="Full name" value={fullName} onChangeText={setFullName} />
      <FormField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <FormField
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormField label="Address (optional)" value={address} onChangeText={setAddress} />

      <Text style={styles.label}>Membership type</Text>
      <View style={styles.chipRow}>
        {MEMBERSHIP_TYPES.map((type) => (
          <Text
            key={type}
            onPress={() => setMembershipType(type)}
            style={[styles.chip, membershipType === type && styles.chipActive]}
          >
            {type}
          </Text>
        ))}
      </View>

      <PrimaryButton title="Save Member" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 13, fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
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
