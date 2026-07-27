import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { CollectionName } from '@/types';

export function useCollection<T extends { id: string }>(collectionName: CollectionName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<T, 'id'>),
        })) as T[];
        setData(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName]);

  return { data, loading, error };
}

export function useDocument<T extends { id: string }>(
  collectionName: CollectionName,
  id: string | undefined
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, collectionName, id),
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...(snapshot.data() as Omit<T, 'id'>) } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, id]);

  return { data, loading, error };
}

export async function addDocument<T extends Record<string, unknown>>(
  collectionName: CollectionName,
  value: T
) {
  return addDoc(collection(db, collectionName), {
    ...value,
    createdAt: Date.now(),
  });
}

export async function updateDocument<T extends Record<string, unknown>>(
  collectionName: CollectionName,
  id: string,
  value: Partial<T>
) {
  return updateDoc(doc(db, collectionName, id), value as Record<string, unknown>);
}

export async function deleteDocument(collectionName: CollectionName, id: string) {
  return deleteDoc(doc(db, collectionName, id));
}
