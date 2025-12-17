import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Pedido, PedidoInsert } from '../types';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const getToday = () => new Date().toISOString().split('T')[0];

  const fetchPedidosHoy = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const today = getToday();
      const { data, error: fetchError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('fecha_pedido', today)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPedidos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistorico = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('pedidos')
        .select('*')
        .order('fecha_pedido', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPedidos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar histórico');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPedido = async (pedido: PedidoInsert) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase no configurado') };
    }

    const { data, error: insertError } = await supabase
      .from('pedidos')
      .insert([{ ...pedido, fecha_pedido: getToday() }])
      .select()
      .single();

    if (!insertError && data) {
      setPedidos((prev) => [data, ...prev]);
    }

    return { data, error: insertError };
  };

  const updatePedido = async (id: string, updates: Partial<Pedido>) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase no configurado') };
    }

    const { error: updateError } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id);

    if (!updateError) {
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }

    return { error: updateError };
  };

  const deletePedido = async (id: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase no configurado') };
    }

    const { error: deleteError } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);

    if (!deleteError) {
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    }

    return { error: deleteError };
  };

  useEffect(() => {
    fetchPedidosHoy();
  }, [fetchPedidosHoy]);

  return {
    pedidos,
    loading,
    error,
    fetchPedidosHoy,
    fetchHistorico,
    addPedido,
    updatePedido,
    deletePedido,
  };
}
