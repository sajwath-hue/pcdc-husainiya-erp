import { useEffect, useState } from 'react';
import { supabase } from './config';
import { modelToRow, rowToModel } from './case';

export type TableName = 'husainiya_members' | 'husainiya_donations' | 'husainiya_events';

export function useCollection<T extends { id: string }>(table: TableName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      const { data: rows, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setData((rows ?? []).map((row) => rowToModel<T>(row)));
        setError(null);
      }
      setLoading(false);
    }

    setLoading(true);
    fetchAll();

    const channel = supabase
      .channel(`${table}-collection`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, fetchAll)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, loading, error };
}

export function useDocument<T extends { id: string }>(table: TableName, id: string | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOne() {
      const { data: row, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!isMounted) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setData(row ? rowToModel<T>(row) : null);
        setError(null);
      }
      setLoading(false);
    }

    setLoading(true);
    fetchOne();

    const channel = supabase
      .channel(`${table}-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `id=eq.${id}` },
        fetchOne
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [table, id]);

  return { data, loading, error };
}

export async function addDocument<T extends Record<string, unknown>>(
  table: TableName,
  value: T
) {
  const { error } = await supabase.from(table).insert(modelToRow(value));
  if (error) throw new Error(error.message);
}

export async function updateDocument<T extends Record<string, unknown>>(
  table: TableName,
  id: string,
  value: Partial<T>
) {
  const { error } = await supabase
    .from(table)
    .update(modelToRow(value))
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteDocument(table: TableName, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
