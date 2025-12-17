import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { ElaboracionesTable } from '../components/ElaboracionesTable';
import { ElaboracionForm } from '../components/ElaboracionForm';
import { ElaboracionEditForm } from '../components/ElaboracionEditForm';
import { useElaboraciones } from '../hooks/useElaboraciones';
import type { Elaboracion } from '../types';
import styles from './Sobrantes.module.css';

export function Sobrantes() {
  const [showForm, setShowForm] = useState(false);
  const [editingElaboracion, setEditingElaboracion] = useState<Elaboracion | null>(null);
  const {
    elaboraciones,
    loading,
    error,
    isDemoMode,
    addElaboracion,
    updateElaboracion,
    deleteElaboracion,
    setElaboraciones,
  } = useElaboraciones();

  const handleToggleUsado = async (id: string, usado: boolean) => {
    await updateElaboracion(id, { usado });
  };

  const handleToggleGestionado = async (id: string, gestionado: boolean) => {
    await updateElaboracion(id, { gestionado });
    // Remove from local state when marked as gestionado (since query filters by gestionado=false)
    if (gestionado) {
      setElaboraciones((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleAddElaboracion = async (elaboracion: Parameters<typeof addElaboracion>[0]) => {
    const { error } = await addElaboracion(elaboracion);
    if (error) throw error;
  };

  const handleEditElaboracion = async (id: string, updates: Partial<Elaboracion>) => {
    const { error } = await updateElaboracion(id, updates);
    if (error) throw error;
  };

  const handleDeleteElaboracion = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta elaboración?')) {
      await deleteElaboracion(id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Elaboraciones Sobrantes</h1>
          <p className={styles.subtitle}>
            Gestiona las mezclas de elaboraciones que no se han utilizado
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Nueva Elaboración
        </button>
      </div>

      {isDemoMode && (
        <div className="alert alert-info">
          <AlertCircle size={18} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <span>
            <strong>Modo Demo:</strong> Los datos se guardan localmente. Configura Supabase para persistencia real.
          </span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <ElaboracionesTable
          elaboraciones={elaboraciones}
          loading={loading}
          onToggleUsado={handleToggleUsado}
          onToggleGestionado={handleToggleGestionado}
          onEdit={setEditingElaboracion}
          onDelete={handleDeleteElaboracion}
        />
      </div>

      {showForm && (
        <ElaboracionForm
          onSubmit={handleAddElaboracion}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingElaboracion && (
        <ElaboracionEditForm
          elaboracion={editingElaboracion}
          onSubmit={handleEditElaboracion}
          onClose={() => setEditingElaboracion(null)}
        />
      )}
    </div>
  );
}
