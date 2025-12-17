import { createClient } from '@supabase/supabase-js';

// Supabase credentials - anon key is safe to expose (it's designed to be public)
const SUPABASE_URL = 'https://viprovmupnkqbsavgnvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcHJvdm11cG5rcWJzYXZnbnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDQ1MTEsImV4cCI6MjA4MTUyMDUxMX0.422Jk8Hg5kd8Af1PbUBX43xRk5g5fLeqr7sSYBzTo2I';

// Use env vars if available, otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return true;
};
