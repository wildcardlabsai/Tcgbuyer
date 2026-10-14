import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface CustomerRow {
  email: string;
  name: string;
  submissionCount: number;
  latestSubmissionId: string;
  latestDate: string;
}

export const DealerCustomers: React.FC = () => {
  const { organisation } = useAuth();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organisation) return;
    async function load() {
      const { data } = await supabase
        .from('customer_submissions')
        .select('id, customer_name, customer_email, created_at')
        .eq('organisation_id', organisation!.id)
        .order('created_at', { ascending: false });

      const byEmail = new Map<string, CustomerRow>();
      for (const s of (data || []) as { id: string; customer_name: string; customer_email: string; created_at: string }[]) {
        const key = s.customer_email.toLowerCase();
        const existing = byEmail.get(key);
        if (existing) {
          existing.submissionCount++;
        } else {
          byEmail.set(key, {
            email: s.customer_email,
            name: s.customer_name,
            submissionCount: 1,
            latestSubmissionId: s.id,
            latestDate: s.created_at,
          });
        }
      }
      setCustomers(Array.from(byEmail.values()));
      setLoading(false);
    }
    load();
  }, [organisation]);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Customers</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text" placeholder="Search customers..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: '400px', padding: '8px 14px', borderRadius: '8px',
            border: '1px solid var(--color-border)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No customers yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Submissions</th>
                <th style={thStyle}>Latest</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.email} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={tdStyle}><span style={{ fontWeight: 600 }}>{c.name}</span></td>
                  <td style={tdStyle}>{c.email}</td>
                  <td style={tdStyle}>{c.submissionCount}</td>
                  <td style={tdStyle}>
                    <Link to={`/app/submissions/${c.latestSubmissionId}`} style={{ color: 'var(--color-blue)', fontSize: '0.82rem' }}>
                      {new Date(c.latestDate).toLocaleDateString()}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem' };
const tdStyle: React.CSSProperties = { padding: '12px 16px' };
