import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Medicamento } from '../types';
import styles from './MedicamentoSearch.module.css';

interface MedicamentoSearchProps {
  onSelect: (medicamento: Medicamento) => void;
  placeholder?: string;
}

export function MedicamentoSearch({ onSelect, placeholder = 'Buscar medicamento...' }: MedicamentoSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medicamento[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchMedicamentos = useCallback(async (searchQuery: string): Promise<Medicamento[]> => {
    if (!searchQuery.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .ilike('nombre', `%${searchQuery.trim()}%`)
        .order('nombre', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Error searching:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const searchTimeout = setTimeout(async () => {
      const data = await searchMedicamentos(query);
      setResults(data);
      setIsOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, searchMedicamentos]);

  const handleSelect = (medicamento: Medicamento) => {
    onSelect(medicamento);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          className={`input ${styles.input}`}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button className={styles.clearButton} onClick={handleClear} type="button">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {loading ? (
            <div className={styles.loading}>Buscando...</div>
          ) : results.length > 0 ? (
            <ul className={styles.list}>
              {results.map((medicamento) => (
                <li key={medicamento.id}>
                  <button
                    className={styles.item}
                    onClick={() => handleSelect(medicamento)}
                    type="button"
                  >
                    {medicamento.nombre}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noResults}>
              No se encontraron medicamentos
            </div>
          )}
        </div>
      )}
    </div>
  );
}
