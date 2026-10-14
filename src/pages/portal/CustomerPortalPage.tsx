import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DealerOrganisation } from '../../lib/database.types';
import { Logo } from '../../components/Logo';

export const CustomerPortalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<DealerOrganisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dealer_organisations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (data) {
        setOrg(data as DealerOrganisation);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (notFound || !org) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <Logo height={28} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '24px', marginBottom: '8px' }}>Portal Not Found</h1>
          <p style={{ color: '#6b7280', fontSize: '0.92rem', marginBottom: '24px' }}>
            This dealer portal doesn&rsquo;t exist or is no longer active.
          </p>
          <Link to="/" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.88rem' }}>Go to TCGBuyer</Link>
        </div>
      </div>
    );
  }

  const primary = org.portal_primary_color || '#1e3a5f';
  const accent = org.portal_accent_color || '#2563eb';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: primary, padding: '48px 16px', textAlign: 'center', color: '#fff' }}>
        {org.portal_logo_url ? (
          <img src={org.portal_logo_url} alt={org.name} style={{ height: '48px', marginBottom: '16px' }} />
        ) : (
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>{org.name}</h1>
        )}
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          {org.portal_headline || 'We buy trading card collections'}
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 16px' }}>
        {org.portal_description && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#334155' }}>{org.portal_description}</p>
          </div>
        )}

        {org.purchasing_info && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: primary }}>How It Works</h2>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#475569' }}>{org.purchasing_info}</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link
            to={`/portal/${slug}/submit`}
            style={{
              display: 'inline-block', padding: '14px 40px', background: accent,
              color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', transition: 'opacity 0.15s',
            }}
          >
            Submit Your Collection
          </Link>
        </div>

        {org.supported_tcg_categories?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: primary }}>We Buy</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {org.supported_tcg_categories.map(cat => (
                <span key={cat} style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem',
                  fontWeight: 500, background: '#f1f5f9', color: '#334155',
                }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {(org.contact_email || org.contact_phone) && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: primary }}>Contact Us</h3>
            {org.contact_email && <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '4px' }}>Email: {org.contact_email}</p>}
            {org.contact_phone && <p style={{ fontSize: '0.88rem', color: '#475569' }}>Phone: {org.contact_phone}</p>}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '48px', color: '#94a3b8', fontSize: '0.78rem' }}>
          Powered by <Link to="/" style={{ color: '#64748b', fontWeight: 600 }}>TCGBuyer</Link>
        </div>
      </div>
    </div>
  );
};
