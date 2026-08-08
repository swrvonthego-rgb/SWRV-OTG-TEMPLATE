import React, { useEffect, useState } from 'react';

interface EmailRow {
  email: string;
  name: string | null;
  source: string | null;
  captured_at: string;
}

export const AdminPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EmailRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

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
    </div>
  );
};
