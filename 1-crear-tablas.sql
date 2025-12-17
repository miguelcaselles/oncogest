-- =====================================================
-- PASO 1: CREAR TABLAS NUEVAS (medicamentos y pedidos)
-- Ejecuta este SQL primero en Supabase SQL Editor
-- =====================================================

-- Tabla de medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para búsquedas rápidas por nombre
CREATE INDEX IF NOT EXISTS idx_medicamentos_nombre_like ON medicamentos(nombre varchar_pattern_ops);

-- Habilitar RLS
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

-- Política de acceso
CREATE POLICY "Allow all operations on medicamentos" ON medicamentos
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Tabla de pedidos
-- =====================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medicamento_id UUID REFERENCES medicamentos(id) ON DELETE SET NULL,
  medicamento_nombre TEXT NOT NULL,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  pedido BOOLEAN DEFAULT FALSE,
  fecha_pedido DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_medicamento ON pedidos(medicamento_id);

-- Habilitar RLS
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política de acceso
CREATE POLICY "Allow all operations on pedidos" ON pedidos
  FOR ALL USING (true) WITH CHECK (true);
