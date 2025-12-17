import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { ElaboracionInsert } from '../types';
import styles from './ElaboracionForm.module.css';

interface ElaboracionFormProps {
  onSubmit: (elaboracion: ElaboracionInsert) => Promise<void>;
  onClose: () => void;
}

export function ElaboracionForm({ onSubmit, onClose }: ElaboracionFormProps) {
  const [preparacion, setPreparacion] = useState('');
  const [dosis, setDosis] = useState('');
  const [caducidad, setCaducidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!preparacion.trim() || !dosis.trim() || !caducidad) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        preparacion: preparacion.trim(),
        dosis: dosis.trim(),
        caducidad,
        usado: false,
        gestionado: false,
      });
      onClose();
    } catch {
      setError('Error al guardar la elaboración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nueva Elaboración</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="label" htmlFor="preparacion">
                Preparación
              </label>
              <input
                id="preparacion"
                type="text"
                className="input"
                placeholder="Ej: Paclitaxel 175mg/m²"
                value={preparacion}
                onChange={(e) => setPreparacion(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="dosis">
                Dosis
              </label>
              <input
                id="dosis"
                type="text"
                className="input"
                placeholder="Ej: 300mg en 500ml SF"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="caducidad">
                Fecha de Caducidad
              </label>
              <input
                id="caducidad"
                type="date"
                className={`input ${styles.dateInput}`}
                value={caducidad}
                onChange={(e) => setCaducidad(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={18} />
              {loading ? 'Guardando...' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
