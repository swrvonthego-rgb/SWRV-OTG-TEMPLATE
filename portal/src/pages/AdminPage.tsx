import { useEffect, useState } from 'react';
import { Users, FolderOpen, ChevronRight, Search, Upload, Check, X, FileText } from 'lucide-react';
import { supabase, type Profile, type Project, type Invoice } from '../lib/supabase';

const UPLOAD_TOKEN = 'swrv-R2-upload-2026';
const WORKER_URL   = 'https://swrvonthego.pro';

type Tab = 'clients' | 'projects' | 'invoices';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('projects');
  const [clients, setClients] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: p }, { data: inv }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('updated_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      ]);
      setClients((c as Profile[]) || []);
      setProjects((p as Project[]) || []);
      setInvoices((inv as Invoice[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      inquiry: 'badge-gold', proposal_sent: 'badge-blue', in_progress: 'badge-blue',
      review: 'badge-orange', delivered: 'badge-green', archived: 'badge-gray',
      client: 'badge-gray', admin: 'badge-gold', partner: 'badge-blue',
    };
    return map[s] || 'badge-gray';
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ── Upload deliverable to R2 and attach to project ──────────────────
  const handleDeliverableUpload = async (file: File) => {
    if (!selectedProject) return;
    setUploading(true);
    setUploadMsg('Uploading...');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', `deliverables/${selectedProject.id}`);

      const res = await fetch(`${WORKER_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${UPLOAD_TOKEN}` },
        body: form,
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      // Append to project deliverables array
      const newDeliverable = { name: file.name, url: data.url, uploaded_at: new Date().toISOString() };
      const updated = [...(selectedProject.deliverables || []), newDeliverable];

      const { error } = await supabase
        .from('projects')
        .update({ deliverables: updated })
        .eq('id', selectedProject.id);

      if (error) throw error;

      setSelectedProject({ ...selectedProject, deliverables: updated });
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, deliverables: updated } : p));
      setUploadMsg('✓ Uploaded');
      setTimeout(() => setUploadMsg(''), 3000);
    } catch (err: any) {
      setUploadMsg(`Error: ${err.message}`);
    }
    setUploading(false);
  };

  // ── Update project status ────────────────────────────────────────────
  const updateProjectStatus = async (projectId: string, status: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: status as any } : p));
      if (selectedProject?.id === projectId) setSelectedProject(prev => prev ? { ...prev, status: status as any } : null);
    }
    setUpdatingStatus(false);
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.service_type.toLowerCase().includes(search.toLowerCase()) ||
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  // ── Project detail view ──────────────────────────────────────────────
  if (selectedProject) {
    const statuses = ['inquiry', 'proposal_sent', 'in_progress', 'review', 'delivered', 'archived'];
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setSelectedProject(null)}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.06em' }}>{selectedProject.title}</h1>
          <span className={`badge ${statusBadge(selectedProject.status)}`} style={{ textTransform: 'capitalize' }}>
            {selectedProject.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="content-grid content-grid-2" style={{ gap: 20, marginBottom: 20 }}>
          {/* Status control */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Update <span>Status</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {statuses.map(s => (
                <button
                  key={s}
                  className={`btn ${selectedProject.status === s ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
                  onClick={() => updateProjectStatus(selectedProject.id, s)}
                  disabled={updatingStatus}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Project info */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Project <span>Info</span></div>
            {[
              ['Service', selectedProject.service_type],
              ['Tier', selectedProject.tier || '—'],
              ['Price', selectedProject.price ? `$${selectedProject.price.toLocaleString()}` : '—'],
              ['Due', selectedProject.due_date ? fmt(selectedProject.due_date) : '—'],
              ['Started', fmt(selectedProject.created_at)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.88rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables upload */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><span>Deliverables</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {uploadMsg && <span style={{ fontSize: '0.82rem', color: uploadMsg.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>{uploadMsg}</span>}
              <label className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem', cursor: 'pointer' }}>
                {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Upload size={14} />}
                Upload File
                <input type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleDeliverableUpload(e.target.files[0]); }} />
              </label>
            </div>
          </div>

          {(selectedProject.deliverables || []).length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 16px' }}>
              <div className="empty-icon"><Upload size={18} /></div>
              <h3>No deliverables yet</h3>
              <p>Upload files above — clients will see them instantly in their portal.</p>
            </div>
          ) : (
            (selectedProject.deliverables || []).map((d, i) => (
              <div className="list-item" key={i}>
                <div className="list-icon"><FileText size={15} /></div>
                <div className="list-body">
                  <div className="list-title">{d.name}</div>
                  <div className="list-sub">{fmt(d.uploaded_at)}</div>
                </div>
                <a href={d.url} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.8rem' }} target="_blank" rel="noopener noreferrer">View</a>
              </div>
            ))
          )}
        </div>

        {/* Brief */}
        {selectedProject.brief && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Project <span>Brief</span></div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{selectedProject.brief}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {showCreateInvoice && (
        <CreateInvoiceModal
          clients={clients}
          projects={projects}
          onClose={() => setShowCreateInvoice(false)}
          onCreated={async () => {
            const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
            setInvoices((data as Invoice[]) || []);
          }}
        />
      )}
      <div className="section-header fade-up" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
            <span className="gold">Admin</span> Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            All clients, projects, and invoices in one place.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid fade-up delay-1" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{clients.filter(c => c.role === 'client').length}</div>
            <div className="stat-label">Clients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FolderOpen size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{projects.filter(p => p.status === 'in_progress').length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c' }}><FileText size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{invoices.filter(i => ['sent','partial','overdue'].includes(i.status)).length}</div>
            <div className="stat-label">Open Invoices</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71' }}><Check size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{projects.filter(p => p.status === 'delivered').length}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
      </div>

      {/* Tabs + action button */}
      <div className="fade-up delay-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0, flex: 1 }}>
        {(['projects', 'clients', 'invoices'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 18px', fontSize: '0.88rem', fontWeight: 600,
              textTransform: 'capitalize',
              color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >{t}</button>
        ))}
        </div>
        {tab === 'invoices' && (
          <button className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem', marginLeft: 12, marginBottom: 1 }}
            onClick={() => setShowCreateInvoice(true)}>
            + Invoice
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 34 }}
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Projects tab */}
      {tab === 'projects' && (
        <div className="card fade-up delay-3">
          {filteredProjects.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><FolderOpen size={22} /></div><h3>No projects found</h3></div>
          ) : filteredProjects.map(p => (
            <div className="list-item" key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedProject(p)}>
              <div className="list-icon"><FolderOpen size={15} /></div>
              <div className="list-body">
                <div className="list-title">{p.title}</div>
                <div className="list-sub" style={{ textTransform: 'capitalize' }}>{p.service_type} · {fmt(p.updated_at)}</div>
              </div>
              {p.price && <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.88rem' }}>${p.price.toLocaleString()}</span>}
              <span className={`badge ${statusBadge(p.status)}`} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{p.status.replace(/_/g, ' ')}</span>
              <ChevronRight size={15} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* Clients tab */}
      {tab === 'clients' && (
        <div className="card fade-up delay-3">
          {filteredClients.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><Users size={22} /></div><h3>No clients found</h3></div>
          ) : filteredClients.map(c => (
            <div className="list-item" key={c.id}>
              <div className="user-avatar" style={{ flexShrink: 0 }}>
                {c.avatar_url ? <img src={c.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (c.full_name?.[0] || c.email[0]).toUpperCase()}
              </div>
              <div className="list-body">
                <div className="list-title">{c.full_name || '—'}</div>
                <div className="list-sub">{c.email}</div>
              </div>
              {c.company_name && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.company_name}</span>}
              <span className={`badge ${statusBadge(c.role)}`}>{c.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Invoices tab */}
      {tab === 'invoices' && (
        <div className="card fade-up delay-3">
          {invoices.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><FileText size={22} /></div><h3>No invoices yet</h3></div>
          ) : invoices.map(inv => (
            <div className="list-item" key={inv.id}>
              <div className="list-icon"><FileText size={15} /></div>
              <div className="list-body">
                <div className="list-title">{inv.invoice_number}</div>
                <div className="list-sub">{fmt(inv.created_at)}</div>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.88rem' }}>${inv.total.toLocaleString()}</span>
              <span className={`badge ${statusBadge(inv.status)}`}>{inv.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CreateInvoiceModal ───────────────────────────────────────────────────────
export function CreateInvoiceModal({ clients, projects, onClose, onCreated }: {
  clients: Profile[];
  projects: Project[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!clientId || !desc || !amount) { setError('Client, description and amount are required.'); return; }
    setSaving(true);
    const total = parseFloat(amount);
    const { error } = await supabase.from('invoices').insert({
      client_id: clientId,
      project_id: projectId || null,
      invoice_number: `SWRV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      line_items: [{ desc, qty: 1, price: total }],
      subtotal: total,
      tax: 0,
      total,
      amount_paid: 0,
      due_date: dueDate || null,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    onCreated();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>Create <span className="gold">Invoice</span></div>
          <button className="btn btn-ghost" style={{ padding: 4 }} onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">Client</label>
            <select className="form-input" value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Select client...</option>
              {clients.filter(c => c.role === 'client').map(c => (
                <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Project (optional)</label>
            <select className="form-input" value={projectId} onChange={e => setProjectId(e.target.value)}>
              <option value="">No project</option>
              {projects.filter(p => p.client_id === clientId).map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="e.g. Presence Website Build" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date (optional)</label>
            <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Check size={15} />}
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
