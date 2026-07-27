import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteDocument, updateDocument, useDocument } from '@/firebase/firestore';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/theme';
import type { Member } from '@/types';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: member, loading } = useDocument<Member>('members', id);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<Partial<Member>>({});

  if (loading) return <LoadingScreen />;
  if (!member) {
    return <EmptyState icon="alert-circle-outline" title="Member not found" />;
  }

  const fullName = draft.fullName ?? member.fullName;
  const phone = draft.phone ?? member.phone;
  const email = draft.email ?? member.email ?? '';
  const address = draft.address ?? member.address ?? '';

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDocument<Member>('members', member.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      setDraft({});
      Alert.alert('Saved', 'Member details updated.');
    } catch (err) {
      Alert.alert('Could not save', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    await updateDocument<Member>('members', member.id, {
      status: member.status === 'Active' ? 'Inactive' : 'Active',
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete member', `Remove ${member.fullName}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteDocument('members', member.id);
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
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status: {member.status}</Text>
        <Text style={styles.statusToggle} onPress={toggleStatus}>
          Mark {member.status === 'Active' ? 'Inactive' : 'Active'}
        </Text>
      </View>

      <FormField
        label="Full name"
        value={fullName}
        onChangeText={(v) => setDraft((d) => ({ ...d, fullName: v }))}
      />
      <FormField
        label="Phone"
        value={phone}
        onChangeText={(v) => setDraft((d) => ({ ...d, phone: v }))}
        keyboardType="phone-pad"
      />
      <FormField
        label="Email"
        value={email}
        onChangeText={(v) => setDraft((d) => ({ ...d, email: v }))}
        autoCapitalize="none"
      />
      <FormField
        label="Address"
        value={address}
        onChangeText={(v) => setDraft((d) => ({ ...d, address: v }))}
      />

      <Text style={styles.meta}>
        Membership: {member.membershipType} · Joined {member.joinDate}
      </Text>

      <PrimaryButton title="Save Changes" onPress={handleSave} loading={saving} />
      <View style={{ height: 12 }} />
      <PrimaryButton
        title="Delete Member"
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: { color: colors.text, fontWeight: '600' },
  statusToggle: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 12, marginBottom: 20 },
});
