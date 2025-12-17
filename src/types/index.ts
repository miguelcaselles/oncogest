export interface Elaboracion {
  id: string;
  preparacion: string;
  dosis: string;
  caducidad: string;
  usado: boolean;
  gestionado: boolean;
  created_at: string;
}

export type ElaboracionInsert = Omit<Elaboracion, 'id' | 'created_at'>;
export type ElaboracionUpdate = Partial<ElaboracionInsert>;

export interface Medicamento {
  id: string;
  nombre: string;
  created_at: string;
}

export type MedicamentoInsert = Omit<Medicamento, 'id' | 'created_at'>;

export interface Pedido {
  id: string;
  medicamento_id: string | null;
  medicamento_nombre: string;
  stock_actual: number;
  pedido: boolean;
  fecha_pedido: string;
  created_at: string;
}

export type PedidoInsert = Omit<Pedido, 'id' | 'created_at'>;
