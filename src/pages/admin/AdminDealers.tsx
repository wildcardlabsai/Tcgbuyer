import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { DealerOrganisation } from '../../lib/database.types';

const statusColors: Record<string, { bg: string; color: string }> = {
  onboarding: { bg: '#fef3c7', color: '#92400e' },
  active: { bg: '#dcfce7', color: '#166534' },
  suspended: { bg: '#fee2e2', color: '#991b1b' },
  closed: { bg: '#f3f4f6', color: '#6b7280' },
};

export const AdminDealers: React.FC = () => {
  const [dealers, setDealers] = useState<DealerOrganisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dealer_organisations')
        .select('*')
        .order('created_at', { ascending: false });
      setDealers((data || []) as DealerOrganisation[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = dealers.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.name.toLowerCase().includes(s) || d.slug.toLowerCase().includes(s) || (d.contact_email || '').toLowerCase().includes(s);
  });

  async function toggleStatus(dealer: DealerOrganisation) {
    const newStatus = dealer.status === 'suspended' ? 'active' : 'suspended';
    const extra: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'suspended') {
      extra.suspended_at = new Date().toISOString();
      extra.suspended_reason = 'Suspended by admin';
    } else {
      extra.suspended_at = null;
      extra.suspended_reason = null;
    }
    const { error } = await supabase.from('dealer_organisations').update(extra).eq('id', dealer.id);
    if (!error) {
      setDealers(prev => prev.map(d => d.id === dealer.id ? { ...d, ...extra } as DealerOrganisation : d));
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Dealers</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text" placeholder="Search dealers..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: '400px', padding: '8px 14px', borderRadius: '8px',
            border: '1px solid var(--color-border)', fontSize: '0.88rem', fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No dealers found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const sc = statusColors[d.status] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}><span style={{ fontWeight: 600 }}>{d.name}</span></td>
                    <td style={tdStyle}><code style={{ fontSize: '0.8rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{d.slug}</code></td>
                    <td style={tdStyle}>{d.contact_email || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      {(d.status === 'active' || d.status === 'suspended') && (
                        <button onClick={() => toggleStatus(d)} style={{
                          padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
                          border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                          {d.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
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
