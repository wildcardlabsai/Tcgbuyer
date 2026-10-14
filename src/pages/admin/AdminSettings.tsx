import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

interface PlatformSetting {
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string;
}

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase.from('platform_settings').select('*').order('key');
      if (err) {
        setError('Failed to load settings.');
        setLoading(false);
        return;
      }
      setSettings((data || []) as PlatformSetting[]);
      const init: Record<string, string> = {};
      (data || []).forEach((s: PlatformSetting) => {
        init[s.key] = JSON.stringify(s.value, null, 2);
      });
      setEdited(init);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    const errors: string[] = [];
    for (const setting of settings) {
      const raw = edited[setting.key];
      if (raw === undefined) continue;
      try {
        const parsed = JSON.parse(raw);
        const { error: err } = await supabase.from('platform_settings').update({ value: parsed }).eq('key', setting.key);
        if (err) errors.push(`${setting.key}: ${err.message}`);
      } catch {
        errors.push(`${setting.key}: invalid JSON`);
      }
    }
    setSaving(false);
    if (errors.length > 0) {
      setError(`Save errors: ${errors.join('; ')}`);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Platform Settings</h1>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px',
          borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
          border: 'none', background: 'var(--color-blue)', color: '#fff',
          cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
        }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem',
        }}>
          {error}
        </div>
      )}

      {saved && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '20px', color: '#166534', fontSize: '0.88rem',
        }}>
          Settings saved.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {settings.map(s => (
          <div key={s.key} style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <code style={{ fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{s.key}</code>
            </div>
            <textarea
              value={edited[s.key] || ''}
              onChange={e => setEdited(prev => ({ ...prev, [s.key]: e.target.value }))}
              rows={Math.min(8, Math.max(2, (edited[s.key] || '').split('\n').length + 1))}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)',
                fontSize: '0.82rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
