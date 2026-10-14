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
  { value: dashboardStats.completedPurchases, label: 'Completed Purchases', color: 'var(--color-green)', icon: <CheckIcon /> },
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
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    border: '1px solid var(--color-border)',
    fontSize: '0.8rem',
  }}>
    {/* Sidebar */}
    <div style={{
      width: '180px',
      minWidth: '180px',
      background: 'var(--color-navy)',
      padding: 'var(--space-lg) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    }} className="dashboard-sidebar">
      <div style={{ padding: '0 var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <Logo height={22} />
      </div>
      {sidebarItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: '10px var(--space-md)',
            color: item.active ? '#fff' : 'rgba(255,255,255,0.6)',
            background: item.active ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: item.active ? '3px solid var(--color-blue)' : '3px solid transparent',
            fontSize: '0.8rem',
            fontWeight: item.active ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>

    {/* Main content */}
    <div style={{ flex: 1, padding: 'var(--space-lg)', background: 'var(--color-bg)', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div style={{ position: 'relative' }}>
          <SearchIcon />
          <span style={{ marginLeft: '8px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Search submissions, customers...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 700,
          }}>TV</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>The Card Vault</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Dealer Account</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Dashboard</h2>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }} className="stat-cards">
        {statCards.map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            border: '1px solid var(--color-border)',
            borderTop: `3px solid ${stat.color}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{stat.value}</span>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-md)' }} className="dashboard-columns">
        {/* Recent submissions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Recent Submissions</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: 500, cursor: 'pointer' }}>View all &rarr;</span>
          </div>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  {['Reference', 'Date', 'Collection', 'Cards', 'Est. Value', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.65rem', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 5).map((s) => (
                  <tr key={s.reference} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-blue)' }}>{s.reference}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--color-text-muted)' }}>{s.date}</td>
                    <td style={{ padding: '8px 10px' }}>{s.collection}</td>
                    <td style={{ padding: '8px 10px' }}>{s.cards}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{s.estValue}</td>
                    <td style={{ padding: '8px 10px' }}><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Recent Activity</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: 500, cursor: 'pointer' }}>View all &rarr;</span>
          </div>
          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-sm)',
          }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                padding: '10px 8px',
                borderBottom: i < recentActivity.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-blue)',
                }}>
                  {activityIcons[a.icon]}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
