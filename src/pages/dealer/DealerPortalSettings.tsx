import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, ExternalLink } from 'lucide-react';

export const DealerPortalSettings: React.FC = () => {
  const { organisation, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [headline, setHeadline] = useState(organisation?.portal_headline || '');
  const [description, setDescription] = useState(organisation?.portal_description || '');
  const [primaryColor, setPrimaryColor] = useState(organisation?.portal_primary_color || '#1e3a5f');
  const [accentColor, setAccentColor] = useState(organisation?.portal_accent_color || '#2563eb');
  const [contactEmail, setContactEmail] = useState(organisation?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(organisation?.contact_phone || '');
  const [instructions, setInstructions] = useState(organisation?.submission_instructions || '');
  const [purchasingInfo, setPurchasingInfo] = useState(organisation?.purchasing_info || '');
  const [customerTerms, setCustomerTerms] = useState(organisation?.customer_terms || '');

  async function handleSave() {
    if (!organisation) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('dealer_organisations')
      .update({
        portal_headline: headline || null,
        portal_description: description || null,
        portal_primary_color: primaryColor,
        portal_accent_color: accentColor,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        submission_instructions: instructions || null,
        purchasing_info: purchasingInfo || null,
        customer_terms: customerTerms || null,
      })
      .eq('id', organisation.id);

    if (!error) {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (!organisation) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No organisation found.</div>;
  }

  const portalUrl = `${window.location.origin}/portal/${organisation.slug}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Portal Settings</h1>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px',
          borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
          border: 'none', background: 'var(--color-blue)', color: '#fff',
          cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
        }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '20px', color: '#166534', fontSize: '0.88rem',
        }}>Portal settings saved.</div>
      )}

      <div style={{ background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0369a1' }}>Your portal URL</span>
          <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            <code style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>{portalUrl}</code>
          </div>
        </div>
        <a href={portalUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1', fontSize: '0.82rem', fontWeight: 600 }}>
          Preview <ExternalLink size={14} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Branding</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Portal headline</label>
            <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} style={inputStyle} placeholder="Sell us your cards!" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Portal description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Tell customers about your buying service..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Primary color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer' }} />
                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Accent color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer' }} />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Contact & Info</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Contact email</label>
            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={inputStyle} placeholder="buying@yourstore.com" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Contact phone</label>
            <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={inputStyle} placeholder="+1 (555) 000-0000" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Submission instructions</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Instructions for customers submitting cards..." />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Purchasing info</label>
            <textarea value={purchasingInfo} onChange={e => setPurchasingInfo(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="How your buying process works..." />
          </div>
          <div>
            <label style={labelStyle}>Customer terms</label>
            <textarea value={customerTerms} onChange={e => setCustomerTerms(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Terms and conditions for submissions..." />
          </div>
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
