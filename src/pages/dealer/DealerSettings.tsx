import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export const DealerSettings: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function handleSaveProfile() {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    await supabase.from('profiles').update({ full_name: fullName || null, phone: phone || null }).eq('id', profile.id);
    await refreshProfile();
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleChangePassword() {
    setPasswordError('');
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Settings</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        {/* Profile */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Profile</h2>
          {saved && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#166534', fontSize: '0.85rem' }}>
              Profile saved.
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={profile?.email || ''} disabled style={{ ...inputStyle, background: '#f9fafb', cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px',
            borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
            border: 'none', background: 'var(--color-blue)', color: '#fff',
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
          }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Password */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Change Password</h2>
          {passwordError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '0.85rem' }}>
              {passwordError}
            </div>
          )}
          {passwordSaved && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#166534', fontSize: '0.85rem' }}>
              Password updated.
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>New password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="At least 8 characters" />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Confirm new password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Repeat new password" />
          </div>
          <button onClick={handleChangePassword} disabled={passwordSaving} style={{
            padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
            border: '1px solid var(--color-border)', background: '#fff', cursor: passwordSaving ? 'wait' : 'pointer',
            fontFamily: 'inherit', opacity: passwordSaving ? 0.7 : 1,
          }}>
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
  fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
