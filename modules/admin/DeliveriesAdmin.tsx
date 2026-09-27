import React, { useEffect, useState } from 'react';

interface DeliveryRow {
  id: number;
  token: string;
  client_name: string;
  client_email: string | null;
  title: string;
  amount_due_cents: number;
  status: string;
  paid_at: string | null;
  responses: number;
  created_at: string;
  response_list?: { at: string; emailed: boolean; answers: { question: string; answer: string }[] }[];
}

const field = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-lion-orange/60';

// /admin → Deliveries: make a client's private delivery link
// (/delivered/<token>) and see who has responded or paid.
export function DeliveriesAdmin() {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', title: '', message: '', driveUrl: '', rawUrl: '', amountDue: '', lineDescription: '' });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState('');
  const [error, setError] = useState('');

  const load = () => fetch('/api/admin/deliveries', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : { deliveries: [] }))
    .then((d) => setRows(d.deliveries || []));
  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setError(''); setCreated('');
    try {
      const res = await fetch('/api/admin/deliveries', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the link');
      setCreated(data.url);
      setForm({ clientName: '', clientEmail: '', title: '', message: '', driveUrl: '', rawUrl: '', amountDue: '', lineDescription: '' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const link = (t: string) => `https://swrvonthego.pro/delivered/${t}`;

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-xl border border-white/10 p-4 space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-white/40">New delivery link</h2>
        <p className="text-white/30 text-xs">One private page for a finished job: your note, the Drive link, raw footage, "post it for me", requests, and a pay button. Send the link to the client.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={field} placeholder="Client name *" value={form.clientName} onChange={set('clientName')} />
          <input className={field} placeholder="Client email (for the receipt)" type="email" value={form.clientEmail} onChange={set('clientEmail')} />
          <input className={field} placeholder="Title *, e.g. On The Go — 10 edited pieces" value={form.title} onChange={set('title')} />
          <input className={field} placeholder="Amount due in $ (0 if nothing)" inputMode="decimal" value={form.amountDue} onChange={set('amountDue')} />
          <input className={field} placeholder="Google Drive link to the work" value={form.driveUrl} onChange={set('driveUrl')} />
          <input className={field} placeholder="Raw footage link (optional)" value={form.rawUrl} onChange={set('rawUrl')} />
        </div>
        <input className={field} placeholder="What the payment is for (shows on the page and receipt)" value={form.lineDescription} onChange={set('lineDescription')} />
        <textarea className={field} rows={4} placeholder="Personal note shown at the top" value={form.message} onChange={set('message')} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {created && (
          <p className="text-sm text-green-400 break-all">Link ready: <a className="underline" href={created} target="_blank" rel="noreferrer">{created}</a></p>
        )}
        <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-lion-orange text-black text-sm font-semibold disabled:opacity-50">
          {creating ? 'Creating…' : 'Create link'}
        </button>
      </form>

      <div className="rounded-xl border border-white/10">
        {rows.length === 0 && <p className="p-4 text-white/30 text-sm">No deliveries yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="px-4 py-3 border-b border-white/10 last:border-0 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium">{r.client_name} · {r.title}</div>
                <div className="text-white/40 text-xs truncate">
                  <a className="underline" href={link(r.token)} target="_blank" rel="noreferrer">{link(r.token)}</a>
                </div>
              </div>
              <div className="text-xs text-right shrink-0">
                <div className="text-white/70">${(r.amount_due_cents / 100).toFixed(2)}</div>
                <div className={`uppercase tracking-widest text-[10px] mt-0.5 ${r.status === 'paid' ? 'text-green-400' : 'text-lion-orange'}`}>{r.status}</div>
                <div className="text-white/30 mt-0.5">{r.responses} response{r.responses === 1 ? '' : 's'}</div>
              </div>
            </div>
            {r.response_list?.map((resp, i) => (
              <div key={i} className="mt-3 rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
                  {resp.at} UTC · {resp.emailed ? 'emailed to you' : 'email pending, retrying hourly'}
                </div>
                {resp.answers.map((a, j) => (
                  <div key={j} className="text-xs mb-1.5"><span className="text-white/40">{a.question}: </span><span className="text-white/80 whitespace-pre-wrap">{a.answer}</span></div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
