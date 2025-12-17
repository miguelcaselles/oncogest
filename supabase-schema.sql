-- OncoGest Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create elaboraciones table
CREATE TABLE IF NOT EXISTS elaboraciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  preparacion TEXT NOT NULL,
  dosis TEXT NOT NULL,
  caducidad DATE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  gestionado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_elaboraciones_caducidad ON elaboraciones(caducidad);
CREATE INDEX IF NOT EXISTS idx_elaboraciones_estado ON elaboraciones(usado, gestionado);

-- Enable Row Level Security (RLS)
ALTER TABLE elaboraciones ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
-- For production, you should implement proper authentication
CREATE POLICY "Allow all operations" ON elaboraciones
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Insert sample data for testing
-- INSERT INTO elaboraciones (preparacion, dosis, caducidad) VALUES
--   ('Paclitaxel 175mg/m²', '300mg en 500ml SF', CURRENT_DATE + INTERVAL '2 days'),
--   ('Cisplatino 75mg/m²', '150mg en 1000ml SF', CURRENT_DATE - INTERVAL '1 day'),
--   ('Doxorubicina 60mg/m²', '120mg en 250ml SG5%', CURRENT_DATE + INTERVAL '5 days');
