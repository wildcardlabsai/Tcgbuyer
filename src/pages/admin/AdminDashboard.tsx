import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Inbox, ShoppingBag, Users, Clock } from 'lucide-react';

interface Stats {
  totalApplications: number;
  pendingApplications: number;
  totalDealers: number;
  activeDealers: number;
  totalUsers: number;
}

interface RecentApplication {
  id: string;
  reference: string;
  business_name: string;
  status: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalApplications: 0, pendingApplications: 0, totalDealers: 0, activeDealers: 0, totalUsers: 0 });
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [apps, pendingApps, dealers, activeDealers, users, recent] = await Promise.all([
        supabase.from('dealer_applications').select('id', { count: 'exact', head: true }),
        supabase.from('dealer_applications').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
        supabase.from('dealer_organisations').select('id', { count: 'exact', head: true }),
        supabase.from('dealer_organisations').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('dealer_applications').select('id, reference, business_name, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalApplications: apps.count || 0,
        pendingApplications: pendingApps.count || 0,
        totalDealers: dealers.count || 0,
        activeDealers: activeDealers.count || 0,
        totalUsers: users.count || 0,
      });
      setRecentApps((recent.data || []) as RecentApplication[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Pending Applications', value: stats.pendingApplications, icon: Clock, color: '#f59e0b', bg: '#fef3c7', to: '/admin/applications' },
    { label: 'Total Applications', value: stats.totalApplications, icon: Inbox, color: '#3b82f6', bg: '#dbeafe', to: '/admin/applications' },
    { label: 'Active Dealers', value: stats.activeDealers, icon: ShoppingBag, color: '#10b981', bg: '#d1fae5', to: '/admin/dealers' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#8b5cf6', bg: '#ede9fe', to: '/admin/users' },
  ];

  const statusColors: Record<string, { bg: string; color: string }> = {
    submitted: { bg: '#dbeafe', color: '#1e40af' },
    under_review: { bg: '#fef3c7', color: '#92400e' },
    info_requested: { bg: '#f3e8ff', color: '#7c3aed' },
    approved: { bg: '#dcfce7', color: '#166534' },
    rejected: { bg: '#fee2e2', color: '#991b1b' },
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map(card => (
          <Link key={card.label} to={card.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)',
              padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
              transition: 'box-shadow 0.15s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '10px', background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={22} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)' }}>{card.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{card.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Applications</h2>
          <Link to="/admin/applications" style={{ fontSize: '0.82rem', color: 'var(--color-blue)', fontWeight: 600 }}>View all</Link>
        </div>
        {recentApps.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            No applications yet.
          </div>
        ) : (
          <div>
            {recentApps.map(app => {
              const sc = statusColors[app.status] || { bg: '#f3f4f6', color: '#374151' };
              return (
                <Link
                  key={app.id}
                  to={`/admin/applications/${app.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: '1px solid var(--color-border)',
                    textDecoration: 'none', color: 'inherit', transition: 'background 0.1s',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.business_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {app.reference} &middot; {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
                    fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize',
                  }}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
