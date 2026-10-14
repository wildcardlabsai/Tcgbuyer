import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { DealerApplication } from '../../lib/database.types';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: '#f3f4f6', color: '#6b7280', label: 'Draft' },
  submitted: { bg: '#dbeafe', color: '#1e40af', label: 'Submitted' },
  under_review: { bg: '#fef3c7', color: '#92400e', label: 'Under Review' },
  info_requested: { bg: '#f3e8ff', color: '#7c3aed', label: 'Info Requested' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  withdrawn: { bg: '#f3f4f6', color: '#6b7280', label: 'Withdrawn' },
};

export const AdminApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState<DealerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [rejectionReasonInternal, setRejectionReasonInternal] = useState('');
  const [rejectionReasonApplicant, setRejectionReasonApplicant] = useState('');
  const [infoRequestMessage, setInfoRequestMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('dealer_applications')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setLoading(false);
        return;
      }
      if (data) {
        const a = data as DealerApplication;
        setApp(a);
        setInternalNotes(a.internal_notes || '');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string, extra: Record<string, unknown> = {}) {
    if (!app || !user) return;
    setActionLoading(true);
    setActionError('');
    const { error } = await supabase
      .from('dealer_applications')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        internal_notes: internalNotes || null,
        ...extra,
      })
      .eq('id', app.id);

    if (error) {
      setActionError(`Failed to update status: ${error.message}`);
    } else {
      setApp(prev => prev ? { ...prev, status: status as DealerApplication['status'], ...extra } as DealerApplication : null);
    }
    setActionLoading(false);
  }

  async function handleApprove() {
    if (!app || !user) return;
    setActionLoading(true);
    setActionError('');

    const { data, error } = await supabase.rpc('approve_dealer_application', {
      p_application_id: app.id,
      p_admin_id: user.id,
    });

    if (error) {
      setActionError(`Approval failed: ${error.message}`);
    } else {
      setApp(prev => prev ? { ...prev, status: 'approved' as DealerApplication['status'] } : null);
    }
    setActionLoading(false);
  }

  async function handleReject() {
    await updateStatus('rejected', {
      rejection_reason_internal: rejectionReasonInternal || null,
      rejection_reason_applicant: rejectionReasonApplicant || null,
    });
    setShowRejectModal(false);
  }

  async function handleRequestInfo() {
    await updateStatus('info_requested', {
      info_request_message: infoRequestMessage || null,
    });
    setShowInfoModal(false);
  }

  async function handleMarkUnderReview() {
    await updateStatus('under_review');
  }

  async function saveNotes() {
    if (!app) return;
    const { error } = await supabase
      .from('dealer_applications')
      .update({ internal_notes: internalNotes || null })
      .eq('id', app.id);
    if (error) setActionError(`Failed to save notes: ${error.message}`);
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;
  }

  if (!app) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Application not found.</p>
        <Link to="/admin/applications" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Back to applications</Link>
      </div>
    );
  }

  const sc = statusColors[app.status] || { bg: '#f3f4f6', color: '#374151', label: app.status };
  const canReview = ['submitted', 'under_review', 'info_requested'].includes(app.status);

  return (
    <div>
      <Link to="/admin/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to applications
      </Link>

      {actionError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', color: '#dc2626', fontSize: '0.88rem',
        }}>
          {actionError}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{app.business_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{app.reference}</span>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem',
              fontWeight: 600, background: sc.bg, color: sc.color,
            }}>
              {sc.label}
            </span>
          </div>
        </div>

        {canReview && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {app.status === 'submitted' && (
              <button onClick={handleMarkUnderReview} disabled={actionLoading} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                border: '1px solid var(--color-border)', background: '#fff', color: 'var(--color-text)',
                fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
              }}>
                <Eye size={16} /> Mark Under Review
              </button>
            )}
            <button onClick={() => setShowInfoModal(true)} disabled={actionLoading} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              border: '1px solid #c084fc', background: '#faf5ff', color: '#7c3aed',
              fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
            }}>
              <MessageSquare size={16} /> Request Info
            </button>
            <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626',
              fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
            }}>
              <XCircle size={16} /> Reject
            </button>
            <button onClick={handleApprove} disabled={actionLoading} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              border: 'none', background: '#16a34a', color: '#fff',
              fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1,
            }}>
              <CheckCircle size={16} /> Approve
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }} className="dashboard-columns">
        {/* Main info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Business Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Business name" value={app.business_name} />
              <Field label="Applicant" value={app.applicant_name} />
              <Field label="Email" value={app.email} />
              <Field label="Phone" value={app.phone} />
              <Field label="Country" value={app.country} />
              <Field label="Business type" value={app.business_type} />
              <Field label="Address" value={app.business_address} span />
              {app.website_url && <Field label="Website" value={app.website_url} link />}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Business Details</h2>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TCG Categories</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {(app.tcg_categories || []).map(cat => (
                  <span key={cat} style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem',
                    fontWeight: 500, background: '#f1f5f9', color: '#475569',
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <Field label="Physical shop" value={app.has_physical_shop ? 'Yes' : 'No'} />
              <Field label="Online shop" value={app.has_online_shop ? 'Yes' : 'No'} />
              <Field label="Monthly purchase volume" value={app.estimated_monthly_purchases} />
            </div>
            {app.business_description && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</span>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{app.business_description}</p>
              </div>
            )}
          </div>

          {app.additional_info_response && (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Additional Information Response</h2>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{app.additional_info_response}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px' }}>Timeline</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>Applied: {new Date(app.created_at).toLocaleString()}</div>
              {app.reviewed_at && <div>Reviewed: {new Date(app.reviewed_at).toLocaleString()}</div>}
              {app.agreed_at && <div>Terms agreed: {new Date(app.agreed_at).toLocaleString()}</div>}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '20px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px' }}>Internal Notes</h3>
            <textarea
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              rows={5}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)',
                fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="Add internal notes..."
            />
            <button onClick={saveNotes} style={{
              marginTop: '8px', padding: '6px 14px', borderRadius: '6px',
              fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--color-border)',
              background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Save notes
            </button>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <Modal title="Reject Application" onClose={() => setShowRejectModal(false)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Reason (internal)</label>
            <textarea
              value={rejectionReasonInternal} onChange={e => setRejectionReasonInternal(e.target.value)}
              rows={3} style={textareaStyle} placeholder="Internal reason for rejection..."
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Message to applicant (optional)</label>
            <textarea
              value={rejectionReasonApplicant} onChange={e => setRejectionReasonApplicant(e.target.value)}
              rows={3} style={textareaStyle} placeholder="This will be visible to the applicant..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowRejectModal(false)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleReject} disabled={actionLoading} style={{
              ...actionBtnStyle, background: '#dc2626', opacity: actionLoading ? 0.6 : 1,
            }}>
              Reject Application
            </button>
          </div>
        </Modal>
      )}

      {/* Info request modal */}
      {showInfoModal && (
        <Modal title="Request More Information" onClose={() => setShowInfoModal(false)}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Message to applicant</label>
            <textarea
              value={infoRequestMessage} onChange={e => setInfoRequestMessage(e.target.value)}
              rows={4} style={textareaStyle} placeholder="What additional information do you need?"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowInfoModal(false)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleRequestInfo} disabled={actionLoading || !infoRequestMessage.trim()} style={{
              ...actionBtnStyle, background: '#7c3aed', opacity: (actionLoading || !infoRequestMessage.trim()) ? 0.6 : 1,
            }}>
              Send Request
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string | null | undefined; span?: boolean; link?: boolean }> = ({ label, value, span, link }) => (
  <div style={span ? { gridColumn: 'span 2' } : undefined}>
    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>{label}</span>
    {link && value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--color-blue)' }}>{value}</a>
    ) : (
      <span style={{ fontSize: '0.88rem', color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{value || '—'}</span>
    )}
  </div>
);

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <>
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={onClose} />
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
      zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>{title}</h2>
      {children}
    </div>
  </>
);

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)',
  fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
  border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
};

const actionBtnStyle: React.CSSProperties = {
  padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
  border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
};
