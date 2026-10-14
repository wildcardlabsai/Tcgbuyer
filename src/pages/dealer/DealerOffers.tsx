import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Offer } from '../../lib/database.types';

const statusColors: Record<string, { bg: string; color: string }> = {
  draft: { bg: '#f3f4f6', color: '#6b7280' },
  sent: { bg: '#fef3c7', color: '#92400e' },
  accepted: { bg: '#dcfce7', color: '#166534' },
  declined: { bg: '#fee2e2', color: '#991b1b' },
  expired: { bg: '#f3f4f6', color: '#6b7280' },
  revised: { bg: '#e0e7ff', color: '#3730a3' },
};

interface OfferWithSubmission extends Offer {
  customer_submissions: { reference: string; customer_name: string } | null;
}

export const DealerOffers: React.FC = () => {
  const { organisation } = useAuth();
  const [offers, setOffers] = useState<OfferWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!organisation) return;
    async function load() {
      setLoading(true);
      let q = supabase
        .from('offers')
        .select('*, customer_submissions(reference, customer_name)')
        .eq('organisation_id', organisation!.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') q = q.eq('status', filter);

      const { data } = await q;
      setOffers((data || []) as OfferWithSubmission[]);
      setLoading(false);
    }
    load();
  }, [organisation, filter]);

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Offers</h1>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: filter === f.value ? 'var(--color-navy)' : '#f3f4f6',
            color: filter === f.value ? '#fff' : '#6b7280',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : offers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No offers found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={thStyle}>Submission</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => {
                const sc = statusColors[o.status] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}>
                      <Link to={`/app/submissions/${o.submission_id}`} style={{ color: 'var(--color-blue)', fontWeight: 600 }}>
                        {o.customer_submissions?.reference || '—'}
                      </Link>
                    </td>
                    <td style={tdStyle}>{o.customer_submissions?.customer_name || '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--color-navy)' }}>£{o.amount.toLocaleString()}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' };
const tdStyle: React.CSSProperties = { padding: '12px 16px' };
