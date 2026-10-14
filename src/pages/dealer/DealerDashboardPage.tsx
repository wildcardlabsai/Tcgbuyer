import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Inbox, Send, Users, DollarSign } from 'lucide-react';

interface Stats {
  submissions: number;
  pendingOffers: number;
  customers: number;
  totalOfferValue: number;
}

interface RecentSubmission {
  id: string;
  reference: string;
  customer_name: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  submitted: { bg: '#dbeafe', color: '#1e40af' },
  under_review: { bg: '#fef3c7', color: '#92400e' },
  offer_prepared: { bg: '#e0e7ff', color: '#3730a3' },
  offer_sent: { bg: '#fef3c7', color: '#92400e' },
  offer_accepted: { bg: '#dcfce7', color: '#166534' },
  offer_declined: { bg: '#fee2e2', color: '#991b1b' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280' },
};

export const DealerDashboardPage: React.FC = () => {
  const { organisation } = useAuth();
  const [stats, setStats] = useState<Stats>({ submissions: 0, pendingOffers: 0, customers: 0, totalOfferValue: 0 });
  const [recent, setRecent] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organisation) return;
    async function load() {
      const orgId = organisation!.id;
      const [subs, offers, customers, recentSubs] = await Promise.all([
        supabase.from('customer_submissions').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId),
        supabase.from('offers').select('amount').eq('organisation_id', orgId).in('status', ['draft', 'sent']),
        supabase.from('customer_submissions').select('customer_email').eq('organisation_id', orgId),
        supabase.from('customer_submissions').select('id, reference, customer_name, status, created_at').eq('organisation_id', orgId).order('created_at', { ascending: false }).limit(5),
      ]);

      const uniqueEmails = new Set((customers.data || []).map((c: { customer_email: string }) => c.customer_email.toLowerCase()));
      const totalVal = (offers.data || []).reduce((sum: number, o: { amount: number }) => sum + o.amount, 0);

      setStats({
        submissions: subs.count || 0,
        pendingOffers: (offers.data || []).length,
        customers: uniqueEmails.size,
        totalOfferValue: totalVal,
      });
      setRecent((recentSubs.data || []) as RecentSubmission[]);
      setLoading(false);
    }
    load();
  }, [organisation]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;
  }

  const cards = [
    { label: 'Submissions', value: stats.submissions, icon: Inbox, color: '#3b82f6', bg: '#dbeafe', to: '/app/submissions' },
    { label: 'Pending Offers', value: stats.pendingOffers, icon: Send, color: '#f59e0b', bg: '#fef3c7', to: '/app/offers' },
    { label: 'Customers', value: stats.customers, icon: Users, color: '#10b981', bg: '#d1fae5', to: '/app/customers' },
    { label: 'Offer Value', value: `£${stats.totalOfferValue.toLocaleString()}`, icon: DollarSign, color: '#8b5cf6', bg: '#ede9fe', to: '/app/offers' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
        Welcome back, {organisation?.name}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {cards.map(card => (
          <Link key={card.label} to={card.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)',
              padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={22} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>{card.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{card.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {organisation && (
        <div style={{ background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: '#0369a1' }}>Your Buying Portal</h3>
          <p style={{ fontSize: '0.85rem', color: '#0c4a6e', marginBottom: '8px' }}>
            Share this link with customers so they can submit their collections:
          </p>
          <code style={{ fontSize: '0.82rem', background: '#fff', padding: '8px 12px', borderRadius: '6px', display: 'inline-block', border: '1px solid #bae6fd' }}>
            {window.location.origin}/portal/{organisation.slug}
          </code>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Submissions</h2>
          <Link to="/app/submissions" style={{ fontSize: '0.82rem', color: 'var(--color-blue)', fontWeight: 600 }}>View all</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            No submissions yet. Share your portal link to start receiving collections.
          </div>
        ) : (
          <div>
            {recent.map(sub => {
              const sc = statusColors[sub.status] || { bg: '#f3f4f6', color: '#374151' };
              return (
                <Link
                  key={sub.id}
                  to={`/app/submissions/${sub.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: '1px solid var(--color-border)',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.customer_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {sub.reference} &middot; {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
                    fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize',
                  }}>
                    {sub.status.replace(/_/g, ' ')}
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
