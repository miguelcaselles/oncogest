import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Medicamento, MedicamentoInsert } from '../types';

export function useMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicamentos = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all medicamentos using pagination to bypass Supabase 1000 row limit
      const allMedicamentos: Medicamento[] = [];
      const pageSize = 1000;
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error: fetchError } = await supabase
          .from('medicamentos')
          .select('*')
          .order('nombre', { ascending: true })
          .range(from, to);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          allMedicamentos.push(...data);
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      setMedicamentos(allMedicamentos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMedicamentos = useCallback(async (query: string): Promise<Medicamento[]> => {
    if (!isSupabaseConfigured() || !query.trim()) {
      return [];
    }

    try {
      const { data, error: searchError } = await supabase
        .from('medicamentos')
        .select('*')
        .ilike('nombre', `%${query}%`)
        .order('nombre', { ascending: true })
        .limit(20);

      if (searchError) throw searchError;
      return data || [];
    } catch {
      return [];
    }
  }, []);

  const addMedicamento = async (medicamento: MedicamentoInsert) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase no configurado') };
    }

    const { data, error: insertError } = await supabase
      .from('medicamentos')
      .insert([medicamento])
      .select()
      .single();

    if (!insertError && data) {
      setMedicamentos((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    }

    return { data, error: insertError };
  };

  const deleteMedicamento = async (id: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase no configurado') };
    }

    const { error: deleteError } = await supabase
      .from('medicamentos')
      .delete()
      .eq('id', id);

    if (!deleteError) {
      setMedicamentos((prev) => prev.filter((m) => m.id !== id));
    }

    return { error: deleteError };
  };

  useEffect(() => {
    fetchMedicamentos();
  }, [fetchMedicamentos]);

  return {
    medicamentos,
    loading,
    error,
    fetchMedicamentos,
    searchMedicamentos,
    addMedicamento,
    deleteMedicamento,
  };
}
