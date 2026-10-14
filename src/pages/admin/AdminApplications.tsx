import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DealerApplication } from '../../lib/database.types';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'info_requested', label: 'Info Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  draft: { bg: '#f3f4f6', color: '#6b7280' },
  submitted: { bg: '#dbeafe', color: '#1e40af' },
  under_review: { bg: '#fef3c7', color: '#92400e' },
  info_requested: { bg: '#f3e8ff', color: '#7c3aed' },
  approved: { bg: '#dcfce7', color: '#166534' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  withdrawn: { bg: '#f3f4f6', color: '#6b7280' },
};

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<DealerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from('dealer_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        q = q.eq('status', filter);
      }

      const { data } = await q;
      setApplications((data || []) as DealerApplication[]);
      setLoading(false);
    }
    load();
  }, [filter]);

  const filtered = applications.filter(app => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      app.business_name.toLowerCase().includes(s) ||
      app.reference.toLowerCase().includes(s) ||
      app.email.toLowerCase().includes(s) ||
      app.applicant_name.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Applications</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, email, reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '8px 14px', borderRadius: '8px',
            border: '1px solid var(--color-border)', fontSize: '0.88rem', fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: filter === f.value ? 'var(--color-navy)' : '#f3f4f6',
                color: filter === f.value ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            No applications found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Reference</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Business</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Applicant</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => {
                const sc = statusColors[app.status] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/admin/applications/${app.id}`} style={{ color: 'var(--color-blue)', fontWeight: 600 }}>
                        {app.reference}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{app.business_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{app.applicant_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{app.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
                        fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize',
                      }}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {new Date(app.created_at).toLocaleDateString()}
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
