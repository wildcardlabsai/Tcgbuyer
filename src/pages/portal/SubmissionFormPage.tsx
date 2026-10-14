import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DealerOrganisation } from '../../lib/database.types';
import { ArrowLeft } from 'lucide-react';

export const SubmissionFormPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<DealerOrganisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; token: string } | null>(null);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [cardCount, setCardCount] = useState('');
  const [estValue, setEstValue] = useState('');
  const [notes, setNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dealer_organisations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();
      if (data) setOrg(data as DealerOrganisation);
      setLoading(false);
    }
    load();
  }, [slug]);

  function toggleCategory(cat: string) {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    if (categories.length === 0) { setError('Select at least one card category.'); return; }

    setError('');
    setSubmitting(true);

    const { data, error: err } = await supabase
      .from('customer_submissions')
      .insert({
        organisation_id: org.id,
        customer_name: name.trim(),
        customer_email: email.trim().toLowerCase(),
        customer_phone: phone.trim() || null,
        description: description.trim() || null,
        tcg_categories: categories,
        estimated_card_count: cardCount ? parseInt(cardCount) : null,
        estimated_value: estValue.trim() || null,
        customer_notes: notes.trim() || null,
        agreed_to_terms: agreedTerms,
      })
      .select('reference, access_token')
      .single();

    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else if (data) {
      setSuccess({ reference: data.reference, token: data.access_token });
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!org) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <p style={{ color: '#6b7280' }}>Dealer portal not found.</p>
      </div>
    );
  }

  const primary = org.portal_primary_color || '#1e3a5f';
  const accent = org.portal_accent_color || '#2563eb';

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ background: primary, padding: '24px 16px', color: '#fff' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{org.name}</h1>
          </div>
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '1.8rem', color: '#16a34a',
          }}>&#10003;</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Submission Received</h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Your reference number is <strong>{success.reference}</strong>. We&rsquo;ll review your submission and get back to you.
          </p>
          <Link
            to={`/portal/${slug}/status/${success.token}`}
            style={{
              display: 'inline-block', padding: '12px 28px', background: accent,
              color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none',
            }}
          >
            Check Status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: primary, padding: '24px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to={`/portal/${slug}`} style={{ color: '#fff', display: 'flex' }}><ArrowLeft size={20} /></Link>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{org.name} &mdash; Submit Collection</h1>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
        {org.submission_instructions && (
          <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', fontSize: '0.88rem', color: '#1e40af', lineHeight: 1.6 }}>
            {org.submission_instructions}
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Your Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your name" />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="you@email.com" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Collection Details</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Card categories *</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(org.supported_tcg_categories?.length > 0 ? org.supported_tcg_categories : ['Pokemon', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Sports Cards', 'Other']).map(cat => (
                  <button
                    key={cat} type="button" onClick={() => toggleCategory(cat)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500,
                      border: categories.includes(cat) ? `2px solid ${accent}` : '1px solid #e2e8f0',
                      background: categories.includes(cat) ? `${accent}10` : '#fff',
                      color: categories.includes(cat) ? accent : '#475569',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }}
                placeholder="Brief description of your collection..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Estimated card count</label>
                <input type="number" min="1" value={cardCount} onChange={e => setCardCount(e.target.value)} style={inputStyle} placeholder="e.g. 500" />
              </div>
              <div>
                <label style={labelStyle}>Estimated value</label>
                <input type="text" value={estValue} onChange={e => setEstValue(e.target.value)} style={inputStyle} placeholder="e.g. $500-$1000" />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={labelStyle}>Additional notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                style={{ ...inputStyle, resize: 'vertical' as const }}
                placeholder="Anything else we should know..."
              />
            </div>
          </div>

          {org.customer_terms && (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px' }}>Terms</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, marginBottom: '12px' }}>{org.customer_terms}</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} />
                I agree to the terms above
              </label>
            </div>
          )}

          <button type="submit" disabled={submitting || (!!org.customer_terms && !agreedTerms)} style={{
            width: '100%', padding: '14px', background: accent, color: '#fff',
            border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700,
            cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit',
            opacity: (submitting || (!!org.customer_terms && !agreedTerms)) ? 0.6 : 1,
          }}>
            {submitting ? 'Submitting...' : 'Submit Collection'}
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
  fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
