import { createClient } from '@supabase/supabase-js';

// Same Supabase project as the portal (app.swrvonthego.pro).
// Anon key is safe to expose — row-level security enforced server-side.
export const supabase = createClient(
  'https://jbnwpgvzyykqyqagzcjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibndwZ3Z6eXlrcXlxYWd6Y2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTE0NzcsImV4cCI6MjA5NTY4NzQ3N30.NUNwgH8BNJQXFlBlg0Zaeh4vzvhmnHQEc7LUWhNcjAk',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
