import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Elaboracion, ElaboracionInsert } from '../types';

// Demo data for when Supabase is not configured
const generateDemoData = (): Elaboracion[] => {
  const today = new Date();
  return [
    {
      id: '1',
      preparacion: 'Paclitaxel 175mg/m²',
      dosis: '300mg en 500ml SF',
      caducidad: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usado: false,
      gestionado: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      preparacion: 'Cisplatino 75mg/m²',
      dosis: '150mg en 1000ml SF',
      caducidad: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usado: false,
      gestionado: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      preparacion: 'Doxorubicina 60mg/m²',
      dosis: '120mg en 250ml SG5%',
      caducidad: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usado: false,
      gestionado: false,
      created_at: new Date().toISOString(),
    },
  ];
};

export function useElaboraciones() {
  const [elaboraciones, setElaboraciones] = useState<Elaboracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchElaboraciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setIsDemoMode(true);
      const stored = localStorage.getItem('oncogest_elaboraciones');
      if (stored) {
        setElaboraciones(JSON.parse(stored));
      } else {
        const demoData = generateDemoData();
        localStorage.setItem('oncogest_elaboraciones', JSON.stringify(demoData));
        setElaboraciones(demoData);
      }
      setLoading(false);
      return;
    }

    try {
      // Only hide elaboraciones that are 'gestionado', keep showing 'usado' items
      const { data, error: fetchError } = await supabase
        .from('elaboraciones')
        .select('*')
        .eq('gestionado', false)
        .order('caducidad', { ascending: true });

      if (fetchError) throw fetchError;
      setElaboraciones(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar elaboraciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllElaboraciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setIsDemoMode(true);
      const stored = localStorage.getItem('oncogest_elaboraciones');
      setElaboraciones(stored ? JSON.parse(stored) : []);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('elaboraciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setElaboraciones(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar elaboraciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const addElaboracion = async (elaboracion: ElaboracionInsert) => {
    if (isDemoMode || !isSupabaseConfigured()) {
      const newElaboracion: Elaboracion = {
        ...elaboracion,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      const updated = [...elaboraciones, newElaboracion];
      setElaboraciones(updated);
      localStorage.setItem('oncogest_elaboraciones', JSON.stringify(updated));
      return { data: newElaboracion, error: null };
    }

    const { data, error: insertError } = await supabase
      .from('elaboraciones')
      .insert([elaboracion])
      .select()
      .single();

    if (!insertError && data) {
      setElaboraciones((prev) => [...prev, data]);
    }

    return { data, error: insertError };
  };

  const updateElaboracion = async (id: string, updates: Partial<Elaboracion>) => {
    if (isDemoMode || !isSupabaseConfigured()) {
      const updated = elaboraciones.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      );
      setElaboraciones(updated);
      localStorage.setItem('oncogest_elaboraciones', JSON.stringify(updated));
      return { error: null };
    }

    const { error: updateError } = await supabase
      .from('elaboraciones')
      .update(updates)
      .eq('id', id);

    if (!updateError) {
      setElaboraciones((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    }

    return { error: updateError };
  };

  const deleteElaboracion = async (id: string) => {
    if (isDemoMode || !isSupabaseConfigured()) {
      const updated = elaboraciones.filter((e) => e.id !== id);
      setElaboraciones(updated);
      localStorage.setItem('oncogest_elaboraciones', JSON.stringify(updated));
      return { error: null };
    }

    const { error: deleteError } = await supabase
      .from('elaboraciones')
      .delete()
      .eq('id', id);

    if (!deleteError) {
      setElaboraciones((prev) => prev.filter((e) => e.id !== id));
    }

    return { error: deleteError };
  };

  useEffect(() => {
    fetchElaboraciones();
  }, [fetchElaboraciones]);

  return {
    elaboraciones,
    loading,
    error,
    isDemoMode,
    fetchElaboraciones,
    fetchAllElaboraciones,
    addElaboracion,
    updateElaboracion,
    deleteElaboracion,
    setElaboraciones,
  };
}
