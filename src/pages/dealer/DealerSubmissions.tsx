import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { CustomerSubmission } from '../../lib/database.types';

const statusColors: Record<string, { bg: string; color: string }> = {
  submitted: { bg: '#dbeafe', color: '#1e40af' },
  under_review: { bg: '#fef3c7', color: '#92400e' },
  awaiting_info: { bg: '#f3e8ff', color: '#7c3aed' },
  offer_prepared: { bg: '#e0e7ff', color: '#3730a3' },
  offer_sent: { bg: '#fef3c7', color: '#92400e' },
  offer_accepted: { bg: '#dcfce7', color: '#166534' },
  offer_declined: { bg: '#fee2e2', color: '#991b1b' },
  purchase_arranging: { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280' },
};

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'New' },
  { value: 'under_review', label: 'Reviewing' },
  { value: 'offer_sent', label: 'Offer Sent' },
  { value: 'offer_accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
];

export const DealerSubmissions: React.FC = () => {
  const { organisation } = useAuth();
  const [submissions, setSubmissions] = useState<CustomerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organisation) return;
    async function load() {
      setLoading(true);
      let q = supabase
        .from('customer_submissions')
        .select('*')
        .eq('organisation_id', organisation!.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') q = q.eq('status', filter);

      const { data } = await q;
      setSubmissions((data || []) as CustomerSubmission[]);
      setLoading(false);
    }
    load();
  }, [organisation, filter]);

  const filtered = submissions.filter(s => {
    if (!search) return true;
    const term = search.toLowerCase();
    return s.customer_name.toLowerCase().includes(term) || s.reference.toLowerCase().includes(term) || s.customer_email.toLowerCase().includes(term);
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Submissions</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '8px 14px', borderRadius: '8px',
            border: '1px solid var(--color-border)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {statusFilters.map(f => (
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
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No submissions found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={thStyle}>Reference</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Categories</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const sc = statusColors[s.status] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}>
                      <Link to={`/app/submissions/${s.id}`} style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{s.reference}</Link>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{s.customer_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{s.customer_email}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(s.tcg_categories || []).slice(0, 2).map(c => (
                          <span key={c} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', background: '#f1f5f9', color: '#475569' }}>{c}</span>
                        ))}
                        {(s.tcg_categories || []).length > 2 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>+{s.tcg_categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {new Date(s.created_at).toLocaleDateString()}
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
