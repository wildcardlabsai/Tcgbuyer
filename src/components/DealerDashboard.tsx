import React from 'react';
import { Logo } from './Logo';
import { StatusBadge } from './StatusBadge';
import { SearchIcon, DashboardIcon, InboxIcon, SendIcon, ShoppingBagIcon, UsersIcon, TagIcon, SettingsIcon, EnvelopeIcon, ClockIcon, CheckIcon } from './Icons';
import { submissions, recentActivity, dashboardStats } from '../data/sampleData';

const sidebarItems = [
  { icon: <DashboardIcon />, label: 'Dashboard', active: true },
  { icon: <InboxIcon />, label: 'Submissions' },
  { icon: <SendIcon />, label: 'Offers' },
  { icon: <ShoppingBagIcon />, label: 'Purchases' },
  { icon: <UsersIcon />, label: 'Customers' },
  { icon: <TagIcon />, label: 'Price Lists' },
  { icon: <SettingsIcon />, label: 'Settings' },
];

const statCards = [
  { value: dashboardStats.newSubmissions, label: 'New Submissions', color: 'var(--color-blue)', icon: <EnvelopeIcon /> },
  { value: dashboardStats.awaitingReview, label: 'Awaiting Review', color: 'var(--color-amber)', icon: <ClockIcon /> },
  { value: dashboardStats.offersSent, label: 'Offers Sent', color: 'var(--color-violet)', icon: <SendIcon /> },
  { value: dashboardStats.completedPurchases, label: 'Completed', color: 'var(--color-green)', icon: <CheckIcon /> },
];

const activityIcons: Record<string, React.ReactNode> = {
  submission: <EnvelopeIcon />,
  offer: <SendIcon />,
  accepted: <CheckIcon />,
  purchase: <ShoppingBagIcon />,
};

export const DealerDashboard: React.FC = () => (
  <div style={{
    background: 'var(--color-white)',
    borderRadius: '14px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    maxWidth: '1020px',
    margin: '0 auto',
    border: '1px solid var(--color-border)',
    fontSize: '0.82rem',
  }}>
    {/* Sidebar */}
    <div style={{
      width: '190px',
      minWidth: '190px',
      background: 'var(--color-navy)',
      padding: '22px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    }} className="dashboard-sidebar">
      <div style={{ padding: '0 18px', marginBottom: '22px' }}>
        <Logo height={24} />
      </div>
      {sidebarItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '11px 18px',
            color: item.active ? '#fff' : 'rgba(255,255,255,0.55)',
            background: item.active ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderLeft: item.active ? '3px solid var(--color-blue)' : '3px solid transparent',
            fontSize: '0.82rem',
            fontWeight: item.active ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>

    {/* Main content */}
    <div style={{ flex: 1, padding: '20px 24px', background: 'var(--color-bg)', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-text-muted)',
          background: 'var(--color-white)',
          padding: '7px 14px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          border: '1px solid var(--color-border)',
          flex: 1,
          maxWidth: '280px',
        }}>
          <SearchIcon />
          Search submissions, customers...
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: 'var(--color-navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.65rem', fontWeight: 700,
          }}>TV</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>The Card Vault</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)' }}>Dealer Account</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Dashboard</h2>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }} className="stat-cards">
        {statCards.map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--color-white)',
            borderRadius: '10px',
            padding: '14px 16px',
            border: '1px solid var(--color-border)',
            borderTop: `3px solid ${stat.color}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>{stat.value}</span>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }} className="dashboard-columns">
        {/* Recent submissions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Recent Submissions</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-blue)', fontWeight: 500, cursor: 'pointer' }}>View all &rarr;</span>
          </div>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  {['Reference', 'Date', 'Collection', 'Cards', 'Est. Value', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.68rem', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 5).map((s) => (
                  <tr key={s.reference} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-blue)' }}>{s.reference}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>{s.date}</td>
                    <td style={{ padding: '10px 12px' }}>{s.collection}</td>
                    <td style={{ padding: '10px 12px' }}>{s.cards}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.estValue}</td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Recent Activity</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-blue)', fontWeight: 500, cursor: 'pointer' }}>View all &rarr;</span>
          </div>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            padding: '6px 10px',
          }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                padding: '11px 6px',
                borderBottom: i < recentActivity.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--color-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--color-blue)',
                }}>
                  {activityIcons[a.icon]}
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 500, lineHeight: 1.45 }}>{a.text}</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
