import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DealerOrganisation } from '../../lib/database.types';
import { ArrowLeft, Upload, X } from 'lucide-react';

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const validFiles = files.slice(0, remaining).filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        setError(`${f.name} exceeds the 10MB size limit.`);
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(f.type)) {
        setError(`${f.name} is not a supported image format (JPEG, PNG, WebP, HEIC).`);
        return false;
      }
      return true;
    });

    setPhotos(prev => [...prev, ...validFiles]);
    validFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
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
      .select('id, reference, access_token')
      .single();

    if (err) {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
      return;
    }

    if (data && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${org.id}/${data.id}/${i}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('submission-photos')
          .upload(path, file, { contentType: file.type });

        if (!uploadErr) {
          await supabase.from('submission_photos').insert({
            submission_id: data.id,
            storage_path: path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            sort_order: i,
          });
        }
      }
    }

    setSubmitting(false);
    if (data) {
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
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+44 7700 000000" />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Collection Details</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Card categories *</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(org.supported_tcg_categories?.length > 0 ? org.supported_tcg_categories : ['Pokémon', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Other']).map(cat => (
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
                <input type="text" value={estValue} onChange={e => setEstValue(e.target.value)} style={inputStyle} placeholder="e.g. £500-£1000" />
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

          {/* Photo upload */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Photos (optional)</h2>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '16px' }}>
              Upload up to {MAX_PHOTOS} photos of your collection. JPEG, PNG, WebP or HEIC, max 10MB each.
            </p>

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                  borderRadius: '8px', border: '2px dashed #d1d5db', background: '#f9fafb',
                  color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
                  fontWeight: 500, width: '100%', justifyContent: 'center',
                }}
              >
                <Upload size={18} /> Add Photos ({photos.length}/{MAX_PHOTOS})
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />

            {photoPreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '16px' }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                        borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
                        color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
