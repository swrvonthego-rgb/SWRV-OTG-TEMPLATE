import { useEffect, useState } from 'react';
import { CreditCard, FileText, ChevronRight, DollarSign } from 'lucide-react';
import { supabase, type Invoice } from '../lib/supabase';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);

  useEffect(() => {
    supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) || []);
        setLoading(false);
      });
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      draft: 'badge-gray', sent: 'badge-blue', partial: 'badge-orange',
      paid: 'badge-green', overdue: 'badge-red', void: 'badge-gray',
    };
    return map[s] || 'badge-gray';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const outstanding = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
    .reduce((acc, i) => acc + (i.total - i.amount_paid), 0);

  const totalPaid = invoices.filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.total, 0);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (selected) {
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setSelected(null)}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.06em' }}>
            {selected.invoice_number}
          </h1>
          <span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Invoice <span>Details</span></div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              ['Date', formatDate(selected.created_at)],
              ['Due Date', selected.due_date ? formatDate(selected.due_date) : '—'],
              ['Paid At', selected.paid_at ? formatDate(selected.paid_at) : '—'],
              ['Method', selected.payment_method || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>Description</span>
              <span>Amount</span>
            </div>
            {(selected.line_items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                <span>{item.desc}</span>
                <span>{fmt(item.qty * item.price)}</span>
              </div>
            ))}
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 48, fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>{fmt(selected.subtotal)}</span>
              </div>
              {selected.tax > 0 && (
                <div style={{ display: 'flex', gap: 48, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax</span>
                  <span>{fmt(selected.tax)}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 48, fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <span>Total</span>
                <span className="gold">{fmt(selected.total)}</span>
              </div>
              {selected.amount_paid > 0 && (
                <div style={{ display: 'flex', gap: 48, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Paid</span>
                  <span style={{ color: 'var(--success)' }}>{fmt(selected.amount_paid)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header fade-up" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
            <span className="gold">Billing</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Invoices, payment history, and account balance.
          </p>
        </div>
      </div>

      <div className="stats-grid fade-up delay-1" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c' }}><DollarSign size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{fmt(outstanding)}</div>
            <div className="stat-label">Outstanding</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71' }}><CreditCard size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{fmt(totalPaid)}</div>
            <div className="stat-label">Total Paid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FileText size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{invoices.length}</div>
            <div className="stat-label">Invoices</div>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card fade-up">
          <div className="empty-state">
            <div className="empty-icon"><FileText size={26} /></div>
            <h3>No invoices yet</h3>
            <p>Your invoices will appear here once a project is confirmed.</p>
          </div>
        </div>
      ) : (
        <div className="card fade-up delay-2">
          <div className="section-title" style={{ marginBottom: 16 }}>Invoice <span>History</span></div>
          {invoices.map(inv => (
            <div
              className="list-item"
              key={inv.id}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(inv)}
            >
              <div className="list-icon"><FileText size={15} /></div>
              <div className="list-body">
                <div className="list-title">{inv.invoice_number}</div>
                <div className="list-sub">{formatDate(inv.created_at)}</div>
              </div>
              <span className={`badge ${statusBadge(inv.status)}`}>{inv.status}</span>
              <span style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.9rem', minWidth: 70, textAlign: 'right' }}>
                {fmt(inv.total)}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
