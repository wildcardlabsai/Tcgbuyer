import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { CustomerSubmission, Offer } from '../../lib/database.types';
import { ArrowLeft, Send, DollarSign } from 'lucide-react';

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: '#dbeafe', color: '#1e40af', label: 'Submitted' },
  under_review: { bg: '#fef3c7', color: '#92400e', label: 'Under Review' },
  awaiting_info: { bg: '#f3e8ff', color: '#7c3aed', label: 'Awaiting Info' },
  offer_prepared: { bg: '#e0e7ff', color: '#3730a3', label: 'Offer Prepared' },
  offer_sent: { bg: '#fef3c7', color: '#92400e', label: 'Offer Sent' },
  offer_accepted: { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  offer_declined: { bg: '#fee2e2', color: '#991b1b', label: 'Declined' },
  purchase_arranging: { bg: '#fef3c7', color: '#92400e', label: 'Arranging Purchase' },
  completed: { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
};

export const DealerSubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, organisation } = useAuth();
  const [submission, setSubmission] = useState<CustomerSubmission | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [dealerNotes, setDealerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!organisation) { setLoading(false); return; }
      const [subRes, offersRes] = await Promise.all([
        supabase.from('customer_submissions').select('*').eq('id', id).eq('organisation_id', organisation.id).single(),
        supabase.from('offers').select('*').eq('submission_id', id).eq('organisation_id', organisation.id).order('created_at', { ascending: false }),
      ]);
      if (subRes.data) {
        const s = subRes.data as CustomerSubmission;
        setSubmission(s);
        setDealerNotes(s.dealer_notes || '');
      }
      setOffers((offersRes.data || []) as Offer[]);
      setLoading(false);
    }
    load();
  }, [id, organisation]);

  async function updateStatus(status: string) {
    if (!submission) return;
    setActionLoading(true);
    const { error } = await supabase.from('customer_submissions').update({ status, dealer_notes: dealerNotes || null }).eq('id', submission.id);
    if (!error) setSubmission(prev => prev ? { ...prev, status: status as CustomerSubmission['status'] } : null);
    setActionLoading(false);
  }

  async function createOffer() {
    if (!submission || !organisation || !user) return;
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) return;

    setActionLoading(true);
    const { data, error } = await supabase
      .from('offers')
      .insert({
        submission_id: submission.id,
        organisation_id: organisation.id,
        amount,
        dealer_message: offerMessage || null,
        status: 'draft',
        revision_number: offers.length + 1,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setOffers(prev => [data as Offer, ...prev]);
      await supabase.from('customer_submissions').update({ status: 'offer_prepared' }).eq('id', submission.id);
      setSubmission(prev => prev ? { ...prev, status: 'offer_prepared' as CustomerSubmission['status'] } : null);
      setShowOfferForm(false);
      setOfferAmount('');
      setOfferMessage('');
    }
    setActionLoading(false);
  }

  async function sendOffer(offer: Offer) {
    setActionLoading(true);
    const { error } = await supabase.from('offers').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', offer.id);
    if (!error) {
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'sent' as Offer['status'], sent_at: new Date().toISOString() } : o));
      await supabase.from('customer_submissions').update({ status: 'offer_sent' }).eq('id', submission!.id);
      setSubmission(prev => prev ? { ...prev, status: 'offer_sent' as CustomerSubmission['status'] } : null);
    }
    setActionLoading(false);
  }

  async function saveNotes() {
    if (!submission) return;
    await supabase.from('customer_submissions').update({ dealer_notes: dealerNotes || null }).eq('id', submission.id);
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;
  if (!submission) return <div style={{ padding: '40px', textAlign: 'center' }}><p>Submission not found.</p></div>;

  const sc = statusColors[submission.status] || { bg: '#f3f4f6', color: '#374151', label: submission.status };

  return (
    <div>
      <Link to="/app/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to submissions
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{submission.customer_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{submission.reference}</span>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{sc.label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {submission.status === 'submitted' && (
            <button onClick={() => updateStatus('under_review')} disabled={actionLoading} style={actionBtnStyle}>Mark Under Review</button>
          )}
          {['submitted', 'under_review'].includes(submission.status) && (
            <button onClick={() => setShowOfferForm(true)} disabled={actionLoading} style={{ ...actionBtnStyle, background: 'var(--color-blue)', color: '#fff', border: 'none' }}>
              <DollarSign size={16} /> Create Offer
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Submission Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Customer" value={submission.customer_name} />
              <Field label="Email" value={submission.customer_email} />
              <Field label="Phone" value={submission.customer_phone} />
              <Field label="Est. Card Count" value={submission.estimated_card_count?.toString()} />
              <Field label="Est. Value" value={submission.estimated_value} />
            </div>
            {submission.tcg_categories?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Categories</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {submission.tcg_categories.map(c => (
                    <span key={c} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', background: '#f1f5f9', color: '#475569' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
            {submission.description && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</span>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{submission.description}</p>
              </div>
            )}
            {submission.customer_notes && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Customer Notes</span>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{submission.customer_notes}</p>
              </div>
            )}
          </div>

          {/* Offers */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Offers</h2>
            {offers.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No offers yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>£{offer.amount.toLocaleString()}</span>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                        background: offer.status === 'sent' ? '#fef3c7' : offer.status === 'accepted' ? '#dcfce7' : offer.status === 'declined' ? '#fee2e2' : '#f3f4f6',
                        color: offer.status === 'sent' ? '#92400e' : offer.status === 'accepted' ? '#166534' : offer.status === 'declined' ? '#991b1b' : '#6b7280',
                      }}>
                        {offer.status}
                      </span>
                    </div>
                    {offer.dealer_message && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{offer.dealer_message}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Rev {offer.revision_number} &middot; {new Date(offer.created_at).toLocaleDateString()}
                      </span>
                      {offer.status === 'draft' && (
                        <button onClick={() => sendOffer(offer)} disabled={actionLoading} style={{
                          display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px',
                          borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: 'none',
                          background: 'var(--color-blue)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                          <Send size={12} /> Send to customer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px' }}>Dealer Notes</h3>
            <textarea
              value={dealerNotes} onChange={e => setDealerNotes(e.target.value)}
              rows={5}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)',
                fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="Internal notes..."
            />
            <button onClick={saveNotes} style={{
              marginTop: '8px', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
              border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}>Save</button>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px' }}>Timeline</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>Submitted: {new Date(submission.created_at).toLocaleString()}</div>
              <div>Updated: {new Date(submission.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create offer modal */}
      {showOfferForm && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setShowOfferForm(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', zIndex: 101,
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Create Offer</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Amount (£)</label>
              <input
                type="number" step="0.01" min="0" value={offerAmount} onChange={e => setOfferAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                placeholder="0.00"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Message to customer (optional)</label>
              <textarea
                value={offerMessage} onChange={e => setOfferMessage(e.target.value)} rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Details about the offer..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowOfferForm(false)} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancel</button>
              <button onClick={createOffer} disabled={actionLoading || !offerAmount} style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                border: 'none', background: 'var(--color-blue)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                opacity: (actionLoading || !offerAmount) ? 0.6 : 1,
              }}>Create Offer</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div>
    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>{label}</span>
    <span style={{ fontSize: '0.88rem', color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{value || '—'}</span>
  </div>
);

const actionBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
  borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  border: '1px solid var(--color-border)', background: '#fff', fontFamily: 'inherit',
};
