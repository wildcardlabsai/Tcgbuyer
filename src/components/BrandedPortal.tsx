import React from 'react';
import { CheckCircle } from './Icons';
import { CustomerPortal } from './CustomerPortal';

const features = [
  'Branded buying portal for your shop',
  'Simple, easy-to-use submission process',
  'Manage offers and communication',
  'Keep everything in one place',
];

export const BrandedPortal: React.FC = () => (
  <section style={{ padding: 'var(--space-4xl) 0', background: 'var(--color-white)' }}>
    <div className="container">
      <div className="portal-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-3xl)',
        alignItems: 'center',
      }}>
        <div>
          <p className="section-label">MADE FOR YOUR SHOP</p>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 'var(--space-lg)',
            letterSpacing: '-0.02em',
          }}>
            Your buying process.<br />Your brand. Your customers.
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            marginBottom: 'var(--space-xl)',
            maxWidth: '480px',
          }}>
            TCGBuyer is designed to help independent card shops and established TCG businesses create a more organised way to buy collections, without making the process feel complicated for their customers.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {features.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.98rem', fontWeight: 500 }}>
                <CheckCircle size={20} /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CustomerPortal />
        </div>
      </div>
    </div>
  </section>
);
