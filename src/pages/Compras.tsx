import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, History, Trash2, Check } from 'lucide-react';
import { MedicamentoSearch } from '../components/MedicamentoSearch';
import { usePedidos } from '../hooks/usePedidos';
import type { Medicamento } from '../types';
import styles from './Compras.module.css';

export function Compras() {
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [stockActual, setStockActual] = useState('');
  const {
    pedidos,
    loading,
    fetchPedidosHoy,
    fetchHistorico,
    addPedido,
    updatePedido,
    deletePedido,
  } = usePedidos();

  const handleSelectMedicamento = (medicamento: Medicamento) => {
    setSelectedMedicamento(medicamento);
  };

  const handleAddPedido = async () => {
    if (!selectedMedicamento) return;

    await addPedido({
      medicamento_id: selectedMedicamento.id,
      medicamento_nombre: selectedMedicamento.nombre,
      stock_actual: stockActual === '' ? 0 : parseInt(stockActual, 10),
      pedido: false,
      fecha_pedido: new Date().toISOString().split('T')[0],
    });

    setSelectedMedicamento(null);
    setStockActual('');
  };

  const handleTogglePedido = async (id: string, pedido: boolean) => {
    await updatePedido(id, { pedido });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro?')) {
      await deletePedido(id);
    }
  };

  const handleToggleHistorico = () => {
    if (showHistorico) {
      setShowHistorico(false);
      fetchPedidosHoy();
    } else {
      setShowHistorico(true);
      fetchHistorico();
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  // Group pedidos by date for historico view
  const groupedPedidos = showHistorico
    ? pedidos.reduce((acc, pedido) => {
        const date = pedido.fecha_pedido;
        if (!acc[date]) acc[date] = [];
        acc[date].push(pedido);
        return acc;
      }, {} as Record<string, typeof pedidos>)
    : { [new Date().toISOString().split('T')[0]]: pedidos };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {showHistorico ? 'Histórico de Pedidos' : 'Gestión de Compras'}
          </h1>
          <p className={styles.subtitle}>
            {showHistorico
              ? 'Consulta los pedidos realizados anteriormente'
              : 'Registra el stock y pedidos de medicamentos'}
          </p>
        </div>
        <button
          className={`btn ${showHistorico ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleToggleHistorico}
        >
          <History size={18} />
          {showHistorico ? 'Ver Hoy' : 'Ver Histórico'}
        </button>
      </div>

      {!showHistorico && (
        <div className={`card card-overflow-visible ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Añadir Registro</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className="label">Medicamento</label>
              <MedicamentoSearch onSelect={handleSelectMedicamento} />
              {selectedMedicamento && (
                <div className={styles.selectedMedicamento}>
                  <Check size={16} />
                  <span>{selectedMedicamento.nombre}</span>
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className="label" htmlFor="stock">Stock Actual</label>
              <input
                id="stock"
                type="number"
                className="input"
                placeholder="0"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className="label">&nbsp;</label>
              <button
                className="btn btn-primary"
                onClick={handleAddPedido}
                disabled={!selectedMedicamento}
              >
                Añadir
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
        ) : pedidos.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state-icon" size={48} />
            <h3 className="empty-state-title">
              {showHistorico ? 'No hay histórico' : 'No hay registros hoy'}
            </h3>
            <p className="empty-state-description">
              {showHistorico
                ? 'No se han encontrado pedidos anteriores.'
                : 'Busca un medicamento y añade el stock actual.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            {Object.entries(groupedPedidos).map(([date, datePedidos]) => (
              <div key={date}>
                {showHistorico && (
                  <div className={styles.dateHeader}>
                    {formatDate(date)}
                  </div>
                )}
                <table>
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th className={styles.stockColumn}>Stock</th>
                      <th className={styles.checkboxColumn}>Pedido</th>
                      {!showHistorico && <th className={styles.actionsColumn}>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {datePedidos.map((pedido) => (
                      <tr key={pedido.id} className={pedido.pedido ? styles.pedidoRealizado : ''}>
                        <td>{pedido.medicamento_nombre}</td>
                        <td className={styles.stockColumn}>{pedido.stock_actual}</td>
                        <td className={styles.checkboxColumn}>
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={pedido.pedido}
                              onChange={(e) => handleTogglePedido(pedido.id, e.target.checked)}
                              disabled={showHistorico}
                            />
                          </div>
                        </td>
                        {!showHistorico && (
                          <td className={styles.actionsColumn}>
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => handleDelete(pedido.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
