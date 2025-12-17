import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import type { Elaboracion } from '../types';
import styles from './ElaboracionesTable.module.css';

interface ElaboracionesTableProps {
  elaboraciones: Elaboracion[];
  loading: boolean;
  onToggleUsado: (id: string, usado: boolean) => void;
  onToggleGestionado: (id: string, gestionado: boolean) => void;
  onEdit: (elaboracion: Elaboracion) => void;
  onDelete: (id: string) => void;
}

export function ElaboracionesTable({
  elaboraciones,
  loading,
  onToggleUsado,
  onToggleGestionado,
  onEdit,
  onDelete,
}: ElaboracionesTableProps) {
  const isExpired = (caducidad: string) => {
    const date = new Date(caducidad + 'T23:59:59');
    return isPast(date);
  };

  const getCaducidadBadge = (caducidad: string) => {
    const date = new Date(caducidad + 'T23:59:59');

    if (isPast(date)) {
      return <span className="badge badge-danger">Caducado</span>;
    }
    if (isToday(new Date(caducidad))) {
      return <span className="badge badge-warning">Hoy</span>;
    }
    if (isTomorrow(new Date(caducidad))) {
      return <span className="badge badge-warning">Mañana</span>;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  // Filter out elaboraciones that are marked as usado or gestionado
  const visibleElaboraciones = elaboraciones.filter(
    (e) => !e.usado && !e.gestionado
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (visibleElaboraciones.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-state-icon" size={48} />
        <h3 className="empty-state-title">No hay elaboraciones</h3>
        <p className="empty-state-description">
          Añade una nueva elaboración para comenzar a gestionar los sobrantes.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Preparación</th>
            <th>Dosis</th>
            <th>Caducidad</th>
            <th className={styles.checkboxColumn}>Usado</th>
            <th className={styles.checkboxColumn}>Gestionado</th>
            <th className={styles.actionsColumn}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visibleElaboraciones.map((elaboracion) => (
            <tr
              key={elaboracion.id}
              className={isExpired(elaboracion.caducidad) ? 'expired' : ''}
            >
              <td>
                <div className={styles.preparacionCell}>
                  {isExpired(elaboracion.caducidad) && (
                    <AlertTriangle size={16} className={styles.warningIcon} />
                  )}
                  <span className={styles.preparacionText}>
                    {elaboracion.preparacion}
                  </span>
                </div>
              </td>
              <td>{elaboracion.dosis}</td>
              <td>
                <div className={styles.caducidadCell}>
                  <span>{formatDate(elaboracion.caducidad)}</span>
                  {getCaducidadBadge(elaboracion.caducidad)}
                </div>
              </td>
              <td className={styles.checkboxColumn}>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={elaboracion.usado}
                    onChange={(e) =>
                      onToggleUsado(elaboracion.id, e.target.checked)
                    }
                    title="Marcar como usado"
                  />
                </div>
              </td>
              <td className={styles.checkboxColumn}>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={elaboracion.gestionado}
                    onChange={(e) =>
                      onToggleGestionado(elaboracion.id, e.target.checked)
                    }
                    title="Marcar como gestionado"
                  />
                </div>
              </td>
              <td className={styles.actionsColumn}>
                <div className={styles.actionsCell}>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => onEdit(elaboracion)}
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => onDelete(elaboracion.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
