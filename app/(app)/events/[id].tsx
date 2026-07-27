import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteDocument, updateDocument, useDocument } from '@/firebase/firestore';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/theme';
import type { EventItem } from '@/types';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, loading } = useDocument<EventItem>('events', id);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState<Partial<EventItem>>({});

  if (loading) return <LoadingScreen />;
  if (!event) {
    return <EmptyState icon="alert-circle-outline" title="Event not found" />;
  }

  const title = draft.title ?? event.title;
  const date = draft.date ?? event.date;
  const location = draft.location ?? event.location;
  const description = draft.description ?? event.description ?? '';

  const handleSave = async () => {
    if (!title.trim() || !date.trim() || !location.trim()) {
      Alert.alert('Invalid data', 'Title, date, and location are required.');
      return;
    }
    setSaving(true);
    try {
      await updateDocument<EventItem>('events', event.id, {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
      });
      setDraft({});
      Alert.alert('Saved', 'Event updated.');
    } catch (err) {
      Alert.alert('Could not save', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete event', `Remove "${event.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteDocument('events', event.id);
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
        label="Title"
        value={title}
        onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))}
      />
      <FormField
        label="Date"
        value={date}
        onChangeText={(v) => setDraft((d) => ({ ...d, date: v }))}
      />
      <FormField
        label="Location"
        value={location}
        onChangeText={(v) => setDraft((d) => ({ ...d, location: v }))}
      />
      <FormField
        label="Description"
        value={description}
        onChangeText={(v) => setDraft((d) => ({ ...d, description: v }))}
        multiline
      />

      <PrimaryButton title="Save Changes" onPress={handleSave} loading={saving} />
      <View style={styles.spacer} />
      <PrimaryButton
        title="Delete Event"
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
  spacer: { height: 12 },
});
