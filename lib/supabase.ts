import { createClient } from '@supabase/supabase-js';

// Anon key is safe to expose — row-level security enforced server-side.
// Falls back to known project values so the bundle works even when
// VITE_SUPABASE_* vars aren't set in the build environment.
const SUPABASE_URL = 'https://jbnwpgvzyykqyqagzcjt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibndwZ3Z6eXlrcXlxYWd6Y2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTE0NzcsImV4cCI6MjA5NTY4NzQ3N30.NUNwgH8BNJQXFlBlg0Zaeh4vzvhmnHQEc7LUWhNcjAk';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

export type UserRole = 'client' | 'admin' | 'partner';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
