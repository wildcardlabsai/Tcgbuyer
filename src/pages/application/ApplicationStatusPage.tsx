import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/Logo';
import type { DealerApplication } from '../../lib/database.types';

const statusDisplay: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Submitted', color: '#1e40af', bg: '#dbeafe' },
  under_review: { label: 'Under Review', color: '#92400e', bg: '#fef3c7' },
  info_requested: { label: 'More Info Requested', color: '#9333ea', bg: '#f3e8ff' },
  approved: { label: 'Approved', color: '#166534', bg: '#dcfce7' },
  rejected: { label: 'Not Approved', color: '#991b1b', bg: '#fee2e2' },
  withdrawn: { label: 'Withdrawn', color: '#6b7280', bg: '#f3f4f6' },
};

export const ApplicationStatusPage: React.FC = () => {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<DealerApplication | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setApplication(null);
    setLoading(true);

    const { data, error: err } = await supabase
      .from('dealer_applications')
      .select('*')
      .eq('reference', reference.trim().toUpperCase())
      .eq('email', email.trim().toLowerCase())
      .single();

    setLoading(false);
    if (err || !data) {
      setError('No application found with that reference and email combination.');
    } else {
      setApplication(data as DealerApplication);
    }
  };

  const status = application ? statusDisplay[application.status] : null;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '16px', paddingTop: 'calc(var(--nav-height) + 32px)',
    }}>
      <div style={{
        width: '100%', maxWidth: '480px', background: 'var(--color-white)',
        borderRadius: '16px', border: '1px solid var(--color-border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '40px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Application Status</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Enter your application reference and email to check your status
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem',
          }}>{error}</div>
        )}

        <form onSubmit={handleCheck}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Application reference</label>
            <input
              type="text" required value={reference} onChange={e => setReference(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="APP-00001"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: 'var(--color-blue)', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Checking...' : 'Check status'}
          </button>
        </form>

        {application && status && (
          <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{application.reference}</span>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.78rem', fontWeight: 600, background: status.bg, color: status.color,
              }}>
                {status.label}
              </span>
            </div>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{application.business_name}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Submitted {new Date(application.created_at).toLocaleDateString()}
            </p>
            {application.status === 'info_requested' && application.info_request_message && (
              <div style={{
                marginTop: '12px', padding: '12px', background: '#f3e8ff', borderRadius: '8px',
                fontSize: '0.85rem', color: '#7c3aed', lineHeight: 1.5,
              }}>
                <strong>Information requested:</strong> {application.info_request_message}
              </div>
            )}
            {application.status === 'rejected' && application.rejection_reason_applicant && (
              <div style={{
                marginTop: '12px', padding: '12px', background: '#fef2f2', borderRadius: '8px',
                fontSize: '0.85rem', color: '#dc2626', lineHeight: 1.5,
              }}>
                {application.rejection_reason_applicant}
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <Link to="/apply" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Submit a new application</Link>
        </p>
      </div>
    </div>
  );
};
