import React, { useEffect, useState } from 'react';

interface EmailRow {
  email: string;
  name: string | null;
  source: string | null;
  captured_at: string;
}

interface SubmissionRow {
  id: number;
  tenant_slug: string;
  email: string | null;
  name: string | null;
  raw_vision: string | null;
  result_json: string;
  confidence_score: number | null;
  escalated: number;
  created_at: string;
}

interface TenantRow {
  slug: string;
  display_name: string;
  contact_email: string;
  logo_url: string | null;
  colors_json: string | null;
  services_json: string;
  confidence_threshold: number;
  created_at: string;
}

type Tab = 'emails' | 'submissions' | 'tenants';

export const AdminPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EmailRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  const [tab, setTab] = useState<Tab>('emails');

  // ── Vision Portal: submissions ──────────────────────────────
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [tenantFilter, setTenantFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Vision Portal: tenants ───────────────────────────────────
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [newSlug, setNewSlug] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newServicesText, setNewServicesText] = useState('');
  const [newColorPrimary, setNewColorPrimary] = useState('');
  const [newColorAccent, setNewColorAccent] = useState('');
  const [addTenantStatus, setAddTenantStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [addTenantError, setAddTenantError] = useState('');

  useEffect(() => {
    fetch('/api/admin-me', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAuthedEmail(data?.email || null))
      .catch(() => setAuthedEmail(null))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authedEmail) return;
    setLoadingRows(true);
    fetch('/api/admin/emails', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { emails: [] }))
      .then((data) => setRows(data.emails || []))
      .finally(() => setLoadingRows(false));
  }, [authedEmail]);

  const fetchTenants = () => {
    fetch('/api/admin/tenants', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { tenants: [] }))
      .then((data) => setTenants(data.tenants || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!authedEmail) return;
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authedEmail]);

  useEffect(() => {
    if (!authedEmail || tab !== 'submissions') return;
    setLoadingSubmissions(true);
    const qs = tenantFilter ? `?tenant=${encodeURIComponent(tenantFilter)}` : '';
    fetch(`/api/admin/submissions${qs}`, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { submissions: [] }))
      .then((data) => setSubmissions(data.submissions || []))
      .finally(() => setLoadingSubmissions(false));
  }, [authedEmail, tab, tenantFilter]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      setAuthedEmail(data.email);
    } catch {
      setError('Connection issue. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin-logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    setAuthedEmail(null);
    setRows([]);
  };

  const exportCsv = () => {
    const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['email', 'name', 'source', 'captured_at'];
    const lines = [
      header.join(','),
      ...rows.map((r) => [r.email, r.name || '', r.source || '', r.captured_at].map(escape).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swrv-email-list-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const submitTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTenantError('');
    const services = newServicesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    if (!/^[a-z0-9-]+$/.test(newSlug.trim()) || !newDisplayName.trim() || !newContactEmail.trim() || !services.length) {
      setAddTenantError('Slug (lowercase letters/numbers/dashes only), name, contact email, and at least one service are required.');
      return;
    }
    setAddTenantStatus('saving');
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newSlug.trim().toLowerCase(),
          displayName: newDisplayName.trim(),
          contactEmail: newContactEmail.trim(),
          services,
          colors: {
            ...(newColorPrimary ? { primary: newColorPrimary } : {}),
            ...(newColorAccent ? { accent: newColorAccent } : {}),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddTenantError(data.error || 'Failed to save tenant');
        setAddTenantStatus('idle');
        return;
      }
      setAddTenantStatus('saved');
      setNewSlug('');
      setNewDisplayName('');
      setNewContactEmail('');
      setNewServicesText('');
      setNewColorPrimary('');
      setNewColorAccent('');
      fetchTenants();
      window.setTimeout(() => setAddTenantStatus('idle'), 2000);
    } catch {
      setAddTenantError('Connection issue. Try again.');
      setAddTenantStatus('idle');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
        Loading…
      </div>
    );
  }

  if (!authedEmail) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans px-6">
        <form onSubmit={login} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1 tracking-tight">SWRV Admin</h1>
          <p className="text-white/40 text-sm mb-6">Sign in to manage your site.</p>

          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white outline-none focus:border-lion-orange"
            autoComplete="username"
            required
          />

          <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white outline-none focus:border-lion-orange"
            autoComplete="current-password"
            required
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-lion-orange font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-lion-orange transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">SWRV Admin</h1>
          <p className="text-white/40 text-sm">{authedEmail}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg border border-white/15 text-sm hover:border-lion-orange hover:text-lion-orange transition-all"
        >
          Log out
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-white/10">
        {(['emails', 'submissions', 'tenants'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-all ${
              tab === t ? 'border-lion-orange text-lion-orange' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'emails' ? 'Email list' : t === 'submissions' ? 'Vision submissions' : 'Tenants'}
          </button>
        ))}
      </div>

      {tab === 'emails' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-widest text-white/40">
              Email list {rows.length ? `(${rows.length})` : ''}
            </h2>
            {rows.length > 0 && (
              <button
                onClick={exportCsv}
                className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-medium hover:border-lion-orange hover:text-lion-orange transition-all"
              >
                Export CSV ↓
              </button>
            )}
          </div>
          {loadingRows ? (
            <p className="text-white/40 text-sm">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-white/40 text-sm">No emails captured yet.</p>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/10 last:border-0 text-sm">
                  <div>
                    <div className="font-medium">{r.email}</div>
                    {r.name && <div className="text-white/40 text-xs">{r.name}</div>}
                  </div>
                  <div className="text-white/30 text-xs text-right">
                    <div>{r.source}</div>
                    <div>{new Date(r.captured_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'submissions' && (
        <>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-sm uppercase tracking-widest text-white/40">
              Vision submissions {submissions.length ? `(${submissions.length})` : ''}
            </h2>
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white outline-none focus:border-lion-orange"
            >
              <option value="">All tenants</option>
              {tenants.map((t) => (
                <option key={t.slug} value={t.slug}>{t.display_name}</option>
              ))}
              {!tenants.find((t) => t.slug === 'swrv') && <option value="swrv">SWRV (default)</option>}
            </select>
          </div>
          {loadingSubmissions ? (
            <p className="text-white/40 text-sm">Loading…</p>
          ) : submissions.length === 0 ? (
            <p className="text-white/40 text-sm">No submissions yet.</p>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              {submissions.map((s) => (
                <div key={s.id} className="border-b border-white/10 last:border-0">
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-white/5 transition-all"
                  >
                    <div>
                      <div className="font-medium">{s.name || s.email || 'Anonymous'}</div>
                      <div className="text-white/40 text-xs">
                        {s.tenant_slug}
                        {s.email && s.name ? ` · ${s.email}` : ''}
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      <div className={!!s.escalated ? 'text-red-400 font-medium' : 'text-white/30'}>
                        {s.confidence_score != null ? `${s.confidence_score}% confidence` : 'no score'}
                        {!!s.escalated && ' · escalated'}
                      </div>
                      <div className="text-white/30">{new Date(s.created_at).toLocaleDateString()}</div>
                    </div>
                  </button>
                  {expandedId === s.id && (
                    <div className="px-4 pb-4 text-xs">
                      {s.raw_vision && (
                        <>
                          <div className="text-white/40 uppercase tracking-widest mb-1 mt-2">Raw vision</div>
                          <p className="text-white/70 whitespace-pre-wrap mb-3">{s.raw_vision}</p>
                        </>
                      )}
                      <div className="text-white/40 uppercase tracking-widest mb-1">Full AI output</div>
                      <pre className="text-white/60 whitespace-pre-wrap break-words bg-black/40 border border-white/10 rounded-lg p-3 max-h-80 overflow-auto">
                        {(() => {
                          try { return JSON.stringify(JSON.parse(s.result_json), null, 2); }
                          catch { return s.result_json; }
                        })()}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'tenants' && (
        <>
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-3">
            Client businesses {tenants.length ? `(${tenants.length})` : ''}
          </h2>
          {tenants.length === 0 ? (
            <p className="text-white/40 text-sm mb-6">No client businesses onboarded yet.</p>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden mb-8">
              {tenants.map((t) => (
                <div key={t.slug} className="flex items-center justify-between px-4 py-3 border-b border-white/10 last:border-0 text-sm">
                  <div>
                    <div className="font-medium">{t.display_name}</div>
                    <div className="text-white/40 text-xs">/vision/{t.slug} · {t.contact_email}</div>
                  </div>
                  <div className="text-white/30 text-xs">
                    {(() => { try { return JSON.parse(t.services_json).length; } catch { return 0; } })()} services
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-3">Add a client business</h2>
          <form onSubmit={submitTenant} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Slug (URL path — lowercase, dashes only)</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="coastal"
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-lion-orange"
              />
              {newSlug && <p className="text-white/30 text-xs mt-1">Link: swrvonthego.pro/vision/{newSlug.trim().toLowerCase()}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Business name</label>
              <input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Coastal Event Services"
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-lion-orange"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Contact email (for low-confidence escalations)</label>
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="team@coastaleventservices.com"
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-lion-orange"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Services (one per line)</label>
              <textarea
                value={newServicesText}
                onChange={(e) => setNewServicesText(e.target.value)}
                placeholder={'Pipe & Drape\nStaging\nAV Production'}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-lion-orange"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Primary color (optional)</label>
                <input
                  value={newColorPrimary}
                  onChange={(e) => setNewColorPrimary(e.target.value)}
                  placeholder="#0a3d62"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-lion-orange"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-1">Accent color (optional)</label>
                <input
                  value={newColorAccent}
                  onChange={(e) => setNewColorAccent(e.target.value)}
                  placeholder="#f6b93b"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-lion-orange"
                />
              </div>
            </div>

            {addTenantError && <p className="text-red-400 text-sm">{addTenantError}</p>}
            {addTenantStatus === 'saved' && <p className="text-green-400 text-sm">Saved — link is live now, no deploy needed.</p>}

            <button
              type="submit"
              disabled={addTenantStatus === 'saving'}
              className="w-full py-3 rounded-lg bg-lion-orange font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-lion-orange transition-all disabled:opacity-50"
            >
              {addTenantStatus === 'saving' ? 'Saving…' : 'Save client business'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
