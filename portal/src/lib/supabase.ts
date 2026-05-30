import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jbnwpgvzyykqyqagzcjt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibndwZ3Z6eXlrcXlxYWd6Y2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTE0NzcsImV4cCI6MjA5NTY4NzQ3N30.NUNwgH8BNJQXFlBlg0Zaeh4vzvhmnHQEc7LUWhNcjAk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ─── Types mirroring the DB schema ────────────────────────────────────────────

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

export type VisionStatus = 'draft' | 'complete' | 'archived';

export interface Vision {
  id: string;
  user_id: string;
  title: string;
  status: VisionStatus;
  version: number;
  quick_answers: Record<string, unknown> | null;
  roadmap_answers: Record<string, unknown> | null;
  route: Record<string, unknown> | null;
  coordinates: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceType = 'website' | 'video' | 'music' | 'brand' | 'business' | 'podcast' | 'coaching' | 'other';
export type ProjectStatus = 'inquiry' | 'proposal_sent' | 'in_progress' | 'review' | 'delivered' | 'archived';

export interface Project {
  id: string;
  client_id: string;
  assigned_to: string | null;
  title: string;
  service_type: ServiceType;
  status: ProjectStatus;
  description: string | null;
  intake_data: Record<string, unknown> | null;
  brief: string | null;
  price: number | null;
  tier: string | null;
  due_date: string | null;
  deliverables: Array<{ name: string; url: string; uploaded_at: string }>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  line_items: Array<{ desc: string; qty: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}
