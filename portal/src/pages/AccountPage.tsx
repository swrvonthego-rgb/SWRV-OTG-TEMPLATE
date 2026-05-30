import { useState } from 'react';
import { User, Mail, Phone, Building, Save, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function AccountPage() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, company_name: companyName })
      .eq('id', profile?.id);
    if (error) setError(error.message);
    else { setSaved(true); await refreshProfile(); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
          <span className="gold">Account</span> Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Manage your profile and preferences.
        </p>
      </div>

      <div className="content-grid content-grid-2" style={{ gap: 20 }}>
        {/* Profile */}
        <div className="card card-accent fade-up delay-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)',
            }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{profile?.full_name || 'No name set'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{profile?.email}</div>
              <span className="badge badge-gold" style={{ marginTop: 4 }}>{profile?.role}</span>
            </div>
          </div>

          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          {saved && <div className="success-msg" style={{ marginBottom: 16 }}>Profile updated.</div>}

          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-input" style={{ paddingLeft: 34 }} value={fullName}
                  onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-input" style={{ paddingLeft: 34, opacity: 0.6, cursor: 'not-allowed' }}
                  value={profile?.email || ''} disabled />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-input" style={{ paddingLeft: 34 }} value={phone}
                  onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company / Brand Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-input" style={{ paddingLeft: 34 }} value={companyName}
                  onChange={e => setCompanyName(e.target.value)} placeholder="Your company or brand" />
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving} style={{ gap: 8 }}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Save size={15} />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card fade-up delay-2">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
              <div className="list-icon"><Shield size={16} /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Security</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Password changes and two-factor authentication settings will be available soon.
                </p>
              </div>
            </div>
            <button className="btn btn-outline btn-full" disabled style={{ opacity: 0.5 }}>
              Change Password (coming soon)
            </button>
          </div>

          <div className="card fade-up delay-3" style={{
            background: 'linear-gradient(135deg, rgba(200,168,75,0.06) 0%, transparent 60%)',
            border: '1px solid var(--border-hover)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em', marginBottom: 8 }}>
              Member Since
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', letterSpacing: '0.04em' }}>
              {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
              You've been on the road with SWRV since day one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
