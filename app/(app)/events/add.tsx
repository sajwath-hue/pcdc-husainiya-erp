import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { addDocument } from '@/firebase/firestore';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/constants/theme';
import type { EventItem } from '@/types';

export default function AddEventScreen() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !date.trim() || !location.trim()) {
      Alert.alert('Missing information', 'Title, date, and location are required.');
      return;
    }
    if (Number.isNaN(Date.parse(date))) {
      Alert.alert('Invalid date', 'Please use the format YYYY-MM-DD.');
      return;
    }
    setSaving(true);
    try {
      await addDocument<Omit<EventItem, 'id' | 'createdAt'>>('events', {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
        capacity: capacity.trim() ? Number(capacity) : undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert('Could not save event', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <FormField label="Location" value={location} onChangeText={setLocation} />
      <FormField
        label="Capacity (optional)"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />
      <FormField
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <PrimaryButton title="Save Event" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
});
