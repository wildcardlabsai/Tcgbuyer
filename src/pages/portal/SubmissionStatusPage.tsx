import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DealerOrganisation, CustomerSubmission, Offer } from '../../lib/database.types';

const statusDisplay: Record<string, { label: string; color: string; bg: string; description: string }> = {
  submitted: { label: 'Submitted', color: '#1e40af', bg: '#dbeafe', description: 'Your submission has been received and is awaiting review.' },
  under_review: { label: 'Under Review', color: '#92400e', bg: '#fef3c7', description: 'A dealer is currently reviewing your collection.' },
  awaiting_info: { label: 'More Info Needed', color: '#7c3aed', bg: '#f3e8ff', description: 'The dealer needs more information from you.' },
  offer_prepared: { label: 'Offer Being Prepared', color: '#3730a3', bg: '#e0e7ff', description: 'An offer is being prepared for your collection.' },
  offer_sent: { label: 'Offer Available', color: '#b45309', bg: '#fef3c7', description: 'An offer is ready for your review.' },
  offer_accepted: { label: 'Offer Accepted', color: '#166534', bg: '#dcfce7', description: 'You accepted the offer. The dealer will arrange the purchase.' },
  offer_declined: { label: 'Offer Declined', color: '#991b1b', bg: '#fee2e2', description: 'You declined the offer.' },
  purchase_arranging: { label: 'Arranging Purchase', color: '#92400e', bg: '#fef3c7', description: 'The dealer is arranging the purchase of your collection.' },
  completed: { label: 'Completed', color: '#065f46', bg: '#d1fae5', description: 'The transaction is complete.' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#f3f4f6', description: 'This submission has been cancelled.' },
};

export const SubmissionStatusPage: React.FC = () => {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const [org, setOrg] = useState<DealerOrganisation | null>(null);
  const [submission, setSubmission] = useState<CustomerSubmission | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    async function load() {
      const [orgRes, subRes] = await Promise.all([
        supabase.from('dealer_organisations').select('*').eq('slug', slug).single(),
        supabase.rpc('get_submission_by_token', { p_token: token }),
      ]);

      if (orgRes.data) setOrg(orgRes.data as DealerOrganisation);

      const subData = Array.isArray(subRes.data) ? subRes.data[0] : subRes.data;
      if (subData) {
        const s = subData as CustomerSubmission;
        if (orgRes.data && s.organisation_id !== (orgRes.data as DealerOrganisation).id) {
          setLoading(false);
          return;
        }
        setSubmission(s);
        const { data: offersData } = await supabase.rpc('get_offers_by_token', { p_token: token!, p_status: 'sent' });
        setOffers((offersData || []) as Offer[]);
      }
      setLoading(false);
    }
    load();
  }, [slug, token]);

  async function respondToOffer(offerId: string, accept: boolean) {
    setActionLoading(true);
    setActionError('');

    const { error } = await supabase.rpc('respond_to_offer', {
      p_token: token!,
      p_offer_id: offerId,
      p_accept: accept,
      p_notes: responseNotes || null,
    });

    if (error) {
      setActionError(`Failed to respond: ${error.message}`);
    } else {
      setSubmission(prev => prev ? { ...prev, status: (accept ? 'offer_accepted' : 'offer_declined') as CustomerSubmission['status'] } : null);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: (accept ? 'accepted' : 'declined') as Offer['status'] } : o));
    }
    setActionLoading(false);
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!submission || !org) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Submission Not Found</h1>
          <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const primary = org.portal_primary_color || '#1e3a5f';
  const accent = org.portal_accent_color || '#2563eb';
  const status = statusDisplay[submission.status] || { label: submission.status, color: '#374151', bg: '#f3f4f6', description: '' };
  const pendingOffers = offers.filter(o => o.status === 'sent');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: primary, padding: '24px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{org.name}</h1>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Reference</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{submission.reference}</div>
            </div>
            <span style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem',
              fontWeight: 600, background: status.bg, color: status.color,
            }}>
              {status.label}
            </span>
          </div>
          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>{status.description}</p>
        </div>

        {actionError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem',
          }}>
            {actionError}
          </div>
        )}

        {/* Pending offer */}
        {pendingOffers.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '12px', border: `2px solid ${accent}`, padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: primary }}>Offer</h2>
            {pendingOffers.map(offer => (
              <div key={offer.id}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: primary, marginBottom: '8px' }}>
                  £{offer.amount.toLocaleString()} <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#6b7280' }}>{offer.currency}</span>
                </div>
                {offer.dealer_message && (
                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px' }}>{offer.dealer_message}</p>
                )}
                {offer.expires_at && (
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '16px' }}>
                    Expires: {new Date(offer.expires_at).toLocaleDateString()}
                  </p>
                )}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Response notes (optional)</label>
                  <textarea
                    value={responseNotes} onChange={e => setResponseNotes(e.target.value)} rows={2}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    placeholder="Any questions or comments..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => respondToOffer(offer.id, false)} disabled={actionLoading} style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700,
                    border: '1px solid #fca5a5', background: '#fff', color: '#dc2626',
                    cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
                  }}>Decline</button>
                  <button onClick={() => respondToOffer(offer.id, true)} disabled={actionLoading} style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700,
                    border: 'none', background: '#16a34a', color: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
                  }}>Accept Offer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submission details */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Your Submission</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>Name</span>
              <div>{submission.customer_name}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>Submitted</span>
              <div>{new Date(submission.created_at).toLocaleDateString()}</div>
            </div>
            {submission.tcg_categories?.length > 0 && (
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Categories</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {submission.tcg_categories.map(c => (
                    <span key={c} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', background: '#f1f5f9', color: '#475569' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px', color: '#94a3b8', fontSize: '0.78rem' }}>
          Powered by <Link to="/" style={{ color: '#64748b', fontWeight: 600 }}>TCGBuyer</Link>
        </div>
      </div>
    </div>
  );
};
