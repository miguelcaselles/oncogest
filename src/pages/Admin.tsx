import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, RefreshCw, Database, AlertCircle, Pill, Plus, Search } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Elaboracion, Medicamento } from '../types';
import styles from './Admin.module.css';

type TabType = 'elaboraciones' | 'medicamentos';

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('elaboraciones');
  const [elaboraciones, setElaboraciones] = useState<Elaboracion[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState<Medicamento[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [newMedicamento, setNewMedicamento] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchElaboraciones = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setIsDemoMode(true);
      const stored = localStorage.getItem('oncogest_elaboraciones');
      setElaboraciones(stored ? JSON.parse(stored) : []);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('elaboraciones')
      .select('*')
      .order('created_at', { ascending: false });

    setElaboraciones(data || []);
    setLoading(false);
  }, []);

  const fetchMedicamentos = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // Fetch all medicamentos using pagination to bypass Supabase 1000 row limit
    const allMedicamentos: Medicamento[] = [];
    const pageSize = 1000;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data } = await supabase
        .from('medicamentos')
        .select('*')
        .order('nombre', { ascending: true })
        .range(from, to);

      if (data && data.length > 0) {
        allMedicamentos.push(...data);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    setMedicamentos(allMedicamentos);
    setFilteredMedicamentos(allMedicamentos);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'elaboraciones') {
      fetchElaboraciones();
    } else {
      fetchMedicamentos();
    }
  }, [activeTab, fetchElaboraciones, fetchMedicamentos]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = medicamentos.filter((m) =>
        m.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicamentos(filtered);
    } else {
      setFilteredMedicamentos(medicamentos);
    }
  }, [searchQuery, medicamentos]);

  const handleDeleteElaboracion = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta elaboración?')) {
      return;
    }

    if (isDemoMode || !isSupabaseConfigured()) {
      const updated = elaboraciones.filter((e) => e.id !== id);
      setElaboraciones(updated);
      localStorage.setItem('oncogest_elaboraciones', JSON.stringify(updated));
      return;
    }

    await supabase.from('elaboraciones').delete().eq('id', id);
    setElaboraciones((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearAllElaboraciones = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODAS las elaboraciones? Esta acción no se puede deshacer.')) {
      return;
    }

    if (isDemoMode || !isSupabaseConfigured()) {
      setElaboraciones([]);
      localStorage.setItem('oncogest_elaboraciones', JSON.stringify([]));
      return;
    }

    await supabase.from('elaboraciones').delete().neq('id', '');
    setElaboraciones([]);
  };

  const handleAddMedicamento = async () => {
    if (!newMedicamento.trim() || !isSupabaseConfigured()) return;

    const { data, error } = await supabase
      .from('medicamentos')
      .insert([{ nombre: newMedicamento.trim() }])
      .select()
      .single();

    if (!error && data) {
      setMedicamentos((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNewMedicamento('');
      setShowAddForm(false);
    } else if (error) {
      alert('Error al añadir medicamento: ' + error.message);
    }
  };

  const handleDeleteMedicamento = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
      return;
    }

    if (!isSupabaseConfigured()) return;

    const { error } = await supabase.from('medicamentos').delete().eq('id', id);
    if (!error) {
      setMedicamentos((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
  };

  const getStatusBadge = (elaboracion: Elaboracion) => {
    if (elaboracion.gestionado) {
      return <span className="badge badge-success">Gestionado</span>;
    }
    if (elaboracion.usado) {
      return <span className="badge badge-info">Usado</span>;
    }
    return <span className="badge badge-warning">Pendiente</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Administración</h1>
          <p className={styles.subtitle}>
            Gestiona las bases de datos de la aplicación
          </p>
        </div>
      </div>

      {isDemoMode && (
        <div className="alert alert-info">
          <AlertCircle size={18} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <span>
            <strong>Modo Demo:</strong> Los datos se guardan en localStorage.
          </span>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'elaboraciones' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('elaboraciones')}
        >
          <Database size={18} />
          Elaboraciones
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'medicamentos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('medicamentos')}
        >
          <Pill size={18} />
          Medicamentos
        </button>
      </div>

      {activeTab === 'elaboraciones' && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <Database size={24} className={styles.statIcon} />
                <div>
                  <div className={styles.statValue}>{elaboraciones.length}</div>
                  <div className={styles.statLabel}>Total</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {elaboraciones.filter((e) => !e.usado && !e.gestionado).length}
                </div>
                <div className={styles.statLabel}>Pendientes</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {elaboraciones.filter((e) => e.usado).length}
                </div>
                <div className={styles.statLabel}>Usados</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {elaboraciones.filter((e) => e.gestionado).length}
                </div>
                <div className={styles.statLabel}>Gestionados</div>
              </div>
            </div>
            <div className={styles.actions}>
              <button className="btn btn-secondary" onClick={fetchElaboraciones}>
                <RefreshCw size={18} />
                Refrescar
              </button>
              <button className="btn btn-danger" onClick={handleClearAllElaboraciones}>
                <Trash2 size={18} />
                Limpiar Todo
              </button>
            </div>
          </div>

          <div className="card">
            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : elaboraciones.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-state-icon" size={48} />
                <h3 className="empty-state-title">Base de datos vacía</h3>
                <p className="empty-state-description">
                  No hay elaboraciones registradas.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Preparación</th>
                      <th>Dosis</th>
                      <th>Caducidad</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elaboraciones.map((elaboracion) => (
                      <tr key={elaboracion.id}>
                        <td className={styles.idCell}>
                          {elaboracion.id.slice(0, 8)}...
                        </td>
                        <td>{elaboracion.preparacion}</td>
                        <td>{elaboracion.dosis}</td>
                        <td>{elaboracion.caducidad}</td>
                        <td>{getStatusBadge(elaboracion)}</td>
                        <td>{formatDate(elaboracion.created_at)}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleDeleteElaboracion(elaboracion.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'medicamentos' && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={`input ${styles.searchInput}`}
                placeholder="Buscar medicamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.actions}>
              <button className="btn btn-secondary" onClick={fetchMedicamentos}>
                <RefreshCw size={18} />
                Refrescar
              </button>
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                <Plus size={18} />
                Añadir
              </button>
            </div>
          </div>

          <div className={styles.statsSmall}>
            <span className={styles.countText}>
              {filteredMedicamentos.length} de {medicamentos.length} medicamentos
            </span>
          </div>

          {showAddForm && (
            <div className={`card ${styles.addForm}`}>
              <h3 className={styles.addFormTitle}>Añadir Nuevo Medicamento</h3>
              <div className={styles.addFormContent}>
                <input
                  type="text"
                  className="input"
                  placeholder="Nombre del medicamento"
                  value={newMedicamento}
                  onChange={(e) => setNewMedicamento(e.target.value)}
                  autoFocus
                />
                <div className={styles.addFormActions}>
                  <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddMedicamento}
                    disabled={!newMedicamento.trim()}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : filteredMedicamentos.length === 0 ? (
              <div className="empty-state">
                <Pill className="empty-state-icon" size={48} />
                <h3 className="empty-state-title">
                  {searchQuery ? 'Sin resultados' : 'No hay medicamentos'}
                </h3>
                <p className="empty-state-description">
                  {searchQuery
                    ? 'No se encontraron medicamentos con ese nombre.'
                    : 'Añade medicamentos para comenzar.'}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th className={styles.actionsColumnSmall}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicamentos.map((medicamento) => (
                      <tr key={medicamento.id}>
                        <td>{medicamento.nombre}</td>
                        <td className={styles.actionsColumnSmall}>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleDeleteMedicamento(medicamento.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
