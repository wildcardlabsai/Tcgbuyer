import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/database.types';

const roleColors: Record<string, { bg: string; color: string }> = {
  platform_admin: { bg: '#fee2e2', color: '#991b1b' },
  dealer_owner: { bg: '#dbeafe', color: '#1e40af' },
  dealer_manager: { bg: '#e0e7ff', color: '#3730a3' },
  dealer_staff: { bg: '#f0fdf4', color: '#166534' },
  customer: { bg: '#f3f4f6', color: '#6b7280' },
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers((data || []) as Profile[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.email.toLowerCase().includes(s) || (u.full_name || '').toLowerCase().includes(s);
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Users</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text" placeholder="Search users..."
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>No users found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rc = roleColors[u.role] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}><span style={{ fontWeight: 600 }}>{u.full_name || '—'}</span></td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: rc.bg, color: rc.color, textTransform: 'capitalize' }}>
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
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
