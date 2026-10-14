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
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        display: 'flex',
        border: '1px solid var(--color-border)',
        fontSize: '0.78rem',
      }}>
        {/* Mini sidebar */}
        <div style={{
          width: '170px',
          minWidth: '170px',
          background: 'var(--color-navy)',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
        }} className="hero-sidebar">
          <div style={{ padding: '0 16px', marginBottom: '20px' }}>
            <Logo height={22} />
          </div>
          {sidebarItems.map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              color: item.active ? '#fff' : 'rgba(255,255,255,0.5)',
              background: item.active ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: item.active ? '3px solid var(--color-blue)' : '3px solid transparent',
              fontSize: '0.78rem',
              fontWeight: item.active ? 600 : 400,
            }}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0, background: 'var(--color-white)' }}>
          {/* Top bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              flex: 1,
              maxWidth: '260px',
            }}>
              <SearchIcon />
              Search submissions, customers...
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--color-navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.62rem', fontWeight: 700,
              }}>TV</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.72rem' }}>The Card Vault</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Dealer Account</div>
              </div>
            </div>
          </div>

          {/* Submissions header + tabs */}
          <div style={{ padding: '16px 20px 0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>Submissions</h3>
            <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid var(--color-border)' }}>
              {tabs.map((tab, i) => (
                <span key={tab} style={{
                  fontSize: '0.74rem',
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? 'var(--color-blue)' : 'var(--color-text-muted)',
                  paddingBottom: '10px',
                  borderBottom: i === 0 ? '2px solid var(--color-blue)' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}>
                  {tab}
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: '12px 20px 16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
              <thead>
                <tr>
                  {['Reference', 'Date', 'Collection', 'Cards', 'Est. Value', 'Status'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 10px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      fontSize: '0.66rem',
                      borderBottom: '1px solid var(--color-border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.reference} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: 'var(--color-blue)' }}>{s.reference}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--color-text-muted)' }}>{s.date}</td>
                    <td style={{ padding: '9px 10px' }}>{s.collection}</td>
                    <td style={{ padding: '9px 10px' }}>{s.cards}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600 }}>{s.estValue}</td>
                    <td style={{ padding: '9px 10px' }}><StatusBadge status={s.status} /></td>
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
        bottom: '-48px',
        right: '-20px',
        width: '300px',
        background: 'var(--color-white)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        zIndex: 5,
        fontSize: '0.75rem',
      }}>
        <div style={{
          background: 'var(--color-navy)',
          padding: '14px 16px',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '3px' }}>Submit Your Cards</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.66rem' }}>Get a quick and fair offer for your cards. It&rsquo;s simple, secure and free to use.</div>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {/* Upload area */}
          <div style={{
            border: '1.5px dashed var(--color-border)',
            borderRadius: '8px',
            padding: '14px',
            textAlign: 'center',
            marginBottom: '12px',
            background: 'var(--color-bg)',
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, marginBottom: '3px' }}>Upload photos of your cards</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Drag and drop your images here, or click to browse</div>
          </div>

          {/* Photo thumbnails */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '14px' }}>
            {['/images/cards-fanned.png', '/images/cards-grid.png', '/images/cards-collection.png', '/images/cards-display.png', '/images/cards-graded.png'].map((src, i) => (
              <div key={i} style={{
                width: '42px', height: '42px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
            <div style={{
              width: '42px', height: '42px', borderRadius: '5px',
              border: '1.5px dashed var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)', fontSize: '1.1rem', flexShrink: 0,
            }}>+</div>
          </div>

          {/* Collection summary */}
          <div style={{
            background: 'var(--color-bg)',
            borderRadius: '8px',
            padding: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.74rem' }}>Collection Summary</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>{totalCards} cards added</span>
            </div>
            {portalCards.map((card, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.68rem',
              }}>
                <span>{card.game}</span>
                <span style={{ fontWeight: 600 }}>{card.value}</span>
              </div>
            ))}
            <div style={{
              marginTop: '12px', paddingTop: '12px',
              borderTop: '1px solid var(--color-border)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', marginBottom: '3px' }}>Estimated Offer</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>£850 – £950</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Final offer after review</div>
            </div>
            <button style={{
              width: '100%', marginTop: '10px',
              background: 'var(--color-blue)', color: '#fff',
              border: 'none', borderRadius: '6px', padding: '9px',
              fontWeight: 700, fontSize: '0.74rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Submit Collection &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
