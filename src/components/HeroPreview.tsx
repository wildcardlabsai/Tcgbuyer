import React from 'react';
import { Logo } from './Logo';
import { StatusBadge } from './StatusBadge';
import { SearchIcon, DashboardIcon, InboxIcon, SendIcon, ShoppingBagIcon, UsersIcon } from './Icons';
import { submissions, portalCards } from '../data/sampleData';

const sidebarItems = [
  { icon: <DashboardIcon />, label: 'Dashboard', active: false },
  { icon: <InboxIcon />, label: 'Submissions', active: true },
  { icon: <SendIcon />, label: 'Offers', active: false },
  { icon: <ShoppingBagIcon />, label: 'Purchases', active: false },
  { icon: <UsersIcon />, label: 'Customers', active: false },
];

const tabs = ['All', 'New', 'Review', 'Offer Sent', 'Completed', 'Declined'];

export const HeroPreview: React.FC = () => {
  const totalCards = portalCards.reduce((sum, c) => sum + c.count, 0);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Submissions panel */}
      <div style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        display: 'flex',
        border: '1px solid var(--color-border)',
        fontSize: '0.75rem',
      }}>
        {/* Mini sidebar */}
        <div style={{
          width: '160px',
          minWidth: '160px',
          background: 'var(--color-navy)',
          padding: 'var(--space-md) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
        }} className="hero-sidebar">
          <div style={{ padding: '0 var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <Logo height={20} />
          </div>
          {sidebarItems.map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px var(--space-md)',
              color: item.active ? '#fff' : 'rgba(255,255,255,0.55)',
              background: item.active ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: item.active ? '3px solid var(--color-blue)' : '3px solid transparent',
              fontSize: '0.75rem',
              fontWeight: item.active ? 600 : 400,
            }}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px var(--space-md)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
              <SearchIcon />
              <span style={{ fontSize: '0.72rem' }}>Search submissions, customers...</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--color-navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.6rem', fontWeight: 700,
              }}>TV</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.68rem' }}>The Card Vault</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>Dealer Account</div>
              </div>
            </div>
          </div>

          {/* Submissions header + tabs */}
          <div style={{ padding: 'var(--space-md) var(--space-md) 0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Submissions</h3>
            <div style={{ display: 'flex', gap: 'var(--space-md)', borderBottom: '2px solid var(--color-border)' }}>
              {tabs.map((tab, i) => (
                <span key={tab} style={{
                  fontSize: '0.7rem',
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? 'var(--color-blue)' : 'var(--color-text-muted)',
                  paddingBottom: '8px',
                  borderBottom: i === 0 ? '2px solid var(--color-blue)' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}>
                  {tab}
                </span>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div style={{ padding: 'var(--space-sm) var(--space-md)' }}>
            <div style={{
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.68rem',
              color: 'var(--color-text-muted)',
            }}>
              <SearchIcon /> Search submissions...
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: '0 var(--space-md) var(--space-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem' }}>
              <thead>
                <tr>
                  {['Reference', 'Date', 'Collection', 'Cards', 'Est. Value', 'Status'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 8px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      fontSize: '0.62rem',
                      borderBottom: '1px solid var(--color-border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.reference} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '7px 8px', fontWeight: 600, color: 'var(--color-blue)' }}>{s.reference}</td>
                    <td style={{ padding: '7px 8px', color: 'var(--color-text-muted)' }}>{s.date}</td>
                    <td style={{ padding: '7px 8px' }}>{s.collection}</td>
                    <td style={{ padding: '7px 8px' }}>{s.cards}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 600 }}>{s.estValue}</td>
                    <td style={{ padding: '7px 8px' }}><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer portal overlay */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        right: '-16px',
        width: '280px',
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        zIndex: 5,
        fontSize: '0.72rem',
      }}>
        {/* Portal header */}
        <div style={{
          background: 'var(--color-navy)',
          padding: '10px var(--space-md)',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Submit Your Cards</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem' }}>Get a quick and fair offer for your cards. It&rsquo;s simple, secure and free to use.</div>
        </div>

        {/* Upload area */}
        <div style={{ padding: 'var(--space-md)' }}>
          <div style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            textAlign: 'center',
            marginBottom: 'var(--space-md)',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, marginBottom: '2px' }}>Upload photos of your cards</div>
            <div style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>Drag and drop your images here, or click to browse</div>
          </div>

          {/* Photo thumbnails row */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: 'var(--space-md)',
          }}>
            {['/images/cards-stacked.png', '/images/cards-grid.png', '/images/cards-collection.png', '/images/cards-display.png', '/images/cards-graded.png'].map((src, i) => (
              <div key={i} style={{
                width: '40px',
                height: '40px',
                borderRadius: '4px',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              border: '1.5px dashed var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}>+</div>
          </div>

          {/* Collection summary */}
          <div style={{
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>Collection Summary</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{totalCards} cards added</span>
            </div>
            {portalCards.map((card, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
                fontSize: '0.65rem',
              }}>
                <span>{card.game}</span>
                <span style={{ fontWeight: 600 }}>{card.value}</span>
              </div>
            ))}
            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Estimated Offer</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>£850 – £950</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)' }}>Final offer after review</div>
            </div>
            <button style={{
              width: '100%',
              marginTop: '10px',
              background: 'var(--color-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '8px',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Submit Collection &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
